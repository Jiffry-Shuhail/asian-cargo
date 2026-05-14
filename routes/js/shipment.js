var admin = require("firebase-admin");

var VMONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getShipmentCount(req, res) {
    var db = admin.firestore();
    var docRef = db.collection("Exporter").doc(req.query.refNo);

    docRef.get().then(function (doc) {
        if (doc.exists) {
            res.send(JSON.stringify({status: "success", data: doc.data().shipment}));
        } else {
            res.send(JSON.stringify({status: "No Data"}));
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
}

async function getAllShipment(req, res) {

    const {start, length, search, order} = req.body;

    let exporter = 'ABEPE2529H';
    let shipment;
    if (search && search.value) {
        let values = JSON.parse(search.value);
        exporter = values.exporter ? values.exporter.toUpperCase() : exporter;
        shipment = values.shipment ? values.shipment.toUpperCase() : undefined;
    }

    var exporters = {};

    await admin.firestore().collection('Exporter').doc(exporter).get().then((doc) => {
        exporters = doc.data();
    }).catch((err) => {
    });

    var query = admin.firestore().collection('Shipment');

    if (exporter) {
        query = query.where('exporter', '==', exporter);
    }

    if (shipment && !isNaN(shipment)) {
        query = query.where('shipment', '==', parseInt(shipment));
    }

    query = query.orderBy("shipment", 'desc');

    // Count total documents
    const snapshotCount = await query.count().get();
    const totalRecords = snapshotCount.data().count;

    // Apply pagination
    if (start) {
        console.log(start);
        query = query.offset(parseInt(start));
    }
    if (length) {
        query = query.limit(parseInt(length, 10));
    }

    // Retrieve data
    query.get()
            .then((querySnapshot) => {
                var data = [];
                var index = 0;
                querySnapshot.forEach((doc) => {
                    var ship = doc.data();
                    if (ship.isActive) {
                        ship.editShipmentNumber = ship.hasOwnProperty('editShipment')? `${ship.shipment} &rarr; ${ship.editShipment}`:ship.shipment;
                        ship.id = doc.id;

                        let currentCartoons = ship[ship.activeStatus].cartons;

                        let products = Object.keys(currentCartoons).flatMap(key => currentCartoons[key].products);
                        let productsUnique = [...new Set(products.map(item => item.product))];

                        let customers = Object.keys(currentCartoons).flatMap(key => currentCartoons[key].customer);
                        let customersUnique = [...new Set(customers)];

                        let statusDropdown = `<select class='ui fluid dropdown dropdown-center table-transparent STATUS-${index}' id='STATUS-${index}'>`;

                        ship.status.forEach(status => {
                            statusDropdown += (ship.activeStatus === status) ? `<option value='${status}' selected>${status}</option>` : `<option value='${status}'>${status}</option>`;
                        });
                        statusDropdown += `</select>`;

                        let actionDropdown = `<select class='ui fluid dropdown dropdown-center table-transparent ACTIONS-${index}'>
                                <option value=''>SELECT ACTION</option>
                                <option value='FULL CRITERIA'>FULL CRITERIA</option>
                                <option value='PACKING LIST'>PACKING LIST</option>
                                <option value='INVOICE'>INVOICE</option>
                                <option value='UNLOADING'>UNLOADING</option>
                                <option value='DELIVERY_SLIP'>DELIVERY SLIP</option>
                                <option value='CUSTOMER INVOICE'>CUSTOMER INVOICE</option>
                                <option value='COLLECTION'>COLLECTION</option>
                                <option value='WEIGHT'>WEIGHT</option>
                                <option value='SETTING'>SETTING</option>
                                <option value='HEADER SETTING'>HEADER SETTING</option>
                            </select>`;

                        let editButton = `<button class="btn btn-inverse-danger edit-shipment" style="width:100%; height:55px; border-radius:0"><i class="fa fa-pencil"></i></button>`;

                        ship.viewDate = dateFormatForTimeStamp(ship.date);
                        ship.viewExporter = exporters.exName;
                        ship.viewCount = Object.keys(ship[ship.activeStatus].cartons).length;
                        ship.tableDate = new Date(ship.date._seconds * 1000);
                        ship.productsCount = productsUnique.length;
                        ship.customersCount = customersUnique.length;
                        ship.statusDropdown = statusDropdown;
                        ship.actionDropdown = actionDropdown;
                        ship.editButton = editButton;
                        data.push(ship);
                        index++;
                    }
                });
                res.json({
                    draw: req.body.draw,
                    recordsTotal: totalRecords, // total number of records in the collection
                    recordsFiltered: totalRecords, // total number of records after filtering
                    data: data
                });
            });
}

function createInvoice(req, res) {
    admin.firestore().collection('Shipment').doc(req.body.key).set(req.body.data, {merge: true}).then(function () {
        admin.firestore().collection('Shipment').doc(req.body.key).get().then((snapshot) => {
            res.end(JSON.stringify({status: "success", isUpdate: true, data: snapshot.data()}));
        }).catch((err) => {
            console.log("Erro : " + err);
            res.end(JSON.stringify({status: "error", error: err}));
        });
    }).catch(function (error) {
        console.log(error);
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

function createCustomerInvoice(req, res) {
    admin.firestore().collection('Shipment').doc(req.body.key).set(req.body.data, {merge: true}).then(function () {
        admin.firestore().collection('Shipment').doc(req.body.key).get().then((snapshot) => {
            res.end(JSON.stringify({status: "success", isUpdate: true, data: snapshot.data()}));
        }).catch((err) => {
            console.log("Erro : " + err);
            res.end(JSON.stringify({status: "error", error: err}));
        });
    }).catch(function (error) {
        console.log(error);
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

async function searchShipments(req, res) {
    var db = admin.firestore();
    var data = {success: true, results: []};
    var exporters = await db.collection('Exporter').orderBy("exName").where("exName", ">=", req.query.search).where("exName", "<=", req.query.search + '\uf8ff').limit(10).get();
    data.results.push({name: "", value: "", text: ""});
    exporters.forEach(doc => {
        data.results.push({name: doc.data().exName, value: doc.data().exRef, text: doc.data().exName});
    });
    res.send(JSON.stringify(data));
}

async function getShipments(req, res) {

    var db = admin.firestore();

    var first = admin.firestore().collection('Shipment').orderBy('date', 'desc')
            .limit(6);

    first.get().then((documentSnapshots) => {
        // Get the last visible document
        var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        console.log("last", lastVisible);

        // Construct a new query starting at this document,
        // get the next 25 cities.
//        var next = db.collection("cities")
//                .orderBy("population")
//                .startAfter(lastVisible)
//                .limit(25);
    });

    var db = admin.firestore();
    var query = db.collection("Shipment").orderBy("date", 'desc');

    var count = 0;

    if (req.query.hasOwnProperty('key')) {
        query = db.collection("Shipment").where('exporter', "==", req.query.key);
        if (req.query.hasOwnProperty('next')) {
            var getCount = await query.get();
            count = getCount.size;
            query = db.collection("Shipment").where('exporter', "==", req.query.key).startAfter(new Date(req.query.next));
        } else if (req.query.hasOwnProperty('previous')) {
            var getCount = await query.get();
            count = getCount.size;
            query = db.collection("Shipment").where('exporter', "==", req.query.key).endBefore(new Date(req.query.previous));
        } else {
            var getCount = await query.get();
            count = getCount.size;
        }
    } else {
        var getCount = await query.get();
        count = getCount.size;
        if (req.query.hasOwnProperty('next')) {
            query = db.collection("Shipment").orderBy("date", 'desc').startAfter(new Date(req.query.next));
        } else if (req.query.hasOwnProperty('previous')) {
            query = db.collection("Shipment").orderBy("date", 'desc').endBefore(new Date(req.query.previous));
        }
    }


    query.limit(6).get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.send(JSON.stringify({status: "success", data: data, size: count, limit: 6}));
    }).catch((err) => {
        res.send(JSON.stringify({status: "error", data: err}));
    });
}

function isInt(value) {
    return !isNaN(value) && (function (x) {
        return (x | 0) === x;
    })(parseFloat(value));
}

function dateFormatForTimeStamp(date) {
    date = new Date(date._seconds * 1000);
    return VMONTHS[date.getMonth()] + " " + ((date.getDate() < 10) ? ("0" + date.getDate()) : date.getDate()) + ", " + date.getFullYear();
}

module.exports = {getShipmentCount, getAllShipment, createInvoice, createCustomerInvoice, searchShipments, getShipments};