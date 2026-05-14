$('.content-wrapper').addClass('d-none');
$('#loader').removeClass('d-none');
$('#customerSearch').removeClass('d-none');
$('.editcustomer-modal').load('/app/model/editCustomer.html');
$('.weightpricing-modal').load('/app/model/weightPricing.html');

var indexOfCustomer = 1;
var change = '';
var filterKey = '';
var startRecord = "";
var endRecord = "";
var customerData = null;
var selectCustomer = null;
var cutomerRow = 0;

var CUSTOMERTABLE = null;
var CURRENT_INDEX = 1;
var ROW_COUNT = 6;

//$('#customerSearchAuto').dropdown({
//    apiSettings: {
//        url: '/serachCustomer?search={query}'
//    },
//    filterRemoteData: true,
//    selectOnKeydown: false,
//    onChange: function (value, text, $selectedItem) {
//        change = "";
//        if (!isEmpty(value)) {
//            if (value.includes(",")) {
//                filterKey = `key=${JSON.stringify(value.split(","))}`;
//            } else {
//                filterKey = `key=${JSON.stringify([value])}`;
//            }
//        } else {
//            filterKey = '';
//        }
//        readCutomer();
//    }
//});

$(function () {

    CUSTOMERTABLE = $('#customerTable').DataTable({
        order: [[1, "asc"]],
        lengthMenu: [[6, 25, 50, 100, -1], [6, 25, 50, 100, "All"]],
        columnDefs: [
            {
                targets: [0],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '1%');
                    $(td).css('padding', '0');
                    $(td).css('text-align', 'center');
                }
            },
            {
                targets: [1],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '60%');

                }
            },
            {
                type: 'phoneNumber',
                targets: 2,
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '20%');
                }
            },
            {
                targets: 3,
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '15%');
                    $(td).css('padding', '0');
                }
            },
            {
                targets: [4],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('display', 'none');
                }
            }],
        drawCallback: function (settings) {

            $(`.ui.fluid.dropdown`).dropdown({ selectOnKeydown: false, onChange: valueChanger });
        },
        initComplete: function (settings, json) {
            $('#customerTable_info').hide();
            $('#customerTable_filter').hide();
            $('#customerTable_length').hide();
            $('#customerTable_paginate').hide();
        }
    });

    $(".contact").keydown(enforceFormat);
    $(".contact").keyup(formatToPhone);
    $('.paste').on('paste', false);

    $(".nav li:nth-child(5)").find('img').removeClass('activenac');
    readCutomer();


    $('#next-record').click(function () {
        var info = CUSTOMERTABLE.page.info();
        if (CURRENT_INDEX < info.pages) {
            $('#customerPages').dropdown('set selected', CURRENT_INDEX + 1);
        }
    });

    $('#previous-record').click(function () {
        var info = CUSTOMERTABLE.page.info();
        if (CURRENT_INDEX > 1) {
            $('#customerPages').dropdown('set selected', CURRENT_INDEX - 1);
        }
    });

    $('#customerSearchAuto').keyup(function () {
        CUSTOMERTABLE.search(this.value).draw();
    });

});

