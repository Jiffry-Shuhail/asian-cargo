$.getScript('/app/js/others/validation.js');
$.getScript('/app/js/others/pdf.js');
$('.setting-modal').load("/app/model/setting.html");
$('.unloading-modal').load("/app/model/unloading.html");
$('.weight-modal').load("/app/model/weight.html");
$('.header-modal').load("/app/model/header.html");
$('.packinglist-modal').load("/app/model/packinglist.html");
$('.fullcriteria-modal').load("/app/model/fullcriteria.html");
$('.deliveryReport-modal').load("/app/model/deliveryReport.html");
$('.invoice-modal').load("/app/model/Invoice.html");
$('.customer-invoice-modal').load("/app/model/CustomerInvoice.html");
$('.customer-collection-modal').load("/app/model/Collection.html");
$.getScript('/app/js/shipment/setting.js');
$.getScript('/app/js/shipment/unloading.js');
$.getScript('/app/js/shipment/weight.js');
$.getScript('/app/js/shipment/header.js');
$.getScript('/app/js/shipment/packinglist.js');
$.getScript('/app/js/shipment/fullCriteria.js');
$.getScript('/app/js/shipment/deliveryReport.js');
$.getScript('/app/js/shipment/Invoice.js');
$.getScript('/app/js/shipment/CustomerInvoice.js');
$.getScript('/app/js/shipment/Collection.js');
$('.content-wrapper').addClass('d-none');
$('#loader').removeClass('d-none');
$('#daterangetagAndAutocomplter').removeClass('d-none');


var shipments = {};
var exporters = {};
var customers = {};
var units = {};
var products = {};
var category = {};
var isEligableData = {isExporters: false, isShipments: false};
var isEdit = false;

var CHANGES = '';
var FILTERS_KEY = '';
var INDEX_OF_SHIPMENT = 1;
var START_RECORD = "";
var END_RECORD = "";

var SHIPMENTTABLE = "";
var CURRENT_INDEX = 1;
var ROW_COUNT = 6;

var SHIPMENTS_ARRAY = [];

//$('#shipmentSearchAuto').dropdown({
//    apiSettings: {
//        url: '/searchShipments?search={query}'
//    },
//    filterRemoteData: true,
//    selectOnKeydown: false,
//    onChange: function (value, text, $selectedItem) {
//        CHANGES = "";
//        if (!isEmpty(value)) {
//            FILTERS_KEY = `key=${value}`;
//        } else {
//            FILTERS_KEY = '';
//            $('#shipmentSearchAuto').dropdown('clear');
//            $('#shipmentSearchAuto').dropdown('restore defaults');
//        }
//        readShipment();
//    }
//});

