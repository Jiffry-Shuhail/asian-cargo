$('.content-wrapper').addClass('d-none');
$('#loader').removeClass('d-none');
$('#customerSearch').removeClass('d-none');
$('.editgoods-modal').load('/app/model/editGoods.html');

var goodsData = null;

var GOODSTABLE = null;
var CURRENT_INDEX = 1;
var ROW_COUNT = 6;
var IS_INITIAL = true;

$(function () {

    $('#search-prepend').attr('style', 'width: 110px; max-height: 40px');
    $('#search-goods-type').removeClass('d-none');
    $('#search-goods-type').parent().removeClass('d-none');

    $.get("/getActiveCategory", function (data, status) {
        var response = JSON.parse(data);
        var categorytData = response.data;
        for (var key in categorytData) {
            $(`#category`).append(`<option value="${categorytData[key].name.trim()}">
            ${categorytData[key].name.trim()}</option>`);
        }
        $(`.ui.fluid.dropdown`).dropdown();
        $('#search-goods-type').parent().attr('style', 'width: 110px; max-height: 40px; margin-left: -10px');
        $('#save-goods').click(updateGoods);
    });

    GOODSTABLE = $('#goodsTable').DataTable({
        order: [[1, "asc"]],
        lengthMenu: [[6, 25, 50, 100, -1], [6, 25, 50, 100, "All"]],
        columnDefs: [
            {
                targets: [0, 1],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '50%');
                }
            },
            {
                targets: [2],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '1%');
                    $(td).css('padding', '0');
                }
            }],
        drawCallback: function (settings) {
            $(`.edit-good`).click(openModel);
            $(`.remove-good`).click(deActivate);
            var info = GOODSTABLE.page.info();
            if (IS_INITIAL) {
                var pagesx = new Array(info.pages).fill(null).map((_, i) => {
                    var result = i == 0 ? { name: i + 1, value: i + 1, selected: true } : { name: i + 1, value: i + 1 };
                    return result;
                });
                $('#goodsPages').dropdown({
                    selectOnKeydown: false,
                    values: pagesx,
                    allowReselection: false,
                    onChange: function (value, text, $selectedItem) {
                        if ((!IS_INITIAL || CURRENT_INDEX !== 1) && value) {
                            IS_INITIAL = false;
                            GOODSTABLE.page(CURRENT_INDEX - 1).draw('page');
                            CURRENT_INDEX = parseInt(value);
                        }
                        setGoodsTableInfo();
                    }
                });
            }
        },
        processing: true,
        language: {
            processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        serverSide: true,
        ajax: {
            url: '/getAllActiveProduct',
            type: 'POST',
            beforeSend: request => request.setRequestHeader('CSRF-Token', Cookies.get('XSRF-TOKEN'))
        },
        columns: [
            { data: 'name' },
            { data: 'category' },
            { data: 'editButton' }
        ],
        initComplete: function (settings, json) {
            $('#goodsTable_info').hide();
            $('#goodsTable_filter').hide();
            $('#goodsTable_length').hide();
            $('#goodsTable_paginate').hide();
            $('.content-wrapper').removeClass('d-none');
            $('#loader').addClass('d-none');

            setGoodsTableInfo();
            // var info = GOODSTABLE.page.info();
            // $('.total-record').text(info.recordsDisplay);
            // $('.show-records').text(info.end);
            // $('#previous-record').removeAttr('disabled');
            // $('#next-record').removeAttr('disabled');
            // if (CURRENT_INDEX === 1) {
            //     $('#previous-record').attr('disabled', 'true');
            // }
            // if (CURRENT_INDEX >= info.pages) {
            //     $('#next-record').attr('disabled', 'true');
            // }
        }
    });

    GOODSTABLE.on('xhr', function () {
        var json = GOODSTABLE.ajax.json();
        //shipments = json;
        goodsData = json.data;
        //goodsData.sort(accendingInDate);
    });

    $(".nav li:nth-child(6)").find('img').removeClass('activenac');


    $('#next-record').click(function () {
        IS_INITIAL = false;
        var info = GOODSTABLE.page.info();
        if (CURRENT_INDEX < info.pages) {
            $('#goodsPages').dropdown('set selected', CURRENT_INDEX+1);
        }
    });

    $('#previous-record').click(function () {
        IS_INITIAL = false;
        if (CURRENT_INDEX > 1) {
            $('#goodsPages').dropdown('set selected', CURRENT_INDEX-1);
        }
    });

    $('#search-goods-type').change(() => {
        IS_INITIAL = true;
        GOODSTABLE.search(JSON.stringify({
            cat: $('#search-goods-type').dropdown('get value'),
            name: $('#customerSearchAuto').val()
        })).draw()
    });

    $('#customerSearchAuto').keyup(() => {
        IS_INITIAL = true;
        GOODSTABLE.search(JSON.stringify({
            cat: $('#search-goods-type').dropdown('get value'),
            name: $('#customerSearchAuto').val()
        })).draw();
    });



});

function valueChanger(value, text, $selectedItem) {
    alert(value);
}

function updateGoods(e) {
    $.get(`/updateProductsCat?id=${getKey($('#goods-name').val())}&cat=${$('#category').dropdown('get value')}`,
        (data, status) => {
            var response = JSON.parse(data);
            if (response.isOk) {
                $('#goodsPages').dropdown('set selected', CURRENT_INDEX);
                //            GOODSTABLE.ajax.reload();
                $('#editGoods').modal('hide');
            } else {
                Lobibox.notify('warning', { position: 'top right', msg: 'Please Check your Connection' });
            }
        });
}

function deActivate(e) {
    $.get(`/getDeActivateProduct?id=${getKey($(e.target).closest('tr').find('td:eq(0)').text())}`,
        (data, status) => {
            var response = JSON.parse(data);
            if (response.isOk) {
                GOODSTABLE.ajax.reload();
            } else {
                Lobibox.notify('warning', { position: 'top right', msg: 'Please Check your Connection' });
            }
        });
}

function openModel(e) {
    $('#goods-name').val($(e.target).closest('tr').find('td:eq(0)').text());
    $('#category').dropdown('set selected', $(e.target).closest('tr').find('td:eq(1)').text());
    $('#editGoods').modal('show');
}

function setGoodsTableInfo() {
    var info = GOODSTABLE.page.info();
    $('.total-record').text(info.recordsDisplay);
    var totalRows = CURRENT_INDEX * ROW_COUNT;
    if (totalRows > info.recordsDisplay) {
        totalRows = info.recordsDisplay;
    }
    $('.show-records').text(totalRows);

    if (CURRENT_INDEX >= info.pages) {
        $('#next-record').attr('disabled', 'true');
    } else {
        $('#next-record').removeAttr('disabled');
    }

    if (CURRENT_INDEX > 1) {
        $('#previous-record').removeAttr('disabled');
    } else {
        $('#previous-record').attr('disabled', 'true');
    }
}


destroy = function () {
    $(".nav li:nth-child(6)").find('img').addClass('activenac');
    $('#customerSearch').addClass('d-none');
    $('#search-prepend').removeAttr('style');
    $('#search-goods-type').parent().addClass('d-none');
};