var valueChanger = function (value, text, $selectedItem) {
    var rowIndex = $($selectedItem).parent().parent().parent().parent().index();
    if (value === 'PROFILE') {
        cutomerRow = rowIndex;
        selectCustomer = customerData[$('#customerTable > tbody > tr').eq(rowIndex).find(`td`).eq(4).text()];
        clearCustomerModel();
        $('#customer-name').val(selectCustomer.name);
        InputContact.setNumber(selectCustomer.contact.split(" ").join(""));

        if (selectCustomer.hasOwnProperty('aname') && !isEmpty(selectCustomer.aname)) {
            $('#customer-aname').val(selectCustomer.aname);
        }

        if (selectCustomer.hasOwnProperty('address') && !isEmpty(selectCustomer.address)) {
            $('#address').val(selectCustomer.address);
        }

        if (selectCustomer.hasOwnProperty('company') && !isEmpty(selectCustomer.address)) {
            $('#customer-company-name').val(selectCustomer.company);
        }

        if (selectCustomer.hasOwnProperty('coaddress') && !isEmpty(selectCustomer.address)) {
            $('#customer-company-address').val(selectCustomer.coaddress);
        }

        if (selectCustomer.hasOwnProperty('nic') && !isEmpty(selectCustomer.address)) {
            $('#customer-nic').val(selectCustomer.nic);
            nicRetrive();
        }

        if (selectCustomer.hasOwnProperty('oaddress') && !isEmpty(selectCustomer.address)) {
            $('#cutomer-other-address').val(selectCustomer.oaddress);
        }

        if (!isDestroy) {
            uploadCrop.croppie('destroy');
        }
        $('#cutomer-profile').val('');
        $(".customer-profile-edit").attr("src", '/images/useravtar.svg');
        $('.remove-profile').addClass('d-none');
        $('.cropped-ok').addClass('d-none');
        $("#customer-prfile-id").attr('for', 'cutomer-profile');

        if (selectCustomer.hasOwnProperty('image') && !isEmpty(selectCustomer.image)) {
            $('.customer-profile-edit').attr("src", selectCustomer.image);
            $('.remove-profile').removeClass('d-none');
        }
        $('#editCustomer').modal('show');
    } else if (value === 'PRICING') {
        selectCustomer = customerData[$('#customerTable > tbody > tr').eq(rowIndex).find(`td`).eq(4).text()];

        $('#weight-pricing-table').html("");
        $('#weight-pricing-price').val("");
        $('#weight-pricing-price').val("");

        $('#weight-pricing-select-goods').dropdown("restore defaults");
        $('weight-pricing-select-unit').dropdown("restore defaults");

        if (selectCustomer.hasOwnProperty('defaultWeight')) {
            $('#weight-pricing-default-price').val(selectCustomer.defaultWeight);
        }

        if (selectCustomer.hasOwnProperty('goodsWeight')) {
            $.each(selectCustomer.goodsWeight, function (index, value) {
                $('#weight-pricing-table').append(`
                    <tr>
                        <td style="width: 1%">${$('#weight-pricing-table tr').length + 1}</td>
                        <td style="width: 64%">${value.goods}</td>
                        <td class="text-center" style="width: 10%">${value.unit}</td>
                        <td class="text-right" style="width: 20%">${value.price}</td>
                        <td class="text-center" style="width: 5%; padding: 0"><div class="btn btn-inverse-danger btn-rounded p-10 tab-pointer" onclick="removeWeightPriceRow(this)"><i class="mdi mdi-delete-variant"></i></div></td>
                    </tr>
                `);
            });
        }

        $('#weightPricing').modal('show');
    }

    if (text !== 'SELECT ACTION') {
        $($($selectedItem).parent().parent()).dropdown("restore defaults");
    }
};

function clearCustomerModel() {
    $('#cutomer-profile').val('');
    $(".customer-profile-edit").attr("src", '/images/useravtar.svg');
    $('.remove-profile').addClass('d-none');
    $('#customer-aname').val("");
    $('#address').val("");
    $('#customer-no').val("");
    $('#customer-company-name').val("");
    $('#customer-company-address').val("");
    $('#customer-nic').val("");
    $('#cutomer-other-address ').val("");
    $('#save-customer').find('i').addClass('d-none');
    $('#save-customer').removeAttr('disabled');
    $(`#customer-nic-text`).html("");
    $('#customer-dob').val('');
}

