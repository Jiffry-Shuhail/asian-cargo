var admin = require("firebase-admin");

function addOrUpdateClearing(req, res) {
    var db = admin.firestore();
    if (!isEmpty(req.body.key)) {
    console.log("IF");
    console.log(req.body.key);
    console.log("***********************************");
        db.collection('Clearing').doc(req.body.key).set(req.body.data,{merge: true}).then(function () {
            getAllClearing(req, res);
        }).catch(function (error) {
            console.log("++++++++++++++++++++++");
            console.log(error);
            res.end(JSON.stringify({status: "error", error: error}));
        });
    } else {
        console.log('ELSE');
        db.collection('Clearing').doc().set(req.body.data).then(function () {
            getAllClearing(req, res);
        }).catch(function (error) {
            console.log("************************************");
            console.log(error);
            res.end(JSON.stringify({status: "error", error: error}));
        });
    }
}

function getAllClearing(req, res) {
    var db = admin.firestore();
    db.collection('Clearing').orderBy("date", "desc").get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

function isEmpty(val) {

    if (val === undefined)
        return true;

    if (typeof (val) == 'function' || typeof (val) == 'number' || typeof (val) == 'boolean' || Object.prototype.toString.call(val) === '[object Date]')
        return false;

    if (val == null || val.length === 0)        // null or 0 length array
        return true;

    if (typeof (val) == "object") {
        // empty object

        var r = true;

        for (var f in val)
            r = false;

        return r;
    }

    return false;
}


module.exports = {addOrUpdateClearing, getAllClearing};