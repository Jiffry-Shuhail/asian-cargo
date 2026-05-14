 $.getScript('/app/js/others/pdf.js');
$.getScript('/javascripts/jquery.num2words.js');

$('#clearingAttchmentModel').load("/app/model/quotationAttachment.html");
$('#clearingPDFModel').load("/app/model/packinglist.html");
$.getScript('/app/js/quotation/quotationAttachment.js');

var CLEARING_DATA_TABLE = null;
var CLEARING_DATA = null;
var CLEARING_INDEX = 1;
var USER_ROW_COUNT = 6;

var products = {};

var MONTHS=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

$(function () {
    $('.content-wrapper').addClass('d-none');
    $('#loader').removeClass('d-none');
    $('#clearingShipmentAutoSearch').removeClass('d-none');
    $(".nav li:nth-child(3)").find('img').removeClass('activenac');

    $('.attached-details').click(function () {
        clearModel();
        $('#excel-btn').show();
        $('#sample-xlsx').show();
        $('#clearingAttchment').modal('show');
    });

    $('#clearingShipmentAutoSearch').keyup(function () {
        CLEARING_DATA_TABLE.search($(this).val()).draw();
    });

    $.get("/getProducts", function (data, status) {
        var response = JSON.parse(data);
        products = response.data;
    });

    CLEARING_DATA_TABLE = $('#clearingDataTable').DataTable({
        lengthMenu: [[2, USER_ROW_COUNT, 8, -1], [2, 4, 8, "All"]],
        iDisplayLength: USER_ROW_COUNT,
        retrieve: true,
        order: [[1, "asc"]],
        aoColumnDefs: [{"sClass": "d-none", "aTargets": 0},
            {
                targets: '_all',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (col === 3) {
                        $(td).css('padding', '0');
                    }
                }
            }],
        drawCallback: function (settings) {
            $(`.ui.fluid.dropdown.dropdown-center.table-transparent`).dropdown({selectOnKeydown: false, onChange: valueChanger});
//            $(`.ui.fluid.dropdown.dropdown-center`).dropdown({selectOnKeydown: false, onChange: valueChanger});
//            $(`.ui.fluid.dropdown.dropdown-center.table-light`).dropdown({selectOnKeydown: false, onChange: valueChanger});
        },
        initComplete: function (settings, json) {
            $('#clearingDataTable_info').hide();
            $('#clearingDataTable_filter').hide();
            $('#clearingDataTable_length').hide();
            $('#clearingDataTable_paginate').hide();
        }
    });

    $.get(`/getAllQuotation`, function (data, status) {
        var response = JSON.parse(data);
        CLEARING_DATA = response.data;
        drawClearingTable();
    });

    $('#next-record').click(function () {
        var info = CLEARING_DATA_TABLE.page.info();
        $('.total-record').text(info.recordsDisplay);
        if (CLEARING_INDEX < info.pages) {
            CLEARING_DATA_TABLE.page('next').draw('page');
            CLEARING_INDEX++;

            var totalRows = CLEARING_INDEX * USER_ROW_COUNT;
            if (totalRows > CLEARING_DATA_TABLE.rows().count()) {
                totalRows = CLEARING_DATA_TABLE.rows().count();
            }
            $('.show-records').text(totalRows);
        }

        if (CLEARING_INDEX >= info.pages) {
            $('#next-record').attr('disabled', 'true');
        } else {
            $('#next-record').removeAttr('disabled');
        }

        if (CLEARING_INDEX > 1) {
            $('#previous-record').removeAttr('disabled');
        } else {
            $('#previous-record').attr('disabled', 'true');
        }
    });

    $('#previous-record').click(function () {
        var info = CLEARING_DATA_TABLE.page.info();
        $('.total-record').text(info.recordsDisplay);
        if (CLEARING_INDEX > 1) {
            CLEARING_DATA_TABLE.page('previous').draw('page');
            CLEARING_INDEX--;

            var totalRows = CLEARING_INDEX * USER_ROW_COUNT;
            if (totalRows > CLEARING_DATA_TABLE.rows().count()) {
                totalRows = CLEARING_DATA_TABLE.rows().count();
            }
            $('.show-records').text(totalRows);
        }

        if (CLEARING_INDEX >= info.pages) {
            $('#next-record').attr('disabled', 'true');
        } else {
            $('#next-record').removeAttr('disabled');
        }

        if (CLEARING_INDEX > 1) {
            $('#previous-record').removeAttr('disabled');
        } else {
            $('#previous-record').attr('disabled', 'true');
        }
    });

});

