var admin = require("firebase-admin");

function getCustomer(req, res) {
    // Import Admin SDK
    var db = admin.firestore();
    db.collection('Customer').get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

module.exports = {getCustomer};