$(function () {

//    $('.content-wrapper').removeClass('d-none');
//    $('#loader').addClass('d-none');

//    SHIPMENTTABLE.row.add([new Date(value.date._seconds * 1000), 
//        value.exporter, 
//        value.shipment, 
//        dateFormatForTimeStamp(value.date), 
//        exporters[value.exporter].exName, 
//        Object.keys(value[value.activeStatus].cartons).length,
//            productsUnique.length, 
//            customersUnique.length, 
//            statusDropdown, 
//            actionDropdown, 
//            editButton]).draw();


    $('.search-prepend').attr('style', 'width: 300px; max-height: 40px');
    $('#search-exporter').removeClass('d-none');
    $('#search-exporter').parent().removeClass('d-none');

    $(".nav li:nth-child(4)").find('img').removeClass('activenac');

    $(".double").keypress(isNumber);
    $('.paste').on('paste', false);

    $.get("/getExporter", function (data, status) {
        var response = JSON.parse(data);
        exporters = response.data;
        var current;
        for (var key in exporters) {
            $(`#search-exporter`).append(`<option value="${exporters[key].exRef.trim()}">
            ${exporters[key].exName.trim()}</option>`);
            if (exporters[key].current) {
                current = exporters[key].exRef;
            }
        }
//        $(`.ui.fluid.dropdown`).dropdown();
        $(`#search-exporter`).dropdown('set selected', current);
        $('#search-exporter').parent().attr('style', 'width: 300px; max-height: 40px; margin-left: -10px');
        isEligableData.isExporters = true;
        if (isEligableData.isShipments && isEligableData.isExporters) {
            //drawShipments();
        }
    });

    SHIPMENTTABLE = $('#shipmentsTable').DataTable({
        lengthMenu: [[6, 25, 50, 100, -1], [6, 25, 50, 100, "All"]],
        columnDefs: [
            {
                targets: [0, 1,2],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('display', 'none');
                }
            },
            {
                targets: [9, 10],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '15%');
                    $(td).css('padding', '0');
                }
            },
            {
                targets: [11],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '1%');
                    $(td).css('padding', '0');
                }
            },
            {
                targets: [6, 7, 8],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('text-align', 'center');
                }
            }],
        drawCallback: function (settings) {
            $(`.ui.fluid.dropdown`).dropdown({selectOnKeydown: false, onChange: valueChanger});
            $(`.ui.fluid.dropdown.dropdown-center.table-transparent`).dropdown({selectOnKeydown: false, onChange: valueChanger});

            $('.edit-shipment').click(editShipment);
            $('.content-wrapper').removeClass('d-none');
            $('#loader').addClass('d-none');

            var info = SHIPMENTTABLE.page.info();
            $('.total-record').text(info.recordsDisplay);
            $('.show-records').text(info.end);
            if (CURRENT_INDEX === 1) {
                $('#previous-record').attr('disabled', 'true');
            }
            if (CURRENT_INDEX >= info.pages) {
                $('#next-record').attr('disabled', 'true');
            }
        },
        initComplete: function (settings, json) {
            $('#shipmentsTable_info').hide();
            $('#shipmentsTable_filter').hide();
            $('#shipmentsTable_length').hide();
            $('#shipmentsTable_paginate').hide();
        },
        processing: true,
        language: {
            processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        serverSide: true,
        ajax: {
            url: '/getAllShipment',
            type: 'POST',
            beforeSend: request => request.setRequestHeader('CSRF-Token', Cookies.get('XSRF-TOKEN'))
        },
        columns: [
            {data: 'tableDate'},
            {data: 'exporter'},
            {data: 'shipment'},
            {data: 'editShipmentNumber'},
            {data: 'viewDate'},
            {data: 'viewExporter'},
            {data: 'viewCount'},
            {data: 'productsCount'},
            {data: 'customersCount'},
            {data: 'statusDropdown'},
            {data: 'actionDropdown'},
            {data: 'editButton'}
        ]
    });

    SHIPMENTTABLE.on('xhr', function () {
        var json = SHIPMENTTABLE.ajax.json();

        shipments = json.data.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {});
        SHIPMENTS_ARRAY = json.data;
        SHIPMENTS_ARRAY.sort(accendingInDate);
    });