function readCutomer() {
    $.get(`/getAllCustomers`, function (data, status) {
        var response = JSON.parse(data);
        var customer = response.data;
        customerData = customer;
        drawCustomerTable(customerData);
        //        for (var c in customer) {
        //
        //            var classname = '';
        //            var classnames = '';
        //            if (idIndex % 2 === 0) {
        //                classname = 'table-light';
        //                classnames = '.table-light';
        //            }
        //
        //            var img = "/images/useravtar.svg";
        //            if (!isEmpty(customer[c].image)) {
        //                img = customer[c].image;
        //            }
        //            $('#customerTable').append(`<tr>
        //                <td class='p-2 text-center' ><img src='${img}' class='customer-profile'/></td>
        //                <td class='p-2'>${customer[c].name}</td>
        //                <td class='p-2'>${customer[c].contact}</td>
        //                <td class='p-0 text-center'>
        //                    <select class="ui fluid dropdown dropdown-center ${classname}">
        //                        <option value=''>SELECT ACTION</option>
        //                        <option value='PROFILE'>PROFILE</option>
        //                        <option value='PRICING'>PRICING</option>
        //                    </select>
        //                </td>
        //                <td style='display:none'>${c}</td>`);
        //            $(`.ui.fluid.dropdown.dropdown-center${classnames}`).dropdown({selectOnKeydown: false, onChange: valueChanger});
        //            nameofCutomer = customer[c].name;
        //            idIndex++;
        //        }
        //        if (!isEmpty($('#customerTable').html())) {
        //            var customerKeys = Object.keys(customer);
        //            startRecord = customer[customerKeys[0]].name;
        //            endRecord = customer[customerKeys[customerKeys.length - 1]].name;
        //        }
        //        $('.total-record').html(response.size);
        //        var size = response.limit * indexOfCustomer;
        //        if (size > response.size) {
        //            size = response.size;
        //        }
        //        $('.show-records').text(size);
        //
        //        if ((response.limit * indexOfCustomer) === response.limit) {
        //            $('#previous-record').attr('disabled', 'true');
        //        } else {
        //            $('#previous-record').removeAttr('disabled');
        //        }
        //
        //        if ((response.limit * indexOfCustomer) >= response.size) {
        //            $('#next-record').attr('disabled', 'true');
        //        } else {
        //            $('#next-record').removeAttr('disabled');
        //        }

        $('.content-wrapper').removeClass('d-none');
        $('#loader').addClass('d-none');
    });
}

function drawCustomerTable(customer) {
    CUSTOMERTABLE.clear().draw();

    //        var idIndex = 0;
    $.each(customer, function (index, value) {

        CUSTOMERTABLE.row.add([`<img src='${(!isEmpty(value.image)) ? value.image : "/images/useravtar.svg"}' class='customer-profile'/>`, value.name, value.showcontact ? value.showcontact : value.contact,
            `<td class='p-0 text-center'>
                    <select class="ui fluid dropdown dropdown-center table-transparent">
                        <option value=''>SELECT ACTION</option>
                        <option value='PROFILE'>PROFILE</option>
                        <option value='PRICING'>PRICING</option>
                    </select>
                </td>`, index]).draw();
    });

    var info = CUSTOMERTABLE.page.info();
    var pagesx = new Array(info.pages).fill(null).map((_, i) => {
        var result = i == 0 ? { name: i + 1, value: i + 1, selected: true } : { name: i + 1, value: i + 1 };
        return result;
    });
    $('#customerPages').dropdown({
        selectOnKeydown: false,
        values: pagesx,
        onChange: function (value, text, $selectedItem) {
            CURRENT_INDEX = parseInt(value);
            CUSTOMERTABLE.page(CURRENT_INDEX - 1).draw('page');
            setCustomerTableInfo();
        }
    });
    $(`.ui.fluid.dropdown.dropdown-center.table-transparent`).dropdown({ selectOnKeydown: false, onChange: valueChanger });

    $('.total-record').text(info.recordsDisplay);
    $('.show-records').text(info.end);
    $('#previous-record').attr('disabled', 'true');
    if (CURRENT_INDEX >= info.pages) {
        $('#next-record').attr('disabled', 'true');
    }
}


function setCustomerTableInfo() {
    var info = CUSTOMERTABLE.page.info();
    $('.total-record').text(info.recordsDisplay);
    var totalRows = CURRENT_INDEX * ROW_COUNT;
    if (totalRows > CUSTOMERTABLE.rows().count()) {
        totalRows = CUSTOMERTABLE.rows().count();
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
    $(".nav li:nth-child(5)").find('img').addClass('activenac');
    $('#customerSearch').addClass('d-none');
};