var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");
var validation = require('./validation');

router.post('/', function (req, res) {
    var data = req.body.data;
    if (req.body.headerState === "Default") {
        updateShipment(req, res, {headerState: "Default"});
    }else if (req.body.headerState === "edit") {
        var valid = isValid(data.edit);
        if (valid.isValid) {
            updateShipment(req, res, {
                headerState: "Edit",
                edit: data.edit
            });
        } else {
            res.end(JSON.stringify({status: "empty", msg: `Please Enter the value on <b>${valid.field}</b>`}));
        }
    } else if (req.body.headerState === "new") {
        if (isValidTable(data)) {
            updateShipment(req, res, {
                headerState: "New",
                new: data
            });
        } else {
            res.end(JSON.stringify({status: "empty", msg: "Your New Table header are empty"}));
        }
    } else {
        res.end(JSON.stringify({status: "empty", msg: "Somthing Went wtong try Again"}));
    }
});

function updateShipment(req, res, data) {
    console.log(JSON.stringify(data));
    admin.firestore().collection('Shipment').doc(req.body.key).set(data, {merge: true}).then(function () {
            sendData(req, res);
    }).catch(function (error) {
        console.log(error);
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

function isValid(data) {
    if (!validation.isEmpty(data.exporter)) {
        if (!validation.isEmpty(data.expoterref)) {
            if (!validation.isEmpty(data.consignee)) {
                if (!validation.isEmpty(data.buyer)) {
                    if (!validation.isEmpty(data.countryOfOriginGoods)) {
                        if (!validation.isEmpty(data.countryOfFinalDestination)) {
                            if (!validation.isEmpty(data.portofLoading)) {
                                if (!validation.isEmpty(data.portofDischarge)) {
                                    if (!validation.isEmpty(data.TermsofDeliveryAndPayments)) {
                                        return {isValid: true};
                                    } else {
                                        return {isValid: false, field: 'Terms of Delivery And Payments'};
                                    }
                                } else {
                                    return {isValid: false, field: 'Port of Discharge'};
                                }
                            } else {
                                return {isValid: false, field: 'Port of Loading'};
                            }
                        } else {
                            return {isValid: false, field: 'Country Of Final Destination'};
                        }
                    } else {
                        return {isValid: false, field: 'Country Of Origin Goods'};
                    }
                } else {
                    return {isValid: false, field: 'Buyer'};
                }
            } else {
                return {isValid: false, field: 'Consignee'};
            }
        } else {
            return {isValid: false, field: 'Expoter Ref'};
        }
    } else {
        return {isValid: false, field: 'Exporter'};
    }
}

function isValidTable(data) {
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var isValid = false;
        for (var j in row) {
            if (row[i].hasOwnProperty('text') && !validation.isEmpty(row[i].text)) {
                isValid = true;
                break;
            }
        }
        if (isValid) {
            return true;
        }
    }
    return false;
}

function sendData(req, res) {
    var db = admin.firestore();
    db.collection('Shipment').doc(req.body.key).get().then((snapshot) => {
        res.end(JSON.stringify({status: "success", isUpdate: true, data: snapshot.data()}));
    }).catch((err) => {
        console.log("Erro : " + err);
        res.end(JSON.stringify({status: "error", error: err}));
    });
}

module.exports = router;