//    readShipment();

    $.get("/getAllCustomers", function (data, status) {
        var response = JSON.parse(data);
        var customerData = response.data;
        for (var key in customerData) {
            if (!customers.hasOwnProperty(customerData[key].name.trim())) {
                customers[customerData[key].name.trim()] = customerData[key];
            }
        }
    });

    $.get("/getUnits", function (data, status) {
        var response = JSON.parse(data);
        units = response.data;
    });

    $.get("/getProducts", function (data, status) {
        var response = JSON.parse(data);
        products = response.data;
    });

    $.get("/getCategory", function (data, status) {
        var response = JSON.parse(data);
        category = response.data;
    });

    $('#next-record').click(function () {
        var info = SHIPMENTTABLE.page.info();
        $('.total-record').text(info.recordsDisplay);
        if (CURRENT_INDEX < info.pages) {
            SHIPMENTTABLE.page('next').draw('page');
            CURRENT_INDEX++;

            var totalRows = CURRENT_INDEX * ROW_COUNT;
            if (totalRows > SHIPMENTTABLE.rows().count()) {
                totalRows = SHIPMENTTABLE.rows().count();
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
        var info = SHIPMENTTABLE.page.info();
        $('.total-record').text(info.recordsDisplay);
        if (CURRENT_INDEX > 1) {
            SHIPMENTTABLE.page('previous').draw('page');
            CURRENT_INDEX--;

            var totalRows = CURRENT_INDEX * ROW_COUNT;
            if (totalRows > SHIPMENTTABLE.rows().count()) {
                totalRows = SHIPMENTTABLE.rows().count();
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

    $('#search-exporter').change(() => SHIPMENTTABLE.search(JSON.stringify({
            exporter: $('#search-exporter').dropdown('get value'),
            shipment: $('#shipmentSearchAuto').val()
        })).draw());

    $('#shipmentSearchAuto').keyup(() =>
        SHIPMENTTABLE.search(JSON.stringify({
            exporter: $('#search-exporter').dropdown('get value'),
            shipment: $('#shipmentSearchAuto').val()
        })).draw());

});

var valueChanger = function (value, text, $selectedItem) {
    var rowIndex = $($selectedItem).parent().parent().parent().parent().index();
    var cloumnIndex = $($selectedItem).parent().parent().parent().index();
    var ExporterId = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(1).text();
    var ShipmentID = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(2).text();
    var shipmentNumber = ExporterId + " SHIPMENT " + ShipmentID;
    if (cloumnIndex === 10) {
        var ID = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(9).children(0).attr('class').split(' ').join('.');
        if (value === 'SETTING') {
            setting(shipmentNumber, ID);
        } else if (value === 'UNLOADING') {
            unloading(shipmentNumber, ID);
        } else if (value === 'WEIGHT') {
            weight(shipmentNumber, ID);
        } else if (value === 'HEADER SETTING') {
            header(shipmentNumber, ID);
        } else if (value === 'FULL CRITERIA') {
            fullCriteria(shipmentNumber, ID);
        } else if (value === 'PACKING LIST') {
            packinglist(shipmentNumber, ID);
        } else if (value === 'INVOICE') {
            Invoice(shipmentNumber, ID);
        } else if (value === 'CUSTOMER INVOICE') {
            CustomerInvoice(shipmentNumber, ID);
        } else if (value === 'COLLECTION') {
            collection(shipmentNumber, ID);
        } else if (value === 'DELIVERY_SLIP') {
            deliveryReport(shipmentNumber, ID);
        }
        if (text !== 'SELECT ACTION') {
            $($($selectedItem).parent().parent()).dropdown("restore defaults");
        }
    } else if (cloumnIndex === 9) {
        changeColumnValue(shipmentNumber, value, rowIndex);
    }
};


function changeColumnValue(shiment, status, rowIndex) {
    if (shipments[shiment] !== undefined) {
        var cartons = shipments[shiment][status].cartons;

        let products = Object.keys(cartons).flatMap(key => cartons[key].products);
        let productsUnique = [...new Set(products.map(item => item.product))];

        let customers = Object.keys(cartons).flatMap(key => cartons[key].customer);
        let customersUnique = [...new Set(customers)];

        $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(6).text(Object.keys(cartons).length);
        $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(7).text(productsUnique.length);
        $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(8).text(customersUnique.length);
    }
}

function readShipment() {
    console.log(new Date());
    $.ajax({
        url: "/getAllShipment",
        type: "POST",
        data: '',
        dataType: 'json',
        headers: {
            'CSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        cache: false,
        success: function (data) {
            console.log(new Date());
            shipments = data.data;
            SHIPMENTS_ARRAY = $.map(shipments, function (value, index) {
                return [value];
            });
            SHIPMENTS_ARRAY.sort(accendingInDate);
            isEligableData.isShipments = true;
            if (isEligableData.isShipments && isEligableData.isExporters) {
                drawShipments();
            }
        }
    });
}

function drawShipments() {
    let shipment = Object.keys(shipments).map((key) => shipments[key]);

    SHIPMENTTABLE.clear().draw();
//    console.log("Now Start"+new Date());
    $.each(shipment, function (index, value) {
        let currentCartoons = value[value.activeStatus].cartons;

        let products = Object.keys(currentCartoons).flatMap(key => currentCartoons[key].products);
        let productsUnique = [...new Set(products.map(item => item.product))];

        let customers = Object.keys(currentCartoons).flatMap(key => currentCartoons[key].customer);
        let customersUnique = [...new Set(customers)];

        let statusDropdown = `<select class='ui fluid dropdown dropdown-center table-transparent STATUS-${index}' id='STATUS-${index}'>`;

        $.each(value.status, function (i, status) {
            statusDropdown += (value.activeStatus === status) ? `<option value='${status}' selected>${status}</option>` : `<option value='${status}'>${status}</option>`;
        });
        statusDropdown += `</select>`;

        let actionDropdown = `<select class='ui fluid dropdown dropdown-center table-transparent ACTIONS-${index}'>
                                <option value=''>SELECT ACTION</option>
                                <option value='FULL CRITERIA'>FULL CRITERIA</option>
                                <option value='PACKING LIST'>PACKING LIST</option>
                                <option value='INVOICE'>INVOICE</option>
                                <option value='UNLOADING'>UNLOADING</option>
                                <option value='CUSTOMER INVOICE'>CUSTOMER INVOICE</option>
                                <option value='COLLECTION'>COLLECTION</option>
                                <option value='WEIGHT'>WEIGHT</option>
                                <option value='SETTING'>SETTING</option>
                                <option value='HEADER SETTING'>HEADER SETTING</option>
                            </select>`;

        let editButton = `<button class="btn btn-inverse-danger edit-shipment" style="width:100%; height:55px; border-radius:0">
        <i class="fa fa-pencil"></i></button>`;

        SHIPMENTTABLE.row.add([new Date(value.date._seconds * 1000), value.exporter, value.shipment, dateFormatForTimeStamp(value.date), exporters[value.exporter].exName, Object.keys(value[value.activeStatus].cartons).length,
            productsUnique.length, customersUnique.length, statusDropdown, actionDropdown, editButton]).draw();

//        $(`.ui.fluid.dropdown.dropdown-center.table-transparent.STATUS-${index}`).dropdown({selectOnKeydown: false, onChange: valueChanger});
//        $(`.ui.fluid.dropdown.dropdown-center.table-transparent.STATUS-${index}`).dropdown("set selected", value.activeStatus);
//        $(`.ui.fluid.dropdown.dropdown-center.table-transparent.ACTIONS-${index}`).dropdown({selectOnKeydown: false, onChange: valueChanger});

    });

//    console.log("Now End"+new Date());

    $(`.ui.fluid.dropdown.dropdown-center.table-transparent`).dropdown({selectOnKeydown: false, onChange: valueChanger});

    $('.edit-shipment').click(editShipment);
    $('.content-wrapper').removeClass('d-none');
    $('#loader').addClass('d-none');

    var info = SHIPMENTTABLE.page.info();
    $('.total-record').text(info.recordsDisplay);
    $('.show-records').text(info.end);
    $('#previous-record').attr('disabled', 'true');
    if (CURRENT_INDEX >= info.pages) {
        $('#next-record').attr('disabled', 'true');
    }
}

function getHeader(plShipment, docDefinition) {
    var shipmentNo = plShipment.shipment;
    if (plShipment.hasOwnProperty('editShipment')) {
        shipmentNo = plShipment.editShipment;
    }

    var headerState = "Default";
    if (plShipment.hasOwnProperty('headerState')) {
        headerState = plShipment.headerState;
    }

    var shipDate = plShipment.date;
    if (plShipment.hasOwnProperty('editDate')) {
        shipDate = plShipment.editDate;
    }
    shipDate = new Date(shipDate._seconds * 1000);

    var invNo = `${shipmentNo}        ${shipDate.getDate()}/${(shipDate.getMonth() + 1)}/${shipDate.getFullYear()}`;

    if (headerState === "Default") {

        var headerExporter = exporters[plShipment.exporter];
        docDefinition.content[0].table.body.push([{text: `Exporter :- ${headerExporter.exName } \n ${headerExporter.exAddress.split(',').join(',\n')} \nTEL ; ${headerExporter.exContactNumber}`, style: 'header', rowSpan: 5, colSpan: 4}, {}, {}, {}, {text: `Invoice No &    Date \n${invNo} \n`, style: 'header', rowSpan: 3, colSpan: 2, alignment: 'center'}, {}, {text: `Exporter\u00B4s Ref \nIEC NO. ${plShipment.exporter} \n `, style: 'header', rowSpan: 3, colSpan: 3}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr><td colspan="4" rowspan="5" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Exporter :- ${headerExporter.exName } <br> ${headerExporter.exAddress.split(',').join(',<br>')} <br>TEL ; ${headerExporter.exContactNumber}</td><td colspan=2" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">Invoice No &    Date <br>${invNo} <br></td><td colspan=3" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">Exporter\u00B4s Ref <br>IEC NO. ${plShipment.exporter} <br></td></tr>`);
        $(`#excle-invoice-Table`).append(`<tr><td colspan="4" rowspan="5" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Exporter :- ${headerExporter.exName } <br> ${headerExporter.exAddress.split(',').join(',<br>')} <br>TEL ; ${headerExporter.exContactNumber}</td><td colspan=2" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">Invoice No &    Date <br>${invNo} <br></td><td colspan=3" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">Exporter\u00B4s Ref <br>IEC NO. ${plShipment.exporter} <br></td></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, '']);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {text: `CONSIGNEE :- ${headerExporter.conName} \n ${headerExporter.conAddress}`, style: 'header', rowSpan: 2, colSpan: 5}, {}, {}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr></tr><tr></tr><tr><td colspan="5" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-v="middle">CONSIGNEE :- ${headerExporter.conName} <br> ${headerExporter.conAddress}</td></tr>`);
        $(`#excle-invoice-Table`).append(`<tr></tr><tr></tr><tr><td colspan="5" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-v="middle">CONSIGNEE :- ${headerExporter.conName} <br> ${headerExporter.conAddress}</td></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
        docDefinition.content[0].table.body.push([{text: `BUYER:- ${headerExporter.buyer}`, style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: `Country Of Origin Goods \n${headerExporter.countryOfOriginGoods}`, style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: `Country Of Final Destination \n${headerExporter.countryOfFinalDestination}`, style: 'header', rowSpan: 2, colSpan: 3}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">BUYER:- ${headerExporter.buyer}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Country Of Origin Goods <br>${headerExporter.countryOfOriginGoods}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Country Of Final Destination <br>${headerExporter.countryOfFinalDestination}</td></tr>`);
        $(`#excle-invoice-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">BUYER:- ${headerExporter.buyer}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Country Of Origin Goods <br>${headerExporter.countryOfOriginGoods}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Country Of Final Destination <br>${headerExporter.countryOfFinalDestination}</td></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
        docDefinition.content[0].table.body.push([{text: `Port of Loading\n${headerExporter.portofLoading}`, style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: `Port of Discharge\n${headerExporter.portofDischarge}`, style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: `Terms of Delivery And Payments \n${headerExporter.TermsofDeliveryAndPayments}`, style: 'header', rowSpan: 2, colSpan: 3}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Port of Loading<br>${headerExporter.portofLoading}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Port of Discharge<br>${headerExporter.portofDischarge}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Terms of Delivery And Payments <br>${headerExporter.TermsofDeliveryAndPayments}</td></tr><tr></tr>`);
        $(`#excle-invoice-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Port of Loading<br>${headerExporter.portofLoading}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Port of Discharge<br>${headerExporter.portofDischarge}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">Terms of Delivery And Payments <br>${headerExporter.TermsofDeliveryAndPayments}</td></tr><tr></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
//        docDefinition.content[0].table.body.push([{text: `MARKS & No. ${marks}`, style: 'header', alignment: 'center'}, {text: '\nDESCRIPTION', style: 'header', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: '\nQUANTITY', style: 'header', alignment: 'center'}, {text: '\nUNIT', style: 'header', alignment: 'center'}]);
    } else if (headerState === "Edit") {

        var headerExporter = plShipment.edit;
        docDefinition.content[0].table.body.push([{text: headerExporter.exporter.split('<br>').join('\n'), style: 'header', rowSpan: 5, colSpan: 4}, {}, {}, {}, {text: `Invoice No &    Date \n${invNo} \n`, style: 'header', rowSpan: 3, colSpan: 2, alignment: 'center'}, {}, {text: headerExporter.expoterref.split('<br>').join('\n'), style: 'header', rowSpan: 3, colSpan: 3}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr><td colspan="4" rowspan="5" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.exporter} <br>TEL ; ${headerExporter.exContactNumber}</td><td colspan=2" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">Invoice No &    Date <br>${invNo} <br></td><td colspan=3" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.expoterref} <br></td></tr>`);
        $(`#excle-invoice-Table`).append(`<tr><td colspan="4" rowspan="5" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.exporter} <br>TEL ; ${headerExporter.exContactNumber}</td><td colspan=2" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">Invoice No &    Date <br>${invNo} <br></td><td colspan=3" rowspan="3" data-a-h="center" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.expoterref} <br></td></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, '']);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {text: headerExporter.consignee.split('<br>').join('\n'), style: 'header', rowSpan: 2, colSpan: 5}, {}, {}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr></tr><tr></tr><tr><td colspan="5" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-v="top">CONSIGNEE :- ${headerExporter.conName} <br> ${headerExporter.conAddress}</td></tr>`);
        $(`#excle-invoice-Table`).append(`<tr></tr><tr></tr><tr><td colspan="5" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-v="top">CONSIGNEE :- ${headerExporter.conName} <br> ${headerExporter.conAddress}</td></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
        docDefinition.content[0].table.body.push([{text: headerExporter.buyer.split('<br>').join('\n'), style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: headerExporter.countryOfOriginGoods.split('<br>').join('\n'), style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: headerExporter.countryOfFinalDestination.split('<br>').join('\n'), style: 'header', rowSpan: 2, colSpan: 3}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.buyer}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.countryOfOriginGoods}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.countryOfFinalDestination}</td></tr>`);
        $(`#excle-invoice-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.buyer}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.countryOfOriginGoods}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.countryOfFinalDestination}</td></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
        docDefinition.content[0].table.body.push([{text: headerExporter.portofLoading.split('<br>').join('\n'), style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: headerExporter.portofDischarge.split('<br>').join('\n'), style: 'header', rowSpan: 2, colSpan: 3}, {}, {}, {text: headerExporter.TermsofDeliveryAndPayments.split('<br>').join('\n'), style: 'header', rowSpan: 2, colSpan: 3}, {}, {}]);
        $(`#excle-packingList-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.portofLoading}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.portofDischarge}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.TermsofDeliveryAndPayments}</td></tr><tr></tr>`);
        $(`#excle-invoice-Table`).append(`<tr></tr><tr><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.portofLoading}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.portofDischarge}</td><td colspan="3" rowspan="2" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${headerExporter.TermsofDeliveryAndPayments}</td></tr><tr></tr>`);
        docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
//        docDefinition.content[0].table.body.push([{text: `MARKS & No. ${marks}`, style: 'header', alignment: 'center'}, {text: '\nDESCRIPTION', style: 'header', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: '\nQUANTITY', style: 'header', alignment: 'center'}, {text: '\nUNIT', style: 'header', alignment: 'center'}]);

    } else {
        var headerData = plShipment.new;
        for (var i = 0; i < headerData.length; i++) {
            var row = headerData[i];
            var rowData = [];
            for (var j in row) {
                rowData.push(row[j]);
            }
            docDefinition.content[0].table.body.push(rowData);
        }
//        docDefinition.content[0].table.body.push([{text: `MARKS & No. ${marks}`, style: 'header', alignment: 'center'}, {text: '\nDESCRIPTION', style: 'header', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: '\nQUANTITY', style: 'header', alignment: 'center'}, {text: '\nUNIT', style: 'header', alignment: 'center'}]);
    }
}

destroy = function () {
    $(".nav li:nth-child(4)").find('img').addClass('activenac');
    $('#shipmentStausBar').addClass('d-none');
    $('#daterangetagAndAutocomplter').addClass('d-none');
    if (!isEdit) {
        editShipment = null;
        editShipmentStatus = null;
    }
};

function editShipment(e) {
    var rowIndex = $(this).parent().parent().index();
//    console.log(rowIndex);
//    var Table = "";
//    var rowIndex = 0;
//    if (e.target.parentNode.parentNode.parentNode.tagName === "TR") {
//        Table = e.target.parentNode.parentNode.parentNode.parentNode;
//        rowIndex = e.target.parentNode.parentNode.parentNode.rowIndex - 1;
//    } else {
//        Table = e.target.parentNode.parentNode.parentNode;
//        rowIndex = e.target.parentNode.parentNode.rowIndex - 1;
//    }
//    var classnames = '';
//    if (rowIndex % 2 === 0) {
//        classnames = '.table-light';
//    }
    var ExporterId = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(1).text();
    var ShipmentID = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(2).text();
    var shipmentNumber = ExporterId + " SHIPMENT " + ShipmentID;
    var ID = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(9).children(0).attr('class').split(' ').join('.');
    isEdit = true;
    editShipment = shipments[shipmentNumber];
    editShipmentStatus = $(`.${ID}`).dropdown("get value");
    console.log(ID);
    console.log(editShipmentStatus);
    console.log(editShipment);
    console.log($(`.${ID}`).dropdown("get value"));
    console.log('-----------------------------------------------------------');
    $(".nav li:nth-child(1)").click();
}