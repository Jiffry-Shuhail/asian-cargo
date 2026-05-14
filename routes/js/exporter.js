var admin = require("firebase-admin");

function getExporter(req, res) {
    var db = admin.firestore();
    db.collection('Exporter').get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

function addExporter(req, res) {
    var db = admin.firestore();
    db.collection('Exporter').doc(req.body.key).set(req.body.data).then(function () {
        res.end(JSON.stringify({status: "success"}));
    }).catch(function (error) {
        res.end(JSON.stringify({status: "error", error:error}));
    });
}

module.exports = {getExporter, addExporter};