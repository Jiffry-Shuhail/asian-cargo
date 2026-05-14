var FULL_SHIPMENT = null;
var FULL_PARENT = null;

function deliveryReport(shipment, classname) {

    FULL_SHIPMENT = shipments[shipment][$(`.${classname}`).dropdown("get value")];
    FULL_PARENT = shipments[shipment];

    let cusList = [...new Set($.map(FULL_SHIPMENT.cartons, (i, v) => i.customer))];
    let options = `<option value='all'>All</option>`;
    $.each(cusList, (i, v) => {
        options += `<option value='${v}'>${v}</option>`;
    });
    $('#deliverSlip-cusname').html(`<select class="ui search dropdown dark d-none" id="deliverSlip-cusnameSelect">${options}</select>`);
    $('#deliverSlip-cusname').append(`<select class="ui search dropdown dark" id="deliverSlip-format">
        <option value='Default'>Default</option>
        <option value='SplipType'>Slip Type</option>
    </select>`);
    $('#deliverSlip-cusnameSelect').dropdown({selectOnKeydown: false, onChange: (value, text, $selectedItem) => {
            createFulldeliveryReport();
        }});

    $('#deliverSlip-format').dropdown({selectOnKeydown: false, onChange: (value, text, $selectedItem) => {
            if (value === 'SplipType') {
                $('#deliverSlip-cusnameSelect').parent().removeClass('d-none');
                createFulldeliveryReport();
            } else {
                $('#deliverSlip-cusnameSelect').parent().addClass('d-none');
                createFulldeliveryReportDefaultFormate();
            }

        }});

    createFulldeliveryReportDefaultFormate();
}

$('#deliverSlip-Contact-display').change(() => {
    if ($('#deliverSlip-format').dropdown('get value') === 'SplipType') {
        $('#deliverSlip-cusnameSelect').parent().removeClass('d-none');
        createFulldeliveryReport();
    } else {
        $('#deliverSlip-cusnameSelect').parent().addClass('d-none');
        createFulldeliveryReportDefaultFormate();
    }
});