var valueChanger = function (value, text, $selectedItem) {
    
//    var rowIndex = $($selectedItem).parent().parent().parent().parent().index();
//    var cloumnIndex = $($selectedItem).parent().parent().parent().index();
//    var ExporterId = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(1).text();
//    var ShipmentID = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(2).text();
//    var shipmentNumber = ExporterId + " SHIPMENT " + ShipmentID;
//    
//    var ID = $('#shipmentsTable > tbody > tr').eq(rowIndex).find(`td`).eq(8).children(0).attr('class').split(' ').join('.');
    
    var rowIndex = $($selectedItem).parent().parent().parent().parent().index();
    var clearingID = 0;
//    if(CLEARING_DATA_TABLE.rows(rowIndex).data().length>0){
//        clearingID = CLEARING_DATA_TABLE.rows(rowIndex).data()[0][0];
//    }
    clearingID = $('#clearingDataTable > tbody > tr').eq(rowIndex).find(`td`).eq(0).text();
    if (value === 'EDIT') {
        editClearing(clearingID);
    } else if (value === 'PACKING LIST') {
        makePackigListPDF(clearingID);
    } else if (value === 'INVOICE') {
        makeInvoicePDF(clearingID);
    }

    if (text !== 'SELECT ACTION') {
        $($($selectedItem).parent().parent()).dropdown("restore defaults");
    }
};

function editClearing(clearingID) {
    clearModel();
    UPDATE_CLEARING = clearingID;
    $('#excel-btn').hide();
    $('#sample-xlsx').hide();
    var data = CLEARING_DATA[UPDATE_CLEARING];

    var weight = 0;
    var total = 0;
    let grossWeight=0;
    $.each(data.details, function (index, value) {
        value.netWeight = parseFloat(value.netWeight).toFixed(2);
        value.UnitPrice = parseFloat(value.UnitPrice).toFixed(2);
        $('#clearingTable').append(`
                <tr>
                    <td class="p-2" contenteditable="true">${value.itemNo}</td>
                    <td class="p-2" contenteditable="true">${value.carton}</td>
                    <td class="text-center p-2" contenteditable="true">${value.description}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value value-per-tone" contenteditable="true">${value.valuePerTone}</td>
                    <td class="text-center p-2">${value.perWeight}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${value.netWeight}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${value.grossWeight}</td>
                    <td class="text-center p-2">${value.perQuanity}</td>
                    <td class="text-right p-2">${value.totalQuanity}</td>
                    <td class="text-center p-2">${value.unit}</td>
                    <td class="text-right p-2 doubletd paste next-row-column change-value" contenteditable="true">${value.unitPrice}</td>
                    <td class="text-right p-2">${value.total}</td>
                    <td class="text-center p-2"><button class="btn btn-inverse-danger btn-rounded p-10 remove-row"><i class="mdi mdi-delete-variant"></i></button></td>
                </tr>`);
        weight += parseFloat(value.netWeight);
        grossWeight += parseFloat(value.grossWeight);
        total += parseFloat(value.unitPrice) * parseFloat(value.totalQuanity);
    });
    $('#excel').val("");
    $('#excel-btn').find('i').addClass('d-none');
    $('#excel-btn').removeAttr('disabled');

    $(".doubletd").keypress(isNumberTD);
    $('.paste').on('paste', false);
    $(".next-row-column").keypress(nextRawColumn);
    $('.change-value').keyup(changeValue);
    $('.remove-row').click(removeProdctRow);
    
//    $('.value-per-tone').keyup(changeValuePerTone);

    $('#need-weight-invoce-input').val(weight.toFixed(2));
    numberAnimation('total-net-weight-invoice', weight.toFixed(2));
    numberAnimation('gross-weight-invoice', grossWeight.toFixed(2));
    numberAnimation('need-weight-invoice', weight.toFixed(2));
    numberAnimation('adjust-weight-invoice', 0.00);
    numberAnimation('total-amount-invoice', total.toFixed(2));

    $('#clearingAttchment').modal({backdrop: 'static',keyboard: false}).modal('show');
}

