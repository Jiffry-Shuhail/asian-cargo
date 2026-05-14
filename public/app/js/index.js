//$.getScript('/app/js/lock.js');
$.getScript('/app/js/iconchanger.js');

$(function () {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            user.getIdToken(/*true*/).then(function (idToken) {
                // Send token to your backend via HTTPS
                $.ajax({
                    url: "/sessionLogin",
                    type: "POST",
                    dataType: 'json',
                    data: JSON.stringify({idToken}),
                    headers: {
                        Accept: "application/json",
                        'Content-Type': 'application/json',
                        'CSRF-Token': Cookies.get('XSRF-TOKEN')
                    },
                    cache: false,
                    success: function (data) {
                        if (data.status === "success") {
                            window.location.assign("/home");
//                            if (data.result.status) {
//                                if (data.result.isActive) {
//                                    window.location.assign("/home");
//                                } else {
//                                    Lobibox.notify('warning', {position: 'top right', msg: 'Please pay your Due'});
//                                    firebase.auth().signOut();
//                                }
//                            } else {
//                                Lobibox.notify('warning', {position: 'top right', msg: data.result.msg});
//                                firebase.auth().signOut();
//                            }
                        }
                    },
                    error: function (xhr, status, error) {
                        Lobibox.notify('warning', {position: 'top right', msg: error});
                        firebase.auth().signOut();
                    }
                });

            }).catch(function (error) {
                // Handle error
                Lobibox.notify('warning', {position: 'top right', msg: error.message});
            });
        } else {
            $('.loading').removeClass("d-flex");
            $('.loading').addClass("d-none");
            $('.sign-in').removeClass("d-none");
        }

    });

});

$('.sign-in').click(function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().languageCode = 'en';
    firebase.auth().signInWithRedirect(provider);
});


const createInvoice=(data)=>{
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

    var marks = "ASC/CMB";
    if (FULL_PARENT.hasOwnProperty('marks')) {
        marks = FULL_PARENT.marks;
    }

    docDefinition.content[0].table.body.push([{text: `MARKS & No. ${marks}`, style: 'header', alignment: 'center'}, {text: `CUSTOMER`, style: 'header', alignment: 'center'}, {text: '\nDESCRIPTION', style: 'header', colSpan: 4, alignment: 'center'}, {}, {}, {}, {text: '\nQUANTITY', style: 'header', alignment: 'center'}, {text: '\nUNIT', style: 'header', alignment: 'center'}, {text: 'WEIGHT', style: 'header', alignment: 'center'}]);

    var cartons = FULL_SHIPMENT.cartons;

    var asenKeys = Object.keys(cartons).sort(numbersAlphAscending);

    if ($('#cusnameSelect').dropdown('get value') !== 'all') {
        asenKeys = $.map(FULL_SHIPMENT.cartons, (i, v) => {
            if ($('#cusnameSelect').dropdown('get value') === i.customer) {
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
            } else {
                docDefinition.content[0].table.body.push([{text: '', style: 'normal', alignment: 'center'}, {text: "  "}, {text: p.product, style: 'normal', colSpan: 4, alignment: 'center'}, {}, {}, {}, {text: p.quantity, style: 'header', alignment: 'center'}, {text: p.unit, style: 'normal', alignment: 'center'}, {text: "  "}]);
            }
        });
    });

    docDefinition.content[0].table.body.push([{text: asenKeys.length, style: 'normal', alignment: 'center'},{text: 'WEIGHT', alignment: 'right', colSpan: 7}, {}, {}, {}, {}, {}, {}, {text: totWeight.toFixed(2)}]);

    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('#cusname').removeClass('d-none');
        $('.packinglist-pdf').attr('src', result);
        $('#packinglist').modal('show');
    });
};