function createFulldeliveryReportDefaultFormate() {

    var shipmentNo = FULL_PARENT.shipment;
    if (FULL_PARENT.hasOwnProperty('editShipment')) {
        shipmentNo = FULL_PARENT.editShipment;
    }

    var cartons = FULL_SHIPMENT.cartons;
    var deliveryReport = {};

    for (var c in cartons) {
        let carton = {carton: cartons[c].carton, weight: cartons[c].weight};
        if (!deliveryReport.hasOwnProperty(cartons[c].customer)) {
            deliveryReport[cartons[c].customer] = {
                cartons: [carton],
                contact: customers[getKey(cartons[c].customer)].contact
            };
        } else {
            deliveryReport[cartons[c].customer].cartons.push(carton);
        }
    }

    let TCW = 30;
    var docDefinition = {
        info: {
            title: `DELIVERY SLIP ${shipmentNo}`,
            author: 'Asian Cargo',
            subject: 'Delivery Slip',
            keywords: 'Pupose of Shipment Delivery Slip'
        },
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [20, 20, 20, 20],
        content: [{
                layout: layout,
                table: {
                    widths: ['*', '*', TCW, TCW, '*', TCW, TCW, TCW, TCW, TCW, TCW, TCW, TCW, TCW, TCW, TCW, TCW],
                    body: [
                        [{text: `GOODS DELIVERY ORDER \n\nSHIPMENT NO.${shipmentNo}`, fontSize: 12, bold: true, alignment: 'center', colSpan: 17}, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                        [{text: `CUSTOMER`, fontSize: 11, bold: true, alignment: 'center', rowSpan: 2},
                            {text: `TELE  NO`, fontSize: 11, bold: true, alignment: 'center', rowSpan: 2},
                            {text: `DELIVERY METHOD`, fontSize: 11, bold: true, alignment: 'center', colSpan: 3}, '', '',
                            {text: `PAYMENT TYPE`, fontSize: 11, bold: true, alignment: 'center', colSpan: 3}, '', '',
                            {text: `CART.`, fontSize: 11, bold: true, alignment: 'center', fillColor: '#fce088'},
                            {text: `B/W`, fontSize: 11, bold: true, alignment: 'center', fillColor: '#c1ff7a'},
                            {text: `A/W`, fontSize: 11, bold: true, alignment: 'center'},
                            {text: `CART.`, fontSize: 11, bold: true, alignment: 'center', fillColor: '#fce088'},
                            {text: `B/W`, fontSize: 11, bold: true, alignment: 'center', fillColor: '#c1ff7a'},
                            {text: `A/W`, fontSize: 11, bold: true, alignment: 'center'},
                            {text: `CART.`, fontSize: 11, bold: true, alignment: 'center', fillColor: '#fce088'},
                            {text: `B/W`, fontSize: 11, bold: true, alignment: 'center', fillColor: '#c1ff7a'},
                            {text: `A/W`, fontSize: 11, bold: true, alignment: 'center'}
                        ],
                        ['', '', {text: `PICK`, fontSize: 9, bold: true, alignment: 'center'},
                            {text: `TR`, fontSize: 9, bold: true, alignment: 'center'},
                            {text: `TRANS PLACE`, fontSize: 10, bold: true, alignment: 'center'},
                            {text: `CASH`, fontSize: 8, bold: true, alignment: 'center'},
                            {text: `CHQ`, fontSize: 9, bold: true, alignment: 'center'},
                            {text: `B/TRF`, fontSize: 8, bold: true, alignment: 'center'},
                            {text: `NOS.`, fontSize: 9, bold: true, alignment: 'center', fillColor: '#fce088'},
                            {text: `KG`, fontSize: 9, bold: true, alignment: 'center', fillColor: '#c1ff7a'},
                            {text: `KG`, fontSize: 9, bold: true, alignment: 'center'},
                            {text: `NOS.`, fontSize: 9, bold: true, alignment: 'center', fillColor: '#fce088'},
                            {text: `KG`, fontSize: 9, bold: true, alignment: 'center', fillColor: '#c1ff7a'},
                            {text: `KG`, fontSize: 9, bold: true, alignment: 'center'},
                            {text: `NOS.`, fontSize: 9, bold: true, alignment: 'center', fillColor: '#fce088'},
                            {text: `KG`, fontSize: 9, bold: true, alignment: 'center', fillColor: '#c1ff7a'},
                            {text: `KG`, fontSize: 9, bold: true, alignment: 'center'}
                        ]
                    ]
                }
            }],
        styles: styles
    };

    var index = 0;
    for (var u in deliveryReport) {
        if (index !== 0) {
            docDefinition.content[0].table.body.push([{text: ``, colSpan: 17, fillColor: '#ffffff'}, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
        }
        var cartDetails = deliveryReport[u].cartons;
        var cartDetailsSize = cartDetails.length;
        for (var cn = 0; cn < cartDetailsSize; cn++) {
            var data;
            if (cn === 0) {
                data = [
                    {text: u, fontSize: 9, bold: true}, {text: $('#deliverSlip-Contact-display').is(":checked") ? deliveryReport[u].contact : '', fontSize: 9},
                    '', '', '', '', '', '',
                    {text: cartDetails[cn].carton, alignment: 'center', fillColor: '#fce088', fontSize: 9},
                    {text: cartDetails[cn].weight, alignment: 'right', fillColor: '#c1ff7a', fontSize: 9},
                    ''
                ];
                if (getCartonDetailForDeliveryReport(cartDetails, cartDetailsSize, cn, data)) {
                    cn++;
                }
                if (getCartonDetailForDeliveryReport(cartDetails, cartDetailsSize, cn, data)) {
                    cn++;
                }
            } else {
                data = ['', '', '', '', '', '', '', '',
                    {text: cartDetails[cn].carton, alignment: 'center', fillColor: '#fce088', fontSize: 9},
                    {text: cartDetails[cn].weight, alignment: 'right', fillColor: '#c1ff7a', fontSize: 9},
                    ''];
                if (getCartonDetailForDeliveryReport(cartDetails, cartDetailsSize, cn, data)) {
                    cn++;
                }
                if (getCartonDetailForDeliveryReport(cartDetails, cartDetailsSize, cn, data)) {
                    cn++;
                }
            }
            if (data !== '') {
                docDefinition.content[0].table.body.push(data);
            }
            data = '';
        }
        index++;
        docDefinition.content[0].table.body.push([{text: `DELIVERY DETAILS`, colSpan: 17, fillColor: '#d4d4d4', fontSize: 9, alignment: 'center'}, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
        docDefinition.content[0].table.body.push([{text: `RECEIVER NAME/SIGNATURE`, colSpan: 2, fontSize: 9, fillColor: '#d4d4d4'}, '', {text: ``, colSpan: 6, fontSize: 9, fillColor: '#edebeb'}, '', '', '', '', '', {text: `HAND OVER BY`, colSpan: 3, fillColor: '#d4d4d4', fontSize: 9}, '', '', {text: ``, colSpan: 6, fillColor: '#edebeb'}, '', '', '', '', '']);
        docDefinition.content[0].table.body.push([{text: `REMARKS\n\n`, colSpan: 17, fontSize: 9, fillColor: '#edebeb'}, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    }

    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
//        $('#deliverSlip-cusname').removeClass('d-none');
        $('.deliverSlip-pdf').attr('src', result);
        $('#deliverSlipModal').modal('show');
    },{});
}

function getCartonDetailForDeliveryReport(cartDetails, cartDetailsSize, cn, data) {
    let cartNo = '';
    let cartWeight = '';
    let result = false;
    let val = cn + 1;
    if (val < cartDetailsSize) {
        cartNo = cartDetails[val].carton;
        cartWeight = cartDetails[val].weight;
        result = true;
    }
    data.push({text: cartNo, alignment: 'center', fillColor: '#fce088', fontSize: 9});
    data.push({text: cartWeight, alignment: 'right', fillColor: '#c1ff7a', fontSize: 9});
    data.push('');
    return result;
}

function createFulldeliveryReport() {

    var shipmentNo = FULL_PARENT.shipment;
    if (FULL_PARENT.hasOwnProperty('editShipment')) {
        shipmentNo = FULL_PARENT.editShipment;
    }

    var cartons = FULL_SHIPMENT.cartons;
    var deliveryReport = {};

    for (var c in cartons) {
        let cno = cartons[c].carton;
        if (!deliveryReport.hasOwnProperty(cartons[c].customer)) {
            console.log(cartons[c].customer);
            deliveryReport[cartons[c].customer] = {
                cartons: cno,
                contact: customers[getKey(cartons[c].customer)].contact
            };
        } else {
            deliveryReport[cartons[c].customer].cartons += " - " + cno;
        }
    }


    var docDefinition = {
        info: {
            title: `DELIVERY SLIP ${shipmentNo}`,
            author: 'Asian Cargo',
            subject: 'Delivery Slip',
            keywords: 'Pupose of Shipment Delivery Slip'
        },
        pageSize: 'A5',
        pageOrientation: 'landscape',
        footer: {image: 'footer', width: 600},
        header: {image: 'header', width: 600},
        pageMargins: [20, 90, 20, 40],
        content: [],
        styles: styles,
        images: PDF_IMAGES
    };

    var index = 1;
    for (var u in deliveryReport) {
        var isValid = $('#deliverSlip-cusnameSelect').dropdown('get value') !== 'all' ?
                $('#deliverSlip-cusnameSelect').dropdown('get value') === u : true;

        if (isValid) {
            if (index !== 1) {
                docDefinition.content.push({text: "", pageBreak: "after"});
            }
            let data = {
                layout: layout,
                table: {
                    widths: ['*', '*', '*', '*'],
                    body: [
                        [{text: `DELIVERY SLIP`, fontSize: 12, bold: true, alignment: 'center', colSpan: 2, fillColor: '#d1d1d1'}, {}, {text: `SHIPMENT ${shipmentNo}`, fontSize: 12, bold: true, alignment: 'center', colSpan: 2, fillColor: '#d1d1d1'}, {}],
                        [{text: 'DATE', bold: true}, {}, {text: 'CUSTOMER', bold: true}, {text: `${u} ${$('#deliverSlip-Contact-display').is(":checked") ? ('\n' + deliveryReport[u].contact) : ''}`}],
                        [{text: 'CARTOON`S DETAILS', fontSize: 8, bold: true, alignment: 'center', colSpan: 4, fillColor: '#d1d1d1'}, {}, {}, {}],
                        [{fontSize: 9, colSpan: 4, text: deliveryReport[u].cartons}, {}, {}, {}],
                        [{text: 'PAYMENT DETAILS', fontSize: 8, bold: true, alignment: 'center', colSpan: 4, fillColor: '#d1d1d1'}, {}, {}, {}],
                        [{text: 'CASH', bold: true, fontSize: 10}, {text: 'BANK TRANSFER', bold: true, fontSize: 10}, {text: 'CHEQUE', bold: true, fontSize: 10}, {text: 'OFFICE', bold: true, fontSize: 10}],
                        [{text: 'REMARKS', bold: true, lineHeight: 2}, {text: 'STORTAGE / DAMAGES / MISSING CARTOON`S', color: '#b8b8b8', colSpan: 3, alignment: 'center', lineHeight: 2, fontSize: 10}, {}, {}],
                        [{text: 'RELEASED', bold: true}, {text: 'STAFF NAME AND SIGNATURE', color: '#b8b8b8', colSpan: 3, alignment: 'center', fontSize: 10}, {}, {}],
                        [{text: 'RECEIVED DETAILS', fontSize: 8, bold: true, alignment: 'center', colSpan: 4, fillColor: '#d1d1d1'}, {}, {}, {}],
                        [{text: 'NAME', bold: true, fontSize: 10, alignment: 'center'}, {text: 'ID NO', bold: true, fontSize: 10, alignment: 'center'}, {text: 'VEHICLE', bold: true, fontSize: 10, alignment: 'center'}, {text: 'SIGNATURE', bold: true, fontSize: 10, alignment: 'center'}],
                        [{text: ''}, {text: ''}, {text: 'OWN / RENT', fontSize: 10, alignment: 'center', color: '#b8b8b8'}, {}],
                        [{text: 'REMARKS', bold: true, lineHeight: 2}, {text: 'RECEIVER REMARKS....', color: '#b8b8b8', colSpan: 3, alignment: 'center', lineHeight: 2, fontSize: 10}, {}, {}]
                    ]
                }
            }
            docDefinition.content.push(data);
            index++;
        }
    }

    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('#deliverSlip-cusname').removeClass('d-none');
        $('.deliverSlip-pdf').attr('src', result);
        $('#deliverSlipModal').modal('show');
    });

}