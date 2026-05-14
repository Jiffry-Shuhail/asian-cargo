$('.content-wrapper').addClass('d-none');
$('#loader').removeClass('d-none');
$('#customerSearch').removeClass('d-none');

var categoryData = null;

var CATEGORYTABLE = null;
var CURRENT_INDEX = 1;
var ROW_COUNT = 6;

$(function () {

    CATEGORYTABLE = $('#categoryTable').DataTable({
        order: [[0, "desc"]],
        lengthMenu: [[6, 25, 50, 100, -1], [6, 25, 50, 100, "All"]],
        columnDefs: [
            {
                targets: [0],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '50%');
                }
            },
            {
                targets: [1],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '1%');
                    $(td).css('padding', '0');
                }
            }],
        drawCallback: function (settings) {
            $(`.remove-category`).click(deActivate);
            var info = CATEGORYTABLE.page.info();
            $('.total-record').text(info.recordsDisplay);
            $('.show-records').text(info.end);
            $('#previous-record').removeAttr('disabled');
            $('#next-record').removeAttr('disabled');
            if (CURRENT_INDEX === 1) {
                $('#previous-record').attr('disabled', 'true');
            }
            if (CURRENT_INDEX >= info.pages) {
                $('#next-record').attr('disabled', 'true');
            }
        },
        processing: true,
        language: {
            processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        serverSide: true,
        ajax: {
            url: '/getAllActiveCategory',
            type: 'POST',
            beforeSend: request => request.setRequestHeader('CSRF-Token', Cookies.get('XSRF-TOKEN'))
        },
        columns: [
            {data: 'name'},
            {data: 'editButton'}
        ],
        initComplete: function (settings, json) {
            $('#categoryTable_info').hide();
            $('#categoryTable_filter').hide();
            $('#categoryTable_length').hide();
            $('#categoryTable_paginate').hide();
            $('.content-wrapper').removeClass('d-none');
            $('#loader').addClass('d-none');
            var info = CATEGORYTABLE.page.info();
            $('.total-record').text(info.recordsDisplay);
            $('.show-records').text(info.end);
            $('#previous-record').removeAttr('disabled');
            $('#next-record').removeAttr('disabled');
            if (CURRENT_INDEX === 1) {
                $('#previous-record').attr('disabled', 'true');
            }
            if (CURRENT_INDEX >= info.pages) {
                $('#next-record').attr('disabled', 'true');
            }
        }
    });
    
    CATEGORYTABLE.on('xhr', function () {
        var json = CATEGORYTABLE.ajax.json();
        //shipments = json;
        goodsData = json.data;
        //goodsData.sort(accendingInDate);
    });

    $(".nav li:nth-child(7)").find('img').removeClass('activenac');


    $('#next-record').click(function () {
        var info = CATEGORYTABLE.page.info();
        $('.total-record').text(info.recordsDisplay);
        if (CURRENT_INDEX < info.pages) {
            CATEGORYTABLE.page('next').draw('page');
            CURRENT_INDEX++;

            var totalRows = CURRENT_INDEX * ROW_COUNT;
            if (totalRows > CATEGORYTABLE.rows().count()) {
                totalRows = CATEGORYTABLE.rows().count();
            }
            $('.show-records').text(totalRows);
        }

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
    });

    $('#previous-record').click(function () {
        var info = CATEGORYTABLE.page.info();
        $('.total-record').text(info.recordsDisplay);
        if (CURRENT_INDEX > 1) {
            CATEGORYTABLE.page('previous').draw('page');
            CURRENT_INDEX--;

            var totalRows = CURRENT_INDEX * ROW_COUNT;
            if (totalRows > CATEGORYTABLE.rows().count()) {
                totalRows = CATEGORYTABLE.rows().count();
            }
            $('.show-records').text(totalRows);
        }

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
    });
    
    $('#customerSearchAuto').keyup(()=>
        CATEGORYTABLE.search($('#customerSearchAuto').val()).draw());
    
    

});


function deActivate(e){
    $.get(`/deActivateCategory?id=${getKey($(e.target).closest('tr').find('td:eq(0)').text())}`,
    (data, status)=>{
        var response = JSON.parse(data);
        if(response.isOk){
            CATEGORYTABLE.ajax.reload();
        }else{
            Lobibox.notify('warning', {position: 'top right', msg: 'Please Check your Connection'});
        }
    });
}

destroy = function () {
    $(".nav li:nth-child(7)").find('img').addClass('activenac');
    $('#customerSearch').addClass('d-none');
};