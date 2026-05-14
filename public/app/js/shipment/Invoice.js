var invoiceShipment = null;
var INVOICE_SHIPMENT = null;
var INVOICE_STATE = null;

var VALUEPERTONE_INDEX = 0;
var INVOICETABLE = null;
var EDITOR = null;
var FILE_INVOICE_NAME_EXCEL;

$(function () {

    if ($('#pdf-invoice-content').is(":visible")) {
        $("#edit-invoice-content").show('fast');
        $("#pdf-invoice-content").hide('fast');
    }


    INVOICETABLE = $('#invoice-table').DataTable({
        order: [[0, "asc"]],
        paging: false,
        columnDefs: [
            {
                targets: [3],
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('width', '1%');
                    $(td).css('padding', '0');
                }
            },
            {
                targets: [2, 5],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).addClass('text-center doubletd paste next-row-column change-value');
                    $(td).attr('contenteditable', 'true');
                }
            },
            {
                targets: [8],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).addClass('text-right doubletd paste next-row-column change-value');
                    $(td).attr('contenteditable', 'true');
                }
            },
            {
                targets: [6, 9],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).addClass('text-right');
                }
            },
            {
                targets: [1, 3, 7],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).addClass('text-center');
                }
            }],
        initComplete: function (settings, json) {
            $('#invoice-table_info').hide();
            $('#invoice-table_filter').hide();
            $('#invoice-table_length').hide();
            $('#invoice-table_paginate').hide();
        }
    });

    $('.dropleft').on('show.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    $('.dropleft').on('hide.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });

    $(".double").keypress(isNumber);
    $('.paste').on('paste', false);

    $('#sort').click(function () {
        drawEditInvoice(false);
    });
    $('#goodsmerged').click(function () {
        drawEditInvoice(false);
    });
    $('#unitmerged').click(function () {
        drawEditInvoice(false);
    });

    $('#isInvoiced').click(enableInvoiceControl);

    $('#change-all-pertone').click(function () {
        var grantTotal = 0;
        $('#invoice-table > tbody > tr').each(function (i, el) {
            $(el).children().eq(2).text($('#valuePerTone').val());
            var netWeight = parseFloat($(el).children().eq(5).text());
            var valuePertone = parseFloat($('#valuePerTone').val());
            var quantity = parseFloat($(el).children().eq(6).text());

            var total = netWeight * valuePertone;
            var unitprice = total / quantity;

            if (parseFloat(unitprice.toFixed(2)) < 0.01) {
                unitprice = 0.01;
            }

            $(el).children().eq(8).text(unitprice.toFixed(2));
            $(el).children().eq(9).text(total.toFixed(2));

            unitprice = parseFloat($(el).children().eq(8).text());
            total = quantity * unitprice;
            $(el).children().eq(9).text(total.toFixed(2));
            grantTotal += parseFloat($(el).children().eq(9).text());
        });
        numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
    });

    $('#invoice-update').click(updateInvoice);

    $('#change-need-weight').click(function () {
        var needWeight = parseFloat($('#need-weight-invoce-input').val());

        var adjustment = needWeight - parseFloat($('#total-net-weight-invoice').text());
        var concat = '';
        if (adjustment > 0) {
            concat = '+';
        }

        if (needWeight === 0) {
            if ((adjustment + "").startsWith("-")) {
                adjustment = adjustment * (-1);
            }
            concat = '';
        }

        numberAnimation('need-weight-invoice', needWeight.toFixed(2));
        numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));

    });

    $('#change-adjust-weight-percent').click(function () {
        if (!isEmpty($('#adjust-weight-poercent-invoce-input').val())) {
            var grantTotal = 0;
            var grantNetWeight = 0;
            $('#invoice-table > tbody > tr').each(function (i, el) {
                if (parseFloat($(el).children().eq(5).text()) > 10) {
                    let adjustPercent = (parseFloat($(el).children().eq(5).text()) * (parseFloat($('#adjust-weight-poercent-invoce-input').val()) / 100));
                    if ($('#adjust-weight-invoice').text().startsWith('-')) {
                        let adjustWeight = parseFloat($(el).children().eq(5).text()) - adjustPercent;
                        $(el).children().eq(5).text(adjustWeight.toFixed());
                    } else if ($('#adjust-weight-invoice').text().startsWith('+')) {
                        let adjustWeight = parseFloat($(el).children().eq(5).text()) + adjustPercent;
                        $(el).children().eq(5).text(adjustWeight.toFixed());
                    }
                    let total = parseFloat($(el).children().eq(5).text()) * parseFloat($(el).children().eq(2).text());
                    let unitprice = parseFloat((total / parseFloat($(el).children().eq(6).text())).toFixed(2));

                    if (parseFloat(unitprice.toFixed(2)) < 0.01) {
                        unitprice = 0.01;
                    }

                    $(el).children().eq(8).text(unitprice.toFixed(2));
                    $(el).children().eq(9).text(total.toFixed(2));

                    let netWeight = parseFloat($(el).children().eq(5).text());
                    let quantity = parseFloat($(el).children().eq(6).text());

                    let UNIT = $(el).children().eq(7).text();
                    var perWeight = 0;
                    if (units[getKey(UNIT)].isReverse) {
                        perWeight = netWeight / (quantity * units[getKey(UNIT)].reverse);
                    } else {
                        perWeight = netWeight / quantity;
                    }
                    $(el).children().eq(4).text(perWeight.toFixed(4));
                }
                grantTotal += parseFloat($(el).children().eq(9).text());
                grantNetWeight += parseFloat($(el).children().eq(5).text());
            });

            numberAnimation('total-net-weight-invoice', grantNetWeight.toFixed(2));
            var needWeight = parseFloat($('#need-weight-invoice').text());

            var adjustment = parseFloat(needWeight.toFixed(2)) - parseFloat(grantNetWeight.toFixed(2));
            var concat = '';
            if (adjustment > 0) {
                concat = '+';
            }

            if (needWeight === 0) {
                if ((adjustment + "").startsWith("-")) {
                    adjustment = adjustment * (-1);
                }
                concat = '';
            }

            numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));
            numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
        }
    });
});

