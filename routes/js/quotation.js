var admin = require("firebase-admin");

function addOrUpdateQuotation(req, res) {
    var db = admin.firestore();
    if (req.body.key !== null) {
        db.collection('Quotation').doc(req.body.key).set(req.body.data,{merge: true}).then(function () {
            getAllQuotation(req, res);
        }).catch(function (error) {
            console.log(error);
            res.end(JSON.stringify({status: "error", error: error}));
        });
    } else {
        db.collection('Quotation').doc().set(req.body.data).then(function () {
            getAllQuotation(req, res);
        }).catch(function (error) {
            console.log(error);
            res.end(JSON.stringify({status: "error", error: error}));
        });
    }
}

function getAllQuotation(req, res) {
    var db = admin.firestore();
    db.collection('Quotation').orderBy("date", "desc").get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

module.exports = {addOrUpdateQuotation, getAllQuotation};