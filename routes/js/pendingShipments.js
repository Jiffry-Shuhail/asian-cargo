var admin = require("firebase-admin");

function getPendingShipment(req, res) {
    var sessionCookie = req.cookies.session || '';
    admin.auth().verifySessionCookie(sessionCookie, false /** checkRevoked */).then((decodedClaims) => {
        var db = admin.firestore();
        var savedData = {};
        savedData[req.body.key] = req.body.data;

        db.collection('Pending').doc(decodedClaims.user_id).get().then((snapshot) => {
            var data = {};
            if (snapshot.exists) {
                data = snapshot.data();
            }
            res.send(JSON.stringify({status: "success", data: data}));
        }).catch((err) => {
            console.log('Error getting documents', err);
        });

    }).catch(error => {
    });
}

function removePendingShipment(req, res) {
    var sessionCookie = req.cookies.session || '';
    admin.auth().verifySessionCookie(sessionCookie, false /** checkRevoked */).then((decodedClaims) => {
        var db = admin.firestore();
        db.collection('Pending').doc(decodedClaims.user_id).update({[req.query.key]: admin.firestore.FieldValue.delete()}).then(function () {
            res.send(JSON.stringify({status: "success"}));
        });

    }).catch(error => {
    });
}

module.exports = {getPendingShipment, removePendingShipment};