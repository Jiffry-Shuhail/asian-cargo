var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");

router.post('/', function (req, res, next) {
    var db = admin.firestore();
    var parameter = req.body.data;
    if (Object.keys(parameter).length>0){
        var weight = {};
        weight[req.body.key.status] = {cartons:parameter};
        db.collection('Shipment').doc(req.body.key.shipment).set(weight, {merge: true}).then(function () {
            sendData(req, res);
        }).catch(function (error) {
            res.end(JSON.stringify({status: "error", error: error}));
        });
    }else{
        res.end(JSON.stringify({status: "error", error: "Invalid Data"}));
    }
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