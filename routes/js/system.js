var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");

function getContainer(req, res) {
    var db = admin.firestore();
    db.collection('SYSTEM').doc('CONTAINER').get().then((doc) => {
        res.send(JSON.stringify({status: "success", data: doc.data()}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

function getShippingProcess(req, res) {
    var db = admin.firestore();
    db.collection('SYSTEM').doc('SHIPPINGPROCESS').get().then((doc) => {
        res.send(JSON.stringify({status: "success", data: doc.data()}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}


module.exports ={getContainer,getShippingProcess};