function updateInvoice() {
    INVOICETABLE.columns(1).search('').draw();
    calculationTotal();
    var data = {
        sort: $('#sort').is(":checked"),
        isInvoiced: true,
        goodsmerged: $('#goodsmerged').is(":checked"),
        unitmerged: $('#unitmerged').is(":checked"),
        valuePerTone: $('#valuePerTone').val(),
        needWeight: $('#need-weight-invoice').text(),
        invoice: {
            grantWeightTotal: $('#total-net-weight-invoice').text(),
            needWeight: $('#need-weight-invoice').text(),
            adjustment: $('#adjust-weight-invoice').text(),
            grantTotal: $('#total-amount-invoice').text(),
            insurance: $('#insurance-invoice').val(),
            freight: $('#freight-invoice').val(),
            data: []
        }
    };
    var proData = {};
    $('#invoice-table > tbody > tr').each(function (i, el) {
        proData[getKey($(el).children().eq(1).text())] = {
            valuePerTone: $(el).children().eq(2).text()
        };
        data.invoice.data.push({
            goods: $(el).children().eq(1).text(),
            valuePerTone: $(el).children().eq(2).text(),
            perWeight: $(el).children().eq(4).text(),
            netWeight: $(el).children().eq(5).text(),
            quantity: $(el).children().eq(6).text(),
            unit: $(el).children().eq(7).text(),
            unitPrice: $(el).children().eq(8).text(),
            total: $(el).children().eq(9).text()
        });
    });

    var datas = {};
    datas[INVOICE_STATE] = data;

    $.ajax({
        url: "/updateProducts",
        type: "POST",
        data: JSON.stringify({data: proData}),
        dataType: 'json',
        headers: {
            Accept: "application/json",
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        cache: false,
        success: function (data) {
        }
    });

    $.ajax({
        url: "/createInvoice",
        type: "POST",
        data: JSON.stringify({key: INVOICE_SHIPMENT, data: datas}),
        dataType: 'json',
        beforeSend: function (xhr) {
            $('#invoice-update').find('i').removeClass('d-none');
            $('#invoice-update').attr('disabled', 'true');
        },
        headers: {
            Accept: "application/json",
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        cache: false,
        success: function (data) {
            if (data.status === "success") {
                invoiceShipment = data.data[INVOICE_STATE];
                shipments[INVOICE_SHIPMENT] = data.data;

                $('#invoice-update').find('i').addClass('d-none');
                $('#invoice-update').removeAttr('disabled');

                makeInvoicePDF();

            } else if (data.status === "error") {
                Lobibox.notify('warning', {position: 'top right', msg: data.error});
            }
        },
        error: function (xhr, status, error) {
            Lobibox.notify('warning', {position: 'top right', msg: error});
        }
    });
}

function makeInvoicePDF() {
    var stateSip = shipments[INVOICE_SHIPMENT][INVOICE_STATE];
    var plShipment = shipments[INVOICE_SHIPMENT];
    var shipmentNo = plShipment.shipment;
    if (plShipment.hasOwnProperty('editShipment')) {
        shipmentNo = plShipment.editShipment;
    }
    
    $(`#excle-invoice-Table`).html('');

    var docDefinition = {
        info: {
            title: `INOVICE ${shipmentNo}`,
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
                    widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*'],
                    body: [
                        [{text: 'INVOICE', style: 'TabelHeader', colSpan: 9, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}]
                    ]
                }
            }
        ],
        styles: styles
    };

    $(`#excle-invoice-Table`).append(`<tr><td data-b-a-s="thin" data-b-a-c="a8a5a5" colspan="9" data-f-bold="true" data-f-sz="12" data-a-h="center">INVOICE</td></tr>`);

    getHeader(plShipment, docDefinition);
//    var marks = "NSS & NMR /CMB";
    var marks = "ASC/CMB";
    if (plShipment.hasOwnProperty('marks')) {
        marks = plShipment.marks;
    }

    docDefinition.content[0].table.body.push([{text: 'MARKS & No. ' + marks, style: 'header', alignment: 'center'}, {text: '\nDESCRIPTION', style: 'header', colSpan: 3, alignment: 'center'}, {}, {}, {text: '\nNET WEIGHT', style: 'header', alignment: 'center'}, {text: '\nQUANTITY', style: 'header', alignment: 'center'}, {text: '\nUNIT', style: 'header', alignment: 'center'}, {text: '\nUNIT PRICE', style: 'header', alignment: 'center'}, {text: '\nTOTAL', style: 'header', alignment: 'center'}]);
    $(`#excle-invoice-Table`).append(`<tr><td data-a-h="center" data-a-wrap="true" data-f-bold="true" data-b-a-s="thin" data-b-a-c="a8a5a5">MARKS & No. ${marks}</td><td data-a-h="center" data-f-bold="true" colspan="3" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">DESCRIPTION</td>
    <td data-a-h="center" data-f-bold="true" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">NET WEIGHT</td><td data-a-h="center" data-f-bold="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">QUANTITY</td><td data-a-h="center" data-f-bold="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">UNIT</td><td data-a-h="center" data-f-bold="true" data-a-wrap="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">UNIT PRICE</td><td data-a-h="center" data-f-bold="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">TOTAL</td></tr>`);

    $.each(stateSip.invoice.data, function (index, value) {
        let indexNumber=index + 1;
        docDefinition.content[0].table.body.push([{text: indexNumber, style: 'normal', alignment: 'center'}, {text: value.goods, style: 'normal', colSpan: 3, alignment: 'center'}, {}, {}, {text: parseFloat(value.netWeight).toFixed(2), style: 'normal', alignment: 'center'}, {text: value.quantity, style: 'normal', alignment: 'center'}, {text: value.unit, style: 'normal', alignment: 'center'}, {text: parseFloat(value.unitPrice).toFixed(2), style: 'normal', alignment: 'right'}, {text: value.total, style: 'normal', alignment: 'right'}]);
        $(`#excle-invoice-Table`).append(`<tr><td data-a-h="center" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">${indexNumber}</td><td data-a-h="center" colspan="3" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">${value.goods}</td>
    <td data-a-h="right" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="n">${parseFloat(value.netWeight).toFixed(2)}</td><td data-a-h="center" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">${value.quantity}</td><td data-a-h="center" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">${value.unit}</td><td data-a-h="right" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="n">${parseFloat(value.unitPrice).toFixed(2)}</td><td data-a-h="right" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="n">${value.total}</td></tr>`);

    });

    var Total = parseFloat(stateSip.invoice.grantTotal);
    var Insurance = parseFloat(stateSip.invoice.insurance);
    var FreightCharges = parseFloat(stateSip.invoice.freight);
    var Cost = Total - (Insurance + FreightCharges);

    docDefinition.content[0].table.body.push([{text: '         ', style: 'TabelHeader', rowSpan: 2, colSpan: 9, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td data-f-sz="12" rowspan="2" colspan="9" data-a-h="center" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5"></td></tr><tr></tr>`);
    docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);
    docDefinition.content[0].table.body.push([{text: 'CIF DETAILS', style: 'TabelHeader', colSpan: 9, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td data-f-bold="true" colspan="9" data-a-h="center" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">CIF DETAILS</td></tr>`);
    docDefinition.content[0].table.body.push([{text: '', style: 'header', colSpan: 5, alignment: 'center'}, {}, {}, {}, {}, {text: 'COST', style: 'header', colSpan: 2, alignment: 'left'}, {}, {text: '' + Cost.toFixed(2), style: 'header', colSpan: 2, alignment: 'right'}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td colspan="5" data-b-a-s="thin" data-b-a-c="a8a5a5"></td><td data-f-bold="true" colspan="2" data-a-h="left" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">COST</td><td data-f-bold="true" colspan="2" data-a-h="right" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="2">${Cost.toFixed(2)}</td></tr>`);
    docDefinition.content[0].table.body.push([{text: '', style: 'header', colSpan: 5, alignment: 'center'}, {}, {}, {}, {}, {text: 'FREIGHT', style: 'header', colSpan: 2, alignment: 'left'}, {}, {text: '' + FreightCharges.toFixed(2), style: 'header', colSpan: 2, alignment: 'right'}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td colspan="5" data-b-a-s="thin" data-b-a-c="a8a5a5"></td><td data-f-bold="true" colspan="2" data-a-h="left" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">FREIGHT</td><td data-f-bold="true" colspan="2" data-a-h="right" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="2">${FreightCharges.toFixed(2)}</td></tr>`);
    docDefinition.content[0].table.body.push([{text: '', style: 'header', colSpan: 5, alignment: 'center'}, {}, {}, {}, {}, {text: 'INSURANCE', style: 'header', colSpan: 2, alignment: 'left'}, {}, {text: '' + Insurance.toFixed(2), style: 'header', colSpan: 2, alignment: 'right'}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td colspan="5" data-b-a-s="thin" data-b-a-c="a8a5a5"></td><td data-f-bold="true" colspan="2" data-a-h="left" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">INSURANCE</td><td data-f-bold="true" colspan="2" data-a-h="right" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="2">${Insurance.toFixed(2)}</td></tr>`);
    docDefinition.content[0].table.body.push([{text: '', style: 'header', colSpan: 5, alignment: 'center'}, {}, {}, {}, {}, {text: 'TOTAL', style: 'header', colSpan: 2, alignment: 'left', fontSize: 12}, {}, {text: '' + Total.toFixed(2), style: 'header', colSpan: 2, alignment: 'right', fontSize: 12}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td colspan="5" data-b-a-s="thin" data-b-a-c="a8a5a5"></td><td data-f-bold="true" colspan="2" data-a-h="left" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-f-sz="12">TOTAL</td><td data-f-bold="true" colspan="2" data-a-h="right" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="2" data-f-sz="12">${Total.toFixed(2)}</td></tr>`);
    docDefinition.content[0].table.body.push([{text: '       ', style: 'TabelHeader', colSpan: 9, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td data-f-sz="12" colspan="9" data-a-h="center" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5"></td></tr>`);
    docDefinition.content[0].table.body.push([{text: 'We Declare that this Proforma- Invoice Shows the actual Price of the Goods\nDescribed and that all Particulars are true and correct.', style: 'header', rowSpan: 2, colSpan: 9, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}]);
    $(`#excle-invoice-Table`).append(`<tr><td rowspan="2" colspan="9" data-a-h="center" data-a-wrap="true" data-b-a-s="thin" data-b-a-c="a8a5a5">We Declare that this Proforma- Invoice Shows the actual Price of the Goods\nDescribed and that all Particulars are true and correct.</td></tr><tr></tr>`);
    docDefinition.content[0].table.body.push([{}, {}, {}, {}, {}, {}, {}, {}, {}]);


    FILE_INVOICE_NAME_EXCEL = `INOVICE ${shipmentNo}`;
    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('.invoice-pdf').attr('src', result);

        if (!$('#pdf-invoice-content').is(":visible")) {
            $("#edit-invoice-content").hide('fast');
            $("#pdf-invoice-content").show('fast');
        }
        if (!$('#invoice').is(":visible")) {
            $('#invoice').modal({backdrop: 'static', keyboard: false}).modal('show');
        }
    });
}

$(`#exporte-invoice-excel`).click((e) => {
    let table = document.querySelector("#excle-invoice-Table");
    TableToExcel.convert(table, {
        name: `${FILE_INVOICE_NAME_EXCEL}.xlsx`,
        sheet: {
            name: FILE_INVOICE_NAME_EXCEL
        }
    });
});

function enableInvoiceControl() {
    if ($('#isInvoiced').is(":checked")) {
        if (invoiceShipment.hasOwnProperty('isInvoiced')) {
            if (invoiceShipment.isInvoiced) {
                $(".invoice-controle").hide(1000);
                $("#pdf-invoice-content").hide('fast');
                $("#edit-invoice-content").show('fast');
                drawInvoice(true);
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: `Not Already Invoiced`});
                $("#isInvoiced").prop('checked', false);
                $('.dropleft').find('.dropdown-menu').first().stop(true, true).slideUp();
            }
        } else {
            Lobibox.notify('warning', {position: 'top right', msg: `Not Already Invoiced`});
            $("#isInvoiced").prop('checked', false);
            $('.dropleft').find('.dropdown-menu').first().stop(true, true).slideUp();
        }
    } else {
        $(".invoice-controle").first().show("fast", function showNext() {
            $(this).next(".invoice-controle").show("fast", showNext);
        });
        if (invoiceShipment !== null) {
            $("#pdf-invoice-content").hide('fast');
            $("#edit-invoice-content").show('fast');
            drawEditInvoice(true);
        }
    }
}

function Invoice(shipment, classname) {
    INVOICE_SHIPMENT = shipment;
    INVOICE_STATE = $(`.${classname}`).dropdown("get value");
    invoiceShipment = shipments[shipment][$(`.${classname}`).dropdown("get value")];

    var plShipment = shipments[shipment];
    var shipmentNo = plShipment.shipment;
    if (plShipment.hasOwnProperty('editShipment')) {
        shipmentNo = plShipment.editShipment;
    }

    $('.invoice-shipment').text(`SHIPMENT ${shipmentNo}`);

    $("#sort").prop('checked', true);
    $("#goodsmerged").prop('checked', true);
    $("#unitmerged").prop('checked', true);

    if (invoiceShipment.hasOwnProperty('sort')) {
        $('#sort').prop('checked', invoiceShipment.sort);
    }

    if (invoiceShipment.hasOwnProperty('goodsmerged')) {
        $('#goodsmerged').prop('checked', invoiceShipment.goodsmerged);
    }

    if (invoiceShipment.hasOwnProperty('unitmerged')) {
        $('#unitmerged').prop('checked', invoiceShipment.unitmerged);
    }


    if (invoiceShipment.hasOwnProperty('valuePerTone')) {
        $('#valuePerTone').val(invoiceShipment.valuePerTone);
    }

    if (invoiceShipment.hasOwnProperty('isInvoiced')) {
        $('#isInvoiced').prop('checked', invoiceShipment.isInvoiced);

        if (invoiceShipment.isInvoiced) {
            makeInvoicePDF();
            $('#edit-invoiced').click(function () {
                $(".invoice-controle").hide(1000);
                drawInvoice(false);
            });

            $("#invoiceCalculation").click(calculationTotal);
            $("#invoiceSearch").keyup(function () {
                INVOICETABLE.columns(1).search(this.value).draw();
            });
        } else {
            enableInvoiceControl();
        }

    } else {
        enableInvoiceControl();
    }
}

function showValuePerTone(goods, index) {
    $('#valuePerToneModalLabel').text(goods);
    $('#valuePerToneTable > tbody').html("");
    let valueperToneArray = SHIPMENTS_ARRAY.filter(ship => ship.isActive && ship[ship.activeStatus].isInvoiced && ship[ship.activeStatus].invoice.data.find(pro => pro.goods === goods) !== undefined && (`${ship.exporter} SHIPMENT ${ship.shipment}`) !== INVOICE_SHIPMENT).map(ship => ({
            date: ship.date,
            exporter: ship.exporter,
            shipment: ship.shipment,
            data: ship[ship.activeStatus].invoice.data.filter(pro => pro.goods === goods)[0]
        }));
    valueperToneArray.forEach((value, index) => {
        if (index < 5) {
            $('#valuePerToneTable > tbody').append(`<tr>
        <td>${dateFormatForTimeStamp(value.date)}</td>
        <td>${value.shipment}</td>
        <td>${exporters[value.exporter].exName}</td>
        <td class="bolt">${parseFloat(value.data.valuePerTone).toFixed(3)}</td>
        <td style="width:1%;padding:0">
            <button type="button" class="btn btn-sm btn-inverse-success changeValuePerToneOldest" style="height:50px; width:50px; border-radius:0;">
                <i class="mdi mdi-plus"></i>
            </button>
        </td>
        </tr>`);
        }
    });
    $('.changeValuePerToneOldest').click(changeValuePerToneOldest);
    VALUEPERTONE_INDEX = index
    $('#valuePerToneModal').modal('show');
}

function changeValuePerToneOldest() {
    $('#valuePerToneModal').modal('hide');
    $('#invoice-table > tbody > tr').each(function (i, el) {
        if ($(el).children().eq(0).text() === (VALUEPERTONE_INDEX + "")) {
            VALUEPERTONE_INDEX = i;
            return false;
        }
    });

    let valuePertone = parseFloat($('#valuePerToneTable > tbody').find(`tr:eq(${$(this).parent().parent().index()})`).find(`td:eq(3)`).text());

    var netWeight = parseFloat($('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(5)`).text());
    var quantity = parseFloat($('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(6)`).text());
    var unitprice = parseFloat($('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(8)`).text());
    var total = parseFloat($('#invoice-table').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(9)`).text());

    $('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(2)`).text(valuePertone.toFixed(3));

    var unit = $('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(7)`).text();
    unit = units[getKey(unit)];
    if (unit.isReverse) {
        quantity *= unit.reverse;
    }


    total = netWeight * valuePertone;
    unitprice = parseFloat((total / parseFloat($('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(6)`).text())).toFixed(2));

    $('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(8)`).text(unitprice.toFixed(2));
    $('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(9)`).text(total.toFixed(2));


    var quantity = parseFloat($('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(6)`).text());
    var unitprice = parseFloat($('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(8)`).text());

    total = quantity * unitprice;
    $('#invoice-table > tbody').find(`tr:eq(${VALUEPERTONE_INDEX})`).find(`td:eq(9)`).text(total.toFixed(2));

    calculationTotal();
}

function calculationTotal() {
    var grantTotal = 0;
    var grantNetWeight = 0;
    INVOICETABLE.columns(1).search('').draw();
    $('#invoice-table > tbody > tr').each(function (i, el) {
        grantTotal += parseFloat($(el).children().eq(9).text());
        grantNetWeight += parseFloat($(el).children().eq(5).text());
    });
    INVOICETABLE.columns(1).search($('#invoiceSearch').val()).draw();

    numberAnimation('total-net-weight-invoice', grantNetWeight.toFixed(2));
    var needWeight = parseFloat($('#need-weight-invoice').text());

    var adjustment = parseFloat(needWeight.toFixed(2)) - parseFloat(grantNetWeight.toFixed(2));
    var concat = '';
    if (adjustment > 0) {
        concat = '+';
    }

    if (needWeight === 0) {
        if ((adjustment + "").startsWith("-")) {
            adjustment = adjustment * (-1);
        }
        concat = '';
    }

    numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));
    numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
}

function drawInvoice(state) {
    resetInvoice();
    INVOICETABLE.clear().draw();

    $.each(invoiceShipment.invoice.data, function (index, value) {
        let valueperToneArray = SHIPMENTS_ARRAY.filter(ship => ship.isActive && ship[ship.activeStatus].isInvoiced && ship[ship.activeStatus].invoice.data.find(pro => pro.goods === value.goods) !== undefined);
        let button = `<button type="button" class="btn btn-sm btn-inverse-warning" style="height:50px; border-radius:0;">
                    <i class="mdi mdi-alert-circle-outline"></i>
                  </button>`;
        if (valueperToneArray !== undefined && valueperToneArray.length > 1) {
            button = `<button type="button" class="btn btn-sm btn-inverse-success" style="height:50px; border-radius:0;" onclick="showValuePerTone('${value.goods}',${(index + 1)});">
                    <i class="mdi mdi-eye"></i>
                  </button>`;
        }
        INVOICETABLE.row.add([(index + 1), value.goods, value.valuePerTone, button, value.perWeight, value.netWeight, value.quantity, value.unit, value.unitPrice, value.total]).draw();
//        $('#invoice-table').append(`<tr>
//            <td>${index + 1}</td>
//            <td class="text-center">${value.goods}</td>
//            <td class="text-center doubletd paste next-row-column change-value" contenteditable="true">${value.valuePerTone}</td>
//            <td class="text-center">${value.perWeight}</td>
//            <td class="text-center doubletd paste next-row-column change-value" contenteditable="true">${value.netWeight}</td>
//            <td class="text-right">${value.quantity}</td>
//            <td class="text-center">${value.unit}</td>
//            <td class="text-right doubletd paste next-row-column change-value" contenteditable="true">${value.unitPrice}</td>
//            <td class="text-right">${value.total}</td>
//           </tr>`);
    });

    $('#insurance-invoice').val(invoiceShipment.invoice.insurance);
    $('#freight-invoice').val(invoiceShipment.invoice.freight);
    $('#valuePerTone').val(invoiceShipment.valuePerTone);

    $(".doubletd").keypress(isNumberTD);
    $('.paste').on('paste', false);
    $(".next-row-column").keypress(nextRawColumn);
    $('.change-value').keyup(changeValue);

    if (state) {
        $('#invoice').modal({backdrop: 'static', keyboard: false}).modal('show');
    }

    $('#need-weight-invoce-input').val(invoiceShipment.invoice.needWeight);
    numberAnimation('total-net-weight-invoice', invoiceShipment.invoice.grantWeightTotal);
    numberAnimation('need-weight-invoice', invoiceShipment.invoice.needWeight);
    numberAnimation('adjust-weight-invoice', invoiceShipment.invoice.adjustment);
    numberAnimation('total-amount-invoice', invoiceShipment.invoice.grantTotal);
}

function drawEditInvoice(state) {
    resetInvoice();
    var data = [];
    $.each(invoiceShipment.cartons, function (index, value) {
        if (value.customer !== "SAMPLE BOX") {
            $.each(value.products, function (index1, value1) {

//                if (value1.product === "AIR GUIDE") {
//                    console.log(value1.quantity);
//                }
                //Check is Merged
                if ($('#goodsmerged').is(":checked")) {
                    //Is Merged

                    //Find product Available
                    var isAvailable = data.find(x => x.goods === value1.product);
                    if (isAvailable !== undefined) {

                        isAvailable.netWeight += value.weight / value.products.length;
                        //Is product available

                        // Check is Unit Merged
                        if ($('#unitmerged').is(":checked")) {
                            // Is Unit Merged

                            //heck is possible to merged unit
                            console.log(value1);
                            console.log(value1.unit);
                            console.log(units[getKey(value1.unit)]);
                            if (units[getKey(value1.unit)].merge) {
                                //is possible to merged

                                //get unit possible merge
                                var unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= parseFloat(value1.quantity));
//                                if (value1.product === "AIR GUIDE") {
//                                    console.log(unit);
//                                }

                                if (unit !== undefined) {

                                    let correctQuantity = 0;
                                    if (isAvailable.unit === value1.unit) {
                                        correctQuantity = isAvailable.quantity + parseFloat(value1.quantity);

                                        unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= correctQuantity);
                                        if (unit !== undefined) {
                                            correctQuantity = correctQuantity / unit.quantity;
                                        }

                                    } else if (isAvailable.unit === unit.unit) {
                                        correctQuantity = isAvailable.quantity + (parseFloat(value1.quantity) / unit.quantity);
                                    } else {

                                        var currentQuantity = isAvailable.quantity;
                                        if (units[getKey(isAvailable.unit)].isReverse) {
                                            currentQuantity = isAvailable.quantity * units[getKey(isAvailable.unit)].reverse;
                                        }

                                        var nowQuantity = parseFloat(value1.quantity);
                                        if (units[getKey(value1.unit)].isReverse) {
                                            nowQuantity = nowQuantity + units[getKey(value1.unit)].reverse;
                                        }

                                        correctQuantity = (currentQuantity + nowQuantity) / unit.quantity;

                                    }

                                    isAvailable.quantity = correctQuantity;
                                    isAvailable.unit = unit.unit;

//                                    if (value1.product === "AIR GUIDE") {
//                                        console.log(value1.quantity);
//                                        console.log(isAvailable.quantity);
//                                        console.log("--------------------------------------------");
//                                    }


                                } else {

                                    if (value1.unit === isAvailable.unit) {
                                        isAvailable.quantity += parseFloat(value1.quantity);
                                    } else if (units[getKey(isAvailable.unit)].isReverse) {

//                                        let recheckUnit = units[getKey(isAvailable.unit)];

                                        let correctQuantity = (isAvailable.quantity * units[getKey(isAvailable.unit)].reverse) + parseFloat(value1.quantity);

                                        unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= correctQuantity);
                                        if (unit !== undefined) {
                                            if (value1.product === "AIR GUIDE") {
                                                console.log(correctQuantity)
                                            }
                                            correctQuantity = correctQuantity / unit.quantity;
                                            if (value1.product === "AIR GUIDE") {
                                                console.log(correctQuantity)
                                            }
                                        }

                                        isAvailable.quantity = correctQuantity;
                                        isAvailable.unit = unit.unit;

//                                        if (value1.product === "AIR GUIDE") {
//                                            console.log(correctQuantity);
//                                            console.log("------------------ IS REVERSE --------------------");
//                                        }
//
//                                        var array = $.map(units, function (value, index) {
//                                            return [value];
//                                        });
//
//                                        var found = array.find(element => element.hasOwnProperty('scale') && element.scale.find(elemnt1 => elemnt1.hasOwnProperty('quantity') && elemnt1.quantity === units[getKey(isAvailable.unit)].reverse) && element.unit === value1.unit);
//
//                                        if (found !== undefined) {
//                                            var valQuantity = isAvailable.quantity * units[getKey(isAvailable.unit)].reverse;
//
//                                            if (value1.product === "AIR GUIDE") {
//                                                console.log(found);
//                                                console.log(found.quantity);
//                                            }
//
//                                            unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= parseFloat(found.quantity));
//
//                                            if (unit !== undefined) {
//
//                                                if (value1.product === "AIR GUIDE") {
//                                                    console.log("------------------ NOT UNDEFIE --------------------");
//                                                }
//
//                                                isAvailable.quantity = (valQuantity + parseFloat(value1.quantity)) / unit.quantity;
//
//                                                //again get unit possible merge
//                                                unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= isAvailable.quantity);
//                                                if (unit !== undefined) {
//                                                    isAvailable.quantity = isAvailable.quantity / unit.quantity;
//                                                    isAvailable.unit = unit.unit;
//                                                }
//
//                                            } else {
//                                                if (value1.product === "AIR GUIDE") {
//                                                    console.log("------------------ UNDEFINE --------------------");
//                                                }
//                                            }
//                                        } else {
//                                            //Something Missing
//                                            isAvailable.quantity += parseFloat(value1.quantity);
//
//                                            if (value1.product === "AIR GUIDE") {
//                                                console.log("------------------ MISSING 2 --------------------");
//                                            }
//
//                                        }
                                    } else {
                                        //Something Missing
                                        isAvailable.quantity += parseFloat(value1.quantity);
                                    }
                                }

                            } else {
                                // is not possible to merged
                                unitAndQuantity(value1, isAvailable);
                            }

                        } else {
                            // Is Not Unit Merged
                            unitAndQuantity(value1, isAvailable);
                        }
                        perWeight(isAvailable);
                    } else {
                        //Is not product available

                        var unitName = value1.unit;
                        var QuanittyName = parseFloat(value1.quantity);
                        console.log(value1);
                        console.log(value1.unit);
                        if (units[getKey(value1.unit)].merge) {
                            var unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= parseFloat(value1.quantity));
                            if (unit !== undefined) {

                                QuanittyName = QuanittyName / unit.quantity;
                                unitName = unit.unit;
                            }
                        }
                        data.push({
                            goods: value1.product,
                            vpt: invoiceShipment.valuePerTone,
                            perWeight: (value.weight / value.products.length) / parseFloat(value1.quantity),
                            netWeight: value.weight / value.products.length,
                            quantity: QuanittyName,
                            unit: unitName
                        });
                    }

                } else {
                    //is Not Merged
                    data.push({
                        goods: value1.product,
                        vpt: invoiceShipment.valuePerTone,
                        perWeight: (value.weight / value.products.length) / parseFloat(value1.quantity),
                        netWeight: value.weight / value.products.length,
                        quantity: parseFloat(value1.quantity),
                        unit: value1.unit
                    });
                }
            });
        }
    });

    if ($('#sort').is(":checked")) {
        data = sortJSON(data, 'goods', '123');
    }

    var grantTotal = 0;
    var grantWeightTotal = 0;
    INVOICETABLE.clear().draw();
    $.each(data, function (index, value) {

//        if (value.goods === "BRAKE SHOE") {
//            console.log(value.quantity);
//        }

        if (units[getKey(value.unit)].isReverse && units[getKey(value.unit)].hasOwnProperty('scale')) {
            let correctQuantity = value.quantity;

            let unit = units[getKey(value.unit)].scale.find(x => x.quantity <= correctQuantity);
            if (unit !== undefined) {
                correctQuantity = correctQuantity / unit.quantity;
                value.quantity = correctQuantity;
                value.unit = unit.unit;
            }

        }

//        var goods = products[getKey(value.goods)];
//        console.log(value.goods);
//        console.log(getKey(value.goods));
//        console.log(goods);
//        var categ = category[getKey(goods.category)];
        var valuePerTone = "0.700";
//        var className = "";
//        if (goods.hasOwnProperty('valuePerTone')) {
//            valuePerTone = goods.valuePerTone;
//            className = "bg-inverse-success";
//        } else if (categ !== undefined && categ.hasOwnProperty('valuePerTone')) {
//            valuePerTone = categ.valuePerTone;
//            className = "bg-inverse-success";
//        }
//
//        console.log(className);


        //filter Additional   :  && (`${ship.exporter} SHIPMENT ${ship.shipment}`) !== INVOICE_SHIPMENT
        let valueperToneArray = SHIPMENTS_ARRAY.filter(ship => ship.isActive && ship[ship.activeStatus].isInvoiced && ship[ship.activeStatus].invoice.data.find(pro => pro.goods === value.goods) !== undefined).map(ship => ({
                date: ship.date,
                exporter: ship.exporter,
                shipment: ship.shipment,
                data: ship[ship.activeStatus].invoice.data.filter(pro => pro.goods === value.goods)[0]
            }));

        let button = `<button type="button" class="btn btn-sm btn-inverse-warning" style="height:50px; border-radius:0;">
                    <i class="mdi mdi-alert-circle-outline"></i>
                  </button>`;
        if (valueperToneArray !== undefined && valueperToneArray.length > 0) {
            button = `<button type="button" class="btn btn-sm btn-inverse-success" style="height:50px; border-radius:0;" onclick="showValuePerTone('${value.goods}',${(index + 1)});">
                    <i class="mdi mdi-eye"></i>
                  </button>`;
            valuePerTone = parseFloat(valueperToneArray[0].data.valuePerTone).toFixed(3);
        }

        valuePerTone = parseFloat(valuePerTone);

        var total = value.netWeight * valuePerTone;
        var unitPrice = parseFloat((total / value.quantity).toFixed(2));

        if (unitPrice < 0.01) {
            unitPrice = 0.01;
            total = unitPrice * value.quantity;
            valuePerTone = total / value.netWeight;
        }




        value.perWeight = parseFloat(value.perWeight.toFixed(4));
        total = parseFloat(parseFloat(value.quantity).toFixed(2)) * parseFloat(unitPrice.toFixed(2));

        INVOICETABLE.row.add([(index + 1), value.goods, valuePerTone.toFixed(3), button, value.perWeight, value.netWeight.toFixed(2), parseFloat(value.quantity).toFixed(2),
            value.unit, unitPrice.toFixed(2), total.toFixed(2)]).draw();
//        $('#invoice-table').append(`<tr class="${className}">
//            <td>${index + 1}</td>
//            <td class="text-center">${value.goods}</td>
//            <td class="text-center doubletd paste next-row-column change-value" contenteditable="true">${valuePerTone.toFixed(3)}</td>
//            <td class="text-center">${value.perWeight}</td>
//            <td class="text-center doubletd paste next-row-column change-value" contenteditable="true">${value.netWeight.toFixed(2)}</td>
//            <td class="text-right">${parseFloat(value.quantity).toFixed(2)}</td>
//            <td class="text-center">${value.unit}</td>
//            <td class="text-right doubletd paste next-row-column change-value" contenteditable="true">${unitPrice.toFixed(2)}</td>
//            <td class="text-right">${total.toFixed(2)}</td>
//           </tr>`);
        grantTotal += parseFloat(total.toFixed(2));
        grantWeightTotal += value.netWeight;
    });

    $(".doubletd").keypress(isNumberTD);
    $('.paste').on('paste', false);
    $(".next-row-column").keypress(nextRawColumn);
    $('.change-value').keyup(changeValue);

    var needWeight = grantWeightTotal;
    if (invoiceShipment.hasOwnProperty('needWeight')) {
        needWeight = parseFloat(invoiceShipment.needWeight);
    }

    var adjustment = parseFloat(needWeight.toFixed(2)) - parseFloat(grantWeightTotal.toFixed(2));
    var concat = '';
    if (adjustment > 0) {
        concat = '+';
    }

    if (needWeight === 0) {
        if ((adjustment + "").startsWith("-")) {
            adjustment = adjustment * (-1);
        }
        concat = '';
    }

    if (state) {
        $('#invoice').modal({backdrop: 'static', keyboard: false}).modal('show');
    }

    $('#need-weight-invoce-input').val(needWeight.toFixed(2));
    numberAnimation('total-net-weight-invoice', grantWeightTotal.toFixed(2));
    numberAnimation('need-weight-invoice', needWeight.toFixed(2));
    numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));
    numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
}

function resetInvoice() {
    numberAnimation('total-net-weight-invoice', '0.00');
    numberAnimation('need-weight-invoice', '0.00');
    numberAnimation('adjust-weight-invoice', '0.00');
    numberAnimation('total-amount-invoice', '0.00');
    if ($('#pdf-invoice-content').is(":visible")) {
        $("#edit-invoice-content").show('fast');
        $("#pdf-invoice-content").hide('fast');
    }
    $('#need-weight-invoce-input').val('0');
    $('#insurance-invoice').val("0");
    $('#freight-invoice').val("0");
    $('#valuePerTone').val("0.700");
//    $('#invoice-table tr').each(function (i, el) {
//        removeInvoiceTable($(el).children().eq(0));
//    });
}

function removeInvoiceTable(element) {
    $(element).closest('tr')
            .children('td')
            .animate({padding: 0})
            .wrapInner('<div />')
            .children()
            .slideUp(function () {
                $(this).closest('tr').remove();
            });
    return false;
}

function perWeight(isAvailable) {
    if (units[getKey(isAvailable.unit)].isReverse) {
        isAvailable.perWeight = isAvailable.netWeight / (isAvailable.quantity * units[getKey(isAvailable.unit)].reverse);
    } else {
        isAvailable.perWeight = isAvailable.netWeight / isAvailable.quantity;
    }
}

function unitAndQuantity(value1, isAvailable) {
    if (value1.unit === isAvailable.unit) {
        isAvailable.quantity += parseFloat(value1.quantity);
    } else if (units[getKey(isAvailable.unit)].isReverse) {
        var array = $.map(units, function (value, index) {
            return [value];
        });
        var found = array.find(element => element.hasOwnProperty('scale') && element.scale.find(elemnt1 => elemnt1.quantity == units[getKey(isAvailable.unit)].reverse) && element.unit === value1.unit);

        if (found !== undefined) {
            var valQuantity = isAvailable.quantity * units[getKey(isAvailable.unit)].reverse;

            var unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= parseFloat(found.quantity));
            isAvailable.quantity = (valQuantity + parseFloat(value1.quantity)) / unit.quantity;

            //again get unit possible merge
            unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= isAvailable.quantity);
            if (unit !== undefined) {
                isAvailable.quantity = isAvailable.quantity / unit.quantity;
                isAvailable.unit = unit.unit;
            }

        } else {
            //Something Missing
            isAvailable.quantity += parseFloat(value1.quantity);
        }
    } else {
        //Something Missing
        isAvailable.quantity += parseFloat(value1.quantity);
    }
}

function changeValue(event) {

    let datatableIndex = INVOICETABLE.rows().data().toArray().findIndex((value) => value[0] == $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(0)`).text());

    let temp = INVOICETABLE.row(datatableIndex).data();
    console.log(temp);

    var valuePertone = parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(2)`).text());
    var netWeight = parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(5)`).text());
    var quantity = parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(6)`).text());
    var unitprice = parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text());
    var total = parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(9)`).text());
    if ($(this).index() === 2) {

        temp[2] = $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(2)`).text();
//        INVOICETABLE.row(datatableIndex).invalidate().draw();

        var unit = $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(7)`).text();
        unit = units[getKey(unit)];
        if (unit.isReverse) {
            quantity *= unit.reverse;
        }


        total = netWeight * valuePertone;
        unitprice = parseFloat((total / parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(6)`).text())).toFixed(2));

        if (parseFloat(unitprice.toFixed(2)) < 0.01) {
            unitprice = 0.01;
        }

        $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text(unitprice.toFixed(2));
        $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(9)`).text(total.toFixed(2));
        temp[8] = unitprice.toFixed(2);
        temp[9] = total.toFixed(2);

    } else if ($(this).index() === 5) {
        temp[5] = $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(5)`).text();

        total = netWeight * valuePertone;
        unitprice = parseFloat((total / quantity).toFixed(2));
        if (parseFloat(unitprice.toFixed(2)) < 0.01) {
            unitprice = 0.01;
        }

        $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text(unitprice.toFixed(2));
        $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(9)`).text(total.toFixed(2));
        temp[8] = unitprice.toFixed(2);
        temp[9] = total.toFixed(2);

        var UNIT = $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(7)`).text();
        var perWeight = 0;
        if (units[getKey(UNIT)].isReverse) {
            perWeight = netWeight / (quantity * units[getKey(UNIT)].reverse);
        } else {
            perWeight = netWeight / quantity;
        }
        $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(4)`).text(perWeight.toFixed(4));
        temp[4] = perWeight.toFixed(4);
    } else if ($(this).index() === 8) {

        temp[8] = $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text();
        total = quantity * unitprice;
        valuePertone = total / netWeight;

        $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(2)`).text(valuePertone.toFixed(3));
        $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(9)`).text(total.toFixed(2));
        temp[2] = valuePertone.toFixed(3);
        temp[9] = total.toFixed(2);
    }

    var quantity = parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(6)`).text());
    var unitprice = parseFloat($('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text());

    total = quantity * unitprice;
    $('#invoice-table > tbody').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(9)`).text(total.toFixed(2));

    var grantTotal = 0;
    var grantNetWeight = 0;
    $('#invoice-table > tbody > tr').each(function (i, el) {
        grantTotal += parseFloat($(el).children().eq(9).text());
        grantNetWeight += parseFloat($(el).children().eq(5).text());
    });

    numberAnimation('total-net-weight-invoice', grantNetWeight.toFixed(2));
    var needWeight = parseFloat($('#need-weight-invoice').text());

    var adjustment = parseFloat(needWeight.toFixed(2)) - parseFloat(grantNetWeight.toFixed(2));
    var concat = '';
    if (adjustment > 0) {
        concat = '+';
    }

    if (needWeight === 0) {
        if ((adjustment + "").startsWith("-")) {
            adjustment = adjustment * (-1);
        }
        concat = '';
    }

    numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));
    numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
}

function numberAnimation(id, newnum) {
    jQuery({someValue: parseFloat($(`#${id}`).text())}).animate({someValue: parseFloat(newnum)}, {
        duration: 1000,
        easing: 'swing',
        step: function () {
            $(`#${id}`).text(Math.ceil(this.someValue).toFixed(2));
        },
        complete: function () {
            $(`#${id}`).text(newnum);
        }
    });
}