function makePackigListPDF(clearingID) {
    console.log(clearingID);
    var data = CLEARING_DATA[clearingID];
    
    var docDefinition = {
        info: {
            title: `PACKING LIST`,
            author: 'Asian Cargo',
            subject: 'Packing List',
            keywords: 'Pupose of Shipment Invoice'
        },
        content: [
            {
                layout: layout,
                style: 'tableExample',
                color: '#000',
                table: {
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [[{text: 'PACKING LIST', style: 'TabelHeader', colSpan: 10, rowSpan: 2, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                        [{text: "ITEM NO", alignment: 'center', style: 'header'}, {text: "DESCRIPTION", alignment: 'center', colSpan: 3, style: 'header'}, {}, {}, {text: "CTNS", alignment: 'center', style: 'header'}, {text: "U. QTY /CTN", alignment: 'center', style: 'header'}, {text: "PACKING", alignment: 'center', style: 'header'}, {text: "T. QTY", alignment: 'center', style: 'header'}, {text: "T. NET. W. (KGS)", alignment: 'center', style: 'header'}, {text: "T. GROSS. W. (KGS)", alignment: 'center', style: 'header'}]
                    ]
                }
            }
        ],
        styles: styles
    };

    var totalGross = 0;
    var totalNet = 0;
    $.each(data.details, function (index, value) {
        docDefinition.content[0].table.body.push([{text: value.itemNo.toUpperCase(), alignment: 'center', style: 'normal'}, {text: value.description.toUpperCase(), colSpan: 3, alignment: 'center', style: 'normal'}, {}, {}, {text: value.carton, alignment: 'center', style: 'normal'}, {text: value.perQuanity, alignment: 'center', style: 'normal'}, {text: value.unit, alignment: 'center', style: 'normal'}, {text: value.totalQuanity, alignment: 'center', style: 'normal'}, {text: parseFloat(value.netWeight).toFixed(2), alignment: 'right', style: 'normal'}, {text: parseFloat(value.grossWeight).toFixed(2), alignment: 'right', style: 'normal'}]);
        totalGross += parseFloat(value.grossWeight);
        totalNet += parseFloat(value.netWeight);
    });

    docDefinition.content[0].table.body.push([{text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: "", alignment: 'center', style: 'header', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: totalNet.toFixed(2), alignment: 'right', style: 'header', border: [false, false, true, true]}, {text: totalGross.toFixed(2), alignment: 'right', style: 'header', border: [false, false, false, true]}]);

    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('#packinglist-pdf').attr('src', result);
        $('#packinglist').modal('show');
    });
}

