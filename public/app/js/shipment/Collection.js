var COLLECTION_SHIPMENT = null;
var COLLECTION_STATE = null;
var COLLECTION_C_SHIPMENT = null;
function collection(shipment, classname) {
    COLLECTION_SHIPMENT = shipment;
    COLLECTION_STATE = $(`.${classname}`).dropdown("get value");
    COLLECTION_C_SHIPMENT = shipments[COLLECTION_SHIPMENT][COLLECTION_STATE];

    var parentShipment = shipments[COLLECTION_SHIPMENT];
    var CUSTOMER_IN_SHIPMNET_NO = parentShipment.shipment;
    if (parentShipment.hasOwnProperty('editShipment')) {
        CUSTOMER_IN_SHIPMNET_NO = parentShipment.editShipment;
    }
    $('.customer-collection-shipment').text(`SHIPMENT ${CUSTOMER_IN_SHIPMNET_NO}`);

    var docDefinition = {
        info: {
            title: `COLLECTION REPORT ${CUSTOMER_IN_SHIPMNET_NO}`,
            author: 'Asian Cargo',
            subject: 'Collection report',
            keywords: 'Pupose of Shipment Collection report'
        },
        pageSize: 'A4',
        content: [{
                layout: layout,
                style: 'tableExample',
                color: '#000',
                table: {
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [{text: `COLLECTION REPORT ${CUSTOMER_IN_SHIPMNET_NO}`, style: 'TabelHeader', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}],
                        [{text: `CUSTOMER`, style: 'TabelHeader', alignment: 'center'}, {text: `CONTACT`, style: 'TabelHeader', alignment: 'center'}, {text: `CARTOONS`, style: 'TabelHeader', alignment: 'center'}, {text: `TOTAL`, style: 'TabelHeader', alignment: 'center'}, {text: `PAYMENT`, style: 'TabelHeader', alignment: 'center'}, {text: `SIGNATURE`, style: 'TabelHeader', alignment: 'center'}],
                    ]
                }
            }],
        styles: styles
    };

    if (COLLECTION_C_SHIPMENT.hasOwnProperty('customerInvoice')) {
        $.each(COLLECTION_C_SHIPMENT.customerInvoice, function (index, value) {
            docDefinition.content[0].table.body.push([{text: value.name}, {text: customers[getKey(value.name)].contact}, {text: value.cartons.split('-').length, alignment: 'center'}, {text: value.total.toFixed(2), alignment: 'right'}, {}, {}]);
        });
        pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
            $('#cutomer-collection-pdf').attr('src', result);
            $('#cutomer-collection-pdf').show();
            $('#collectionReport-label').hide();
            $('#collectionReport').modal('show');
        });
    } else {
        $('#cutomer-collection-pdf').hide();
        $('#collectionReport-label').show();
        $('#collectionReport').modal('show');
    }


}