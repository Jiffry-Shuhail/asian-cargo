var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");
var validation = require('./validation');

router.post('/', function (req, res) {
    var db = admin.firestore();
    var parameter = req.body.data;
    db.collection('Shipment').doc(req.body.key.shipment).get().then((snapshot) => {
        var data = snapshot.data();
        var updateData = {};
        if (data.hasOwnProperty('editShipment')) {
            if (data.editShipment.toString() !== parameter.editShipment) {
                updateData.editShipment = parameter.editShipment;
            }
        } else if (data.shipment.toString() !== parameter.editShipment) {
            updateData.editShipment = parameter.editShipment;
        }
        if (!validation.isEmpty(parameter.marks)) {
            updateData.marks=parameter.marks.trim();
        }else{
            updateData.marks='"ASC/CMB"';
        }
        
        if (data.hasOwnProperty('editDate')) {
            var dbDate = new Date(data.editDate._seconds * 1000);
            var dbDateString = dbDate.getFullYear() + "" + String(dbDate.getMonth() + 1).padStart(2, '0') + "" + dbDate.getDate();
            var prDate = new Date(parameter.editDate);
            var prDateString = prDate.getFullYear() + "" + String(prDate.getMonth() + 1).padStart(2, '0') + "" + prDate.getDate();
            if (dbDateString !== prDateString) {
                updateData.editDate = prDate;
            }
        } else {
            var dbDate = new Date(data.date._seconds * 1000);
            var dbDateString = dbDate.getFullYear() + "" + String(dbDate.getMonth() + 1).padStart(2, '0') + "" + dbDate.getDate();
            var prDate = new Date(parameter.editDate);
            var prDateString = prDate.getFullYear() + "" + String(prDate.getMonth() + 1).padStart(2, '0') + "" + prDate.getDate();
            if (dbDateString !== prDateString) {
                updateData.editDate = prDate
            }
        }

        var isWeight = false;
        var weight = {};
        if (data[req.body.key.status].needWeight !== parameter.needWeight) {
            isWeight = true;
            weight[req.body.key.status] = {needWeight: parameter.needWeight};
        }

        if (Object.keys(updateData).length > 0) {
            db.collection('Shipment').doc(req.body.key.shipment).set(updateData, {merge: true}).then(function () {
                if (isWeight) {
                    db.collection('Shipment').doc(req.body.key.shipment).set(weight, {merge: true}).then(function () {
                        sendData(req, res);
                    }).catch(function (error) {
                        res.end(JSON.stringify({status: "error", error: error}));
                    });
                } else {
                    sendData(req, res);
                }
            }).catch(function (error) {
                res.end(JSON.stringify({status: "error", error: error}));
            });
        } else if (isWeight) {
            db.collection('Shipment').doc(req.body.key.shipment).set(weight, {merge: true}).then(function () {
                sendData(req, res);
            }).catch(function (error) {
                res.end(JSON.stringify({status: "error", error: error}));
            });
        } else {
            res.end(JSON.stringify({status: "success", isUpdate: false}));
        }
    }).catch((err) => {
        console.log(err);
        res.end(JSON.stringify({status: "error", error: err}));
    });
});


function sendData(req, res) {
    var db = admin.firestore();
    db.collection('Shipment').doc(req.body.key.shipment).get().then((snapshot) => {
        res.end(JSON.stringify({status: "success", isUpdate: true, data: snapshot.data()}));
    }).catch((err) => {
        console.log("Erro : "+err);
        res.end(JSON.stringify({status: "error", error: err}));
    });
}

module.exports = router;