function makeInvoicePDF(clearingID) {
    var data = CLEARING_DATA[clearingID];
    var docDefinition = {
        info: {
            title: `INVOICE`,
            author: 'Asian Cargo',
            subject: 'Invoice',
            keywords: 'Pupose of Shipment Invoice'
        },
        content: [
            {
                layout: layout,
                style: 'tableExample',
                color: '#000',
                table: {
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [{text: 'INVOICE', style: 'TabelHeader', colSpan: 10, rowSpan: 2, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                        [{text: "ITEM NO", alignment: 'center', style: 'header'}, {text: "DESCRIPTION", alignment: 'center', colSpan: 3, style: 'header'}, {}, {}, {text: "CTNS", alignment: 'center', style: 'header'}, {text: "U. QTY /CTN", alignment: 'center', style: 'header'}, {text: "PACKING", alignment: 'center', style: 'header'}, {text: "T. QTY", alignment: 'center', style: 'header'}, {text: "U. PRICE /PCS", alignment: 'center', style: 'header'}, {text: "T. AMT", alignment: 'center', style: 'header'}]
                    ]
                }
            }
        ],
        styles: styles
    };

    var total = 0;
    $.each(data.details, function (index, value) {
        docDefinition.content[0].table.body.push([{text: value.itemNo.toUpperCase(), alignment: 'center', style: 'normal'}, {text: value.description.toUpperCase(), colSpan: 3, alignment: 'center', style: 'normal'}, {}, {}, {text: value.carton, alignment: 'center', style: 'normal'}, {text: value.perQuanity, alignment: 'center', style: 'normal'}, {text: value.unit, alignment: 'center', style: 'normal'}, {text: value.totalQuanity, alignment: 'center', style: 'normal'}, {text: parseFloat(value.unitPrice).toFixed(2), alignment: 'right', style: 'normal'}, {text: parseFloat(value.total).toFixed(2), alignment: 'right', style: 'normal'}]);
        total += parseFloat(value.total);
    });

    docDefinition.content[0].table.body.push([{text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: "", alignment: 'center', style: 'header', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: '', border: [false, false, false, true]}, {text: total.toFixed(2), alignment: 'right', style: 'header', border: [false, false, false, true]}]);

    docDefinition.content.push({text: '      '});
    docDefinition.content.push({text: '      '});
    docDefinition.content.push({text: 'SHIPPING MARKS:BK', style: 'TabelHeader'});
    docDefinition.content.push({
        layout: layout,
        style: 'tableExample',
        color: '#000',
        table: {
            widths: [100, 100],
            body: [[{text: 'C&F:', border: [false, false, false, false], style: 'header'}, {text: total.toFixed(2), border: [false, false, false, false], style: 'header', alignment: 'right'}],
            ]
        }
    });

    docDefinition.content.push({text: `SAYS: ${toWords(total.toFixed(2)).toUpperCase()} ONLY`, style: 'header'});


    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('#packinglist-pdf').attr('src', result);
        $('#packinglist').modal('show');
    });
}

function clearModel() {
    $('#valuePerTone').val("0.700");
    $('#need-weight-invoce-input').val("0");
    $('#clearingTable').html("");

    numberAnimation('total-net-weight-invoice', "0.00");
    numberAnimation('need-weight-invoice', "0.00");
    numberAnimation('adjust-weight-invoice', "0.00");
    numberAnimation('total-amount-invoice', "0.00");
}

function drawClearingTable() {
    var idIndex = 0;
    CLEARING_DATA_TABLE.clear();
    $.each(CLEARING_DATA, function (index, value) {
        var date=new Date(value.date);
        CLEARING_DATA_TABLE.row.add([index,(idIndex+1),`${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
            `<select class="ui fluid dropdown dropdown-center table-transparent">
                        <option value=''>SELECT ACTION</option>
                        <option value='EDIT'>EDIT</option>
                        <option value='PACKING LIST'>PACKING LIST</option>
                        <option value='INVOICE'>INVOICE</option>
                    </select>`]).draw();
        $(`.ui.fluid.dropdown.dropdown-center.table-transparent`).dropdown({selectOnKeydown: false, onChange: valueChanger});
//        $(`.ui.fluid.dropdown.dropdown-center${classnames}`).dropdown({selectOnKeydown: false, onChange: valueChanger});
        idIndex++;
    });
    $('.content-wrapper').removeClass('d-none');
    $('#loader').addClass('d-none');
    var info = CLEARING_DATA_TABLE.page.info();
    $('.total-record').text(info.recordsTotal);
    $('.show-records').text(info.end);
    $('#previous-record').attr('disabled', 'true');
    if (CLEARING_INDEX >= info.pages) {
        $('#next-record').attr('disabled', 'true');
    }
}


$('#clearingAttchment').on('hidden.bs.modal', function (e) {
  UPDATE_CLEARING = null;
});

destroy = function () {
    $(".nav li:nth-child(3)").find('img').addClass('activenac');
    $('#clearingShipmentAutoSearch').addClass('d-none');
};