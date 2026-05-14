var admin = require("firebase-admin");

function syncShipment(req, res) {
    var sessionCookie = req.cookies.session || '';
    admin.auth().verifySessionCookie(sessionCookie, false /** checkRevoked */).then((decodedClaims) => {
        var db = admin.firestore();

        db.collection('Pending').doc(decodedClaims.user_id).get().then((snapshot) => {
            var savedData = {};
            if (snapshot.exists) {
                savedData = snapshot.data();
            }
            savedData[req.body.key] = req.body.data;
            db.collection('Pending').doc(decodedClaims.user_id).set(savedData).then(function () {
                res.end(JSON.stringify({status: "success"}));
            }).catch(function (error) {
                console.log(`Encountered error: ${error}`);
                res.end(JSON.stringify({status: "error", error: error}));
            });
        }).catch((err) => {
            console.log('Error getting documents', err);
        });

    }).catch(error => {
        console.log(`Encountered error: ${error}`);
    });
}

function addShipment(req, res) {
    console.log(new Date());
    console.log("***************************************");
    var sessionCookie = req.cookies.session || '';
    admin.auth().verifySessionCookie(sessionCookie, false /** checkRevoked */).then((decodedClaims) => {
        var db = admin.firestore();
        var parameter = req.body.data;
        var key = parameter.exporter + " SHIPMENT " + parameter.shipment;
        var index = parameter.index;
        var isAvailable = false;
        if (parseInt(index) > parseInt(parameter.shipment)) {
            isAvailable = true;
        }

        if (req.body.pending !== null) {
            db.collection('Pending').doc(decodedClaims.user_id).update({[req.body.pending]: admin.firestore.FieldValue.delete()});
        }
        db.collection('Pending').doc(decodedClaims.user_id).update({[key]: admin.firestore.FieldValue.delete()});

        if (isAvailable) {
            db.collection('Shipment').doc(key).get().then((doc) => {
                if (doc.exists) {
                    var updateDoc = doc.data();

                    var status = updateDoc.status;
                    var isStatus = false;
                    for (var i = 0; i < status.length; i++) {
                        if (status[i] === parameter.status) {
                            isStatus = true;
                        }
                    }

                    var myData = JSON.parse(JSON.stringify(updateDoc));
                    if (!isStatus) {
                        myData.status.push(parameter.status);
                        myData[parameter.status] = {cartons: parameter[parameter.status].cartons};
                        var cartons = parameter[parameter.status].cartons;
                        var totalWeight = 0;
                        for (var c in cartons) {
                            totalWeight += parseFloat(cartons[c].weight);
                        }
                        myData[parameter.status].isInvoiced = false;
                        myData[parameter.status].freight = "660";
                        myData[parameter.status].insurance = "0";
                        myData[parameter.status].marks = "ASC/CMB";
                        myData[parameter.status].needWeight = totalWeight + "";
                        myData[parameter.status].id = req.body.data.shipment;
                        myData[parameter.status].valuePerTone = "0.700";
                        myData[parameter.status].date = new Date();
                        myData[parameter.status].user = decodedClaims.user_id;
                        myData.activeStatus = parameter.status;
                        myData.timestamp = admin.firestore.FieldValue.serverTimestamp();
                    } else {
                        myData.activeStatus = parameter.status;
                        myData[myData.activeStatus].cartons = parameter[parameter.status].cartons;
                        myData[myData.activeStatus].updateUser = decodedClaims.user_id;
                    }
                    parameter = myData;

                    db.collection('Shipment').doc(key).set(parameter).then(function () {
                        res.end(JSON.stringify({status: "success", data: {exporter: parameter.exporter, shipment: parseInt(parameter.shipment)}}));
                    }).catch(function (error) {
                        res.end(JSON.stringify({status: "error", error: error}));
                    });

                } else {
                    console.log("No such document!");
                }
            }).catch((err) => {
            });
        } else {

            console.log(new Date());
            console.log("***************************************");

            parameter.date = new Date();
            parameter.isActive = true;
            var cartons = parameter[parameter.status].cartons;
            var totalWeight = 0;
            for (var c in cartons) {
                totalWeight += parseFloat(cartons[c].weight);
            }
            parameter.activeStatus = parameter.status;
            parameter.status = [parameter.status];
            parameter.timestamp = admin.firestore.Timestamp.fromDate(new Date());
            parameter[parameter.status].isInvoiced = false;
            parameter[parameter.status].freight = "660";
            parameter[parameter.status].insurance = "0";
            parameter[parameter.status].marks = "ASC/CMB";
            parameter[parameter.status].needWeight = totalWeight + "";
            parameter[parameter.status].id = req.body.data.shipment;
            parameter[parameter.status].valuePerTone = "0.700";
            parameter[parameter.status].date = new Date();
            parameter[parameter.status].user = decodedClaims.user_id;

            db.collection('Shipment').doc(key).set(parameter).then(function () {
//                Increase Shipment Nuber
                db.collection('Exporter').doc(parameter.exporter).update({shipment: (parseInt(parameter.shipment) + 1)}).then(function () {
                    res.end(JSON.stringify({status: "success", data: {exporter: parameter.exporter, shipment: parseInt(parameter.shipment) + 1}}));
                }).catch(function (error) {
                    res.end(JSON.stringify({status: "error", error: error}));
                });

            }).catch(function (error) {
                res.end(JSON.stringify({status: "error", error: error}));
            });
        }
        //Find ShipmentCount
//        db.collection('Shipment').get().then((snapshot) => {
//            var index = 0;
//            var updateDoc = null;
//            var isAvailable = false;
//            snapshot.forEach((doc) => {
//                if (doc.id === key) {
//                    updateDoc = doc.data();
//                    isAvailable = true;
//                }
//
//                if (doc.id.includes(parameter.exporter)) {
//                    index++;
//                }
//            });
//            console.log(new Date());
//            console.log("***************************************");
//            //Removing Pending Data
//            if (req.body.pending !== null) {
//                db.collection('Pending').doc(decodedClaims.user_id).update({[req.body.pending]: admin.firestore.FieldValue.delete()});
//            }
//            db.collection('Pending').doc(decodedClaims.user_id).update({[key]: admin.firestore.FieldValue.delete()});
//            if (isAvailable) {
//                var status = updateDoc.status;
//                var isStatus = false;
//                for (var i = 0; i < status.length; i++) {
//                    if (status[i] === parameter.status) {
//                        isStatus = true;
//                    }
//                }
//
//                var myData = JSON.parse(JSON.stringify(updateDoc));
//                if (!isStatus) {
//                    myData.status.push(parameter.status);
//                    myData[parameter.status] = {cartons: parameter[parameter.status].cartons};
//                    var cartons = parameter[parameter.status].cartons;
//                    var totalWeight = 0;
//                    for (var c in cartons) {
//                        totalWeight += parseFloat(cartons[c].weight);
//                    }
//                    myData[parameter.status].isInvoiced = false;
//                    myData[parameter.status].freight = "660";
//                    myData[parameter.status].insurance = "0";
//                    myData[parameter.status].marks = "ASC/CMB";
//                    myData[parameter.status].needWeight = totalWeight + "";
//                    myData[parameter.status].id = req.body.data.shipment;
//                    myData[parameter.status].valuePerTone = "0.700";
//                    myData[parameter.status].date = new Date();
//                    myData[parameter.status].user = decodedClaims.user_id;
//                    myData.activeStatus = parameter.status;
//                } else {
//                    myData.activeStatus = parameter.status;
//                    myData[myData.activeStatus].cartons = parameter[parameter.status].cartons;
//                    myData[myData.activeStatus].updateUser = decodedClaims.user_id;
//                }
//                parameter = myData;
//            } else {
//                //Correct Shipment Number
//                //index++;
//                parameter.date = new Date();
//                parameter.shipment = index;
//                parameter.isActive = true;
//                var cartons = parameter[parameter.status].cartons;
//                var totalWeight = 0;
//                for (var c in cartons) {
//                    totalWeight += parseFloat(cartons[c].weight);
//                }
//                parameter.activeStatus = parameter.status;
//                parameter.status = [parameter.status];
//                parameter[parameter.status].isInvoiced = false;
//                parameter[parameter.status].freight = "660";
//                parameter[parameter.status].insurance = "0";
//                parameter[parameter.status].marks = "ASC/CMB";
//                parameter[parameter.status].needWeight = totalWeight + "";
//                parameter[parameter.status].id = req.body.data.shipment;
//                parameter[parameter.status].valuePerTone = "0.700";
//                parameter[parameter.status].date = new Date();
//                parameter[parameter.status].user = decodedClaims.user_id;
//            }
//
//            //Save Shipment
//            db.collection('Shipment').doc(key).set(parameter).then(function () {
//
////                Increase Shipment Nuber
//                db.collection('Exporter').doc(parameter.exporter).update({shipment: (parseInt(parameter.shipment) + 1)}).then(function () {
//                    res.end(JSON.stringify({status: "success", data: {exporter: parameter.exporter, shipment: parseInt(parameter.shipment) + 1}}));
//                }).catch(function (error) {
//                    res.end(JSON.stringify({status: "error", error: error}));
//                });
//
//            }).catch(function (error) {
//                res.end(JSON.stringify({status: "error", error: error}));
//            });
//
//        }).catch((err) => {
//        });
    }).catch(error => {
    });
}

module.exports = {syncShipment, addShipment};