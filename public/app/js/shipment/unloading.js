function unloading(shipment, classname) {
    var stateSip = shipments[shipment][$(`.${classname}`).dropdown("get value")];
    var unloadingReport = {};
    var cartons = stateSip.cartons;
//    let ctns = ["268", "269", "270", "271", "272", "273", "275", "276", "277", "278", "279", "280", "285", "286", "287", "288", "289"];
    for (var c in cartons) {
//        if (ctns.find(e => e === cartons[c].carton) === undefined) {
            let cno=cartons[c].carton;
//            let cno=`NSS(${cartons[c].carton})`;
//                if(cartons[c].carton.includes('A')){
//                    cno=`NMR(${cartons[c].carton.split('A')[0]})`;
//                }
            if (!unloadingReport.hasOwnProperty(cartons[c].customer)) {
                    console.log(cartons[c].customer);
                unloadingReport[cartons[c].customer] = {
                    cartons: cno,
//                    cartons: cartons[c].carton,
                    contact: customers[getKey(cartons[c].customer)].contact
                };
            } else {
//                unloadingReport[cartons[c].customer].cartons += " - " + cartons[c].carton;
                unloadingReport[cartons[c].customer].cartons += " - " + cno;
            }
//        }
    }

    var shipNo = shipments[shipment].shipment;
    if (shipments[shipment].hasOwnProperty('editShipment')) {
        shipNo = shipments[shipment].editShipment;
    }

    var docDefinition = {
        info: {
            title: `UNLOADING REPORT ${shipNo}`,
            author: 'Asian Cargo',
            subject: 'Unloading Report',
            keywords: 'Pupose of Shipment unloading goods report'
        },
        content: [
            {
                layout: layout,
                style: 'tableExample',
                color: '#000',
                table: {
                    body: [
                        [{text: `SHIPMENT NO ${shipNo}`, style: 'TabelHeader', alignment: 'center', colSpan: "5"}, {}, {}, {}, {}],
                        [{text: 'NO', style: 'TabelHeader', alignment: 'center'}, {text: 'CUSTOMER', style: 'TabelHeader', alignment: 'center'},
                            {text: 'CONTACT', style: 'TabelHeader', alignment: 'center'}, {text: 'CARTONS', style: 'TabelHeader', alignment: 'center'},
                            {text: 'T.Cs', style: 'TabelHeader', alignment: 'center'}]
                    ]
                }
            }
        ],
        styles: styles
    };
    var index = 1;
    for (var u in unloadingReport) {
        docDefinition.content[0].table.body.push([{text: index, style: 'normal', alignment: 'center'}, {text: u, style: 'normal'}, {text: unloadingReport[u].contact, style: 'normal'},
            {text: unloadingReport[u].cartons, style: 'normal'}, {text: unloadingReport[u].cartons.split("-").length, style: 'normal', alignment: 'center'}]);
        index++;
    }
    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('.unloading-pdf').attr('src', result);
        $('#unloading').modal('show');
    });
}