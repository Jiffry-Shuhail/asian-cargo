var FULL_SHIPMENT = null;
var FULL_PARENT = null;
var FILE_FULLCRITERIA_NAME_EXCEL;

function fullCriteria(shipment, classname) {
    
    

    FULL_SHIPMENT = shipments[shipment][$(`.${classname}`).dropdown("get value")];
    FULL_PARENT = shipments[shipment];

    let cusList = [...new Set($.map(FULL_SHIPMENT.cartons, (i, v) => i.customer))];
    let options = `<option value='all'>All</option>`;
    $.each(cusList, (i, v) => {
        options += `<option value='${v}'>${v}</option>`;
    });
    $('#fullcriteria-cusname').html(`<select class="ui search dropdown dark" id="fullcriteria-cusnameSelect">${options}</select>`);
    $('#fullcriteria-cusnameSelect').dropdown({selectOnKeydown: false, onChange: (value, text, $selectedItem) => {
            createFullRepostr();
        }});

    createFullRepostr();
}

function createFullRepostr() {
    
    
    $(`#excle-fullcriteria-Table`).html('');

    var shipmentNo = FULL_PARENT.shipment;
    if (FULL_PARENT.hasOwnProperty('editShipment')) {
        shipmentNo = FULL_PARENT.editShipment;
    }

    var docDefinition = {
        info: {
            title: `FULL CRITERIA ${shipmentNo}`,
            author: 'Asian Cargo',
            subject: 'Full Criteria',
            keywords: 'Pupose of Shipment FULL CRITERIA'
        },
        content: [
            {
                layout: layout,
                style: 'tableExample',
                color: '#000',
                table: {
                    body: [
                        [{text: `FULL CRITERIA ${shipmentNo}`, style: 'TabelHeader', colSpan: 9, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}]
                    ]
                }
            }
        ],
        styles: styles
    };

    $(`#excle-fullcriteria-Table`).append(`<tr><td data-b-a-s="thin" data-b-a-c="a8a5a5" colspan="9" data-f-bold="true" data-f-sz="12" data-a-h="center">FULL CRITERIA ${shipmentNo}</td></tr>`);

    var marks = "ASC/CMB";
    if (FULL_PARENT.hasOwnProperty('marks')) {
        marks = FULL_PARENT.marks;
    }

    docDefinition.content[0].table.body.push([{text: `MARKS & No. ${marks}`, style: 'header', alignment: 'center'}, {text: `CUSTOMER`, style: 'header', alignment: 'center'}, {text: '\nDESCRIPTION', style: 'header', colSpan: 4, alignment: 'center'}, {}, {}, {}, {text: '\nQUANTITY', style: 'header', alignment: 'center'}, {text: '\nUNIT', style: 'header', alignment: 'center'}, {text: 'WEIGHT', style: 'header', alignment: 'center'}]);
    $(`#excle-fullcriteria-Table`).append(`<tr><td data-a-h="center" data-a-wrap="true" data-f-bold="true" data-b-a-s="thin" data-b-a-c="a8a5a5">MARKS & No. ${marks}</td><td data-a-h="center" data-a-wrap="true" data-f-bold="true" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-v="middle">CUSTOMER</td><td data-a-h="center" data-f-bold="true" colspan="4" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">DESCRIPTION</td><td data-a-h="center" data-f-bold="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">QUANTITY</td><td data-a-h="center" data-f-bold="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">UNIT</td><td data-a-h="center" data-a-v="middle" data-a-wrap="true" data-f-bold="true" data-b-a-s="thin" data-b-a-c="a8a5a5">WEIGHT</td></tr>`);

    var cartons = FULL_SHIPMENT.cartons;

    var asenKeys = Object.keys(cartons).sort(numbersAlphAscending);

    if ($('#fullcriteria-cusnameSelect').dropdown('get value') !== 'all') {
        asenKeys = $.map(FULL_SHIPMENT.cartons, (i, v) => {
            if ($('#fullcriteria-cusnameSelect').dropdown('get value') === i.customer) {
                return v;
            }
        }).sort(numbersAlphAscending);
    }

    let totWeight = 0;

    $.each(asenKeys, (i, c) => {
        $.each(cartons[c].products, (n, p) => {
            if (n === 0) {
                totWeight += parseFloat(cartons[c].weight);
                docDefinition.content[0].table.body.push([{text: cartons[c].carton, style: 'normal', alignment: 'center'}, {text: cartons[c].customer, style: 'normal', alignment: 'center'}, {text: p.product, style: 'normal', colSpan: 4, alignment: 'center'}, {}, {}, {}, {text: p.quantity, style: 'header', alignment: 'center'}, {text: p.unit, style: 'normal', alignment: 'center'}, {text: cartons[c].weight, style: 'normal', alignment: 'center'}]);
                $(`#excle-fullcriteria-Table`).append(`<tr><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${cartons[c].carton}</td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${cartons[c].customer}</td><td data-a-h="center" colspan="4" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${p.product}</td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${p.quantity}</td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${p.unit}</td><td data-a-h="right" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="n" data-a-wrap="true" data-a-v="middle">${cartons[c].weight}</td></tr>`);
            } else {
                docDefinition.content[0].table.body.push([{text: '', style: 'normal', alignment: 'center'}, {text: "  "}, {text: p.product, style: 'normal', colSpan: 4, alignment: 'center'}, {}, {}, {}, {text: p.quantity, style: 'header', alignment: 'center'}, {text: p.unit, style: 'normal', alignment: 'center'}, {text: "  "}]);
                $(`#excle-fullcriteria-Table`).append(`<tr><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle"></td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${cartons[c].customer}</td><td data-a-h="center" colspan="4" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${p.product}</td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${p.quantity}</td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle">${p.unit}</td><td data-a-h="right" data-b-a-s="thin" data-b-a-c="a8a5a5" data-a-wrap="true" data-a-v="middle"></td></tr>`);
            }
        });
    });

    docDefinition.content[0].table.body.push([{text: asenKeys.length, style: 'normal', alignment: 'center'},{text: 'WEIGHT', alignment: 'right', colSpan: 7}, {}, {}, {}, {}, {}, {}, {text: totWeight.toFixed(2)}]);
    $(`#excle-fullcriteria-Table`).append(`<tr><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5" data-f-bold="true" data-f-sz="12">${asenKeys.length}</td><td data-a-h="center" colspan="7" data-b-a-s="thin" data-b-a-c="a8a5a5" data-f-bold="true" data-f-sz="12">WEIGHT</td><td data-a-h="right" data-b-a-s="thin" data-b-a-c="a8a5a5" data-t="n" data-f-bold="true" data-f-sz="12">${totWeight.toFixed(2)}</td></tr>`);

    FILE_FULLCRITERIA_NAME_EXCEL=`FULL CRITERIA ${shipmentNo}`;
    
    
    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('#fullcriteria-cusname').removeClass('d-none');
        $('.fullcriteria-pdf').attr('src', result);
        $('#fullcriteriaModal234').modal('show');
    });

}

$(`#exporte-fullcriteria-excel`).click((e) => {
    let table = document.querySelector("#excle-fullcriteria-Table");
    TableToExcel.convert(table, {
        name: `${FILE_FULLCRITERIA_NAME_EXCEL}.xlsx`,
        sheet: {
            name: FILE_FULLCRITERIA_NAME_EXCEL
        }
    });
});