var FILE_NAME_EXCEL;
function packinglist(shipment, classname) {
    var stateSip = shipments[shipment][$(`.${classname}`).dropdown("get value")];
    var plShipment = shipments[shipment];
    var shipmentNo = plShipment.shipment;
    if (plShipment.hasOwnProperty('editShipment')) {
        shipmentNo = plShipment.editShipment;
    }
    
    $(`#excle-packingList-Table`).html('');

    var docDefinition = {
        info: {
            title: `PACKING LIST ${shipmentNo}`,
            author: 'Asian Cargo',
            subject: 'Packing List',
            keywords: 'Pupose of Shipment Packing List'
        },
        content: [
            {
                layout: layout,
                style: 'tableExample',
                color: '#000',
                table: {
                    body: [
                        [{text: 'PACKING LIST', style: 'TabelHeader', colSpan: 9, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {}, {}]
                    ]
                }
            }
        ],
        styles: styles
    };

    $(`#excle-packingList-Table`).append(`<tr><td data-b-a-s="thin" data-b-a-c="a8a5a5" colspan="9" data-f-bold="true" data-f-sz="12" data-a-h="center">PACKING LIST</td></tr>`);

    getHeader(plShipment, docDefinition);
//     var marks = "NSS & NMR /CMB";
    var marks = "ASC/CMB";
    if (plShipment.hasOwnProperty('marks')) {
        marks = plShipment.marks;
    }

    docDefinition.content[0].table.body.push([{text: `MARKS & No. ${marks}`, style: 'header', alignment: 'center'}, {text: '\nDESCRIPTION', style: 'header', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: '\nQUANTITY', style: 'header', alignment: 'center'}, {text: '\nUNIT', style: 'header', alignment: 'center'}]);
    $(`#excle-packingList-Table`).append(`<tr><td data-a-h="center" data-a-wrap="true" data-f-bold="true" data-b-a-s="thin" data-b-a-c="a8a5a5">MARKS & No. ${marks}</td><td data-a-h="center" data-f-bold="true" colspan="6" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">DESCRIPTION</td><td data-a-h="center" data-f-bold="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">QUANTITY</td><td data-a-h="center" data-f-bold="true" data-a-v="middle" data-b-a-s="thin" data-b-a-c="a8a5a5">UNIT</td></tr>`);

    var cartons = stateSip.cartons;
    var asenKeys = Object.keys(cartons).sort(numbersAlphAscending);
    for (var i = 0; i < asenKeys.length; i++) {
        let c = asenKeys[i];
        var products = cartons[c].products;
        for (var p = 0; p < products.length; p++) {
            if (p === 0) {
                let cno = cartons[c].carton;
//                let cno='NSS - '+cartons[c].carton;
//                if(cartons[c].carton.includes('A')){
//                    cno='NMR - '+cartons[c].carton.split('A')[0];
//                }
//                docDefinition.content[0].table.body.push([{text: cno, style: 'normal', alignment: 'center'}, {text: products[p].product, style: 'normal', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: products[p].product==="POLYTHENE COVER"?19.73:products[p].quantity, style: 'header', alignment: 'center'}, {text: products[p].unit, style: 'normal', alignment: 'center'}]);
                docDefinition.content[0].table.body.push([{text: cno, style: 'normal', alignment: 'center'}, {text: products[p].product, style: 'normal', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: products[p].quantity, style: 'header', alignment: 'center'}, {text: products[p].unit, style: 'normal', alignment: 'center'}]);
                $(`#excle-packingList-Table`).append(`<tr><td data-a-h="center" data-t="s" data-b-a-s="thin" data-b-a-c="a8a5a5">${cno}</td><td colspan="6" data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5">${products[p].product}</td><td data-a-h="center" data-t="s" data-b-a-s="thin" data-b-a-c="a8a5a5">${products[p].quantity}</td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5">${products[p].unit}</td></tr>`);
            } else {
//                docDefinition.content[0].table.body.push([{text: '', style: 'normal', alignment: 'center'}, {text: products[p].product, style: 'normal', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: products[p].product==="POLYTHENE COVER"?19.73:products[p].quantity, style: 'header', alignment: 'center'}, {text: products[p].unit, style: 'normal', alignment: 'center'}]);
                docDefinition.content[0].table.body.push([{text: '', style: 'normal', alignment: 'center'}, {text: products[p].product, style: 'normal', colSpan: 6, alignment: 'center'}, {}, {}, {}, {}, {}, {text: products[p].quantity, style: 'header', alignment: 'center'}, {text: products[p].unit, style: 'normal', alignment: 'center'}]);
                $(`#excle-packingList-Table`).append(`<tr><td data-a-h="center" data-t="s" data-b-a-s="thin" data-b-a-c="a8a5a5"></td><td colspan="6" data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5">${products[p].product}</td><td data-a-h="center" data-t="s" data-b-a-s="thin" data-b-a-c="a8a5a5">${products[p].quantity}</td><td data-a-h="center" data-b-a-s="thin" data-b-a-c="a8a5a5">${products[p].unit}</td></tr>`);
            }
        }
    }

    const FILE_NAME = `PACKING LIST ${shipmentNo}.pdf`;
    FILE_NAME_EXCEL = `PACKING LIST ${shipmentNo}`;
//    const file_header = ';download=filename';

    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('#cusname').addClass('d-none');
        $('.packinglist-pdf').attr('src', result);
        $('.packinglist-pdf').attr('download', FILE_NAME);
        $('#packinglist').modal('show');

    });
}

$(`#exporte-pakingList-excel`).click((e) => {
    let table = document.querySelector("#excle-packingList-Table");
    TableToExcel.convert(table, {
        name: `${FILE_NAME_EXCEL}.xlsx`,
        sheet: {
            name: FILE_NAME_EXCEL
        }
    });
});