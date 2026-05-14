var admin = require("firebase-admin");
var path = require("path");
const fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
    projectId: "asian-cargo",
    keyFilename: 'serviceAccountKey.json'
});
const bucket = storage.bucket('asian-cargo.appspot.com');

function addCustomer(req, res) {
    var db = admin.firestore();
    db.collection('Customer').doc(req.body.key).set(req.body.data).then(function () {
        res.end(JSON.stringify({status: "success"}));
    }).catch(function (error) {
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

async function  getCustomer(req, res) {
    var db = admin.firestore();
//    var query = db.collection("Customer").orderBy("name");
//
//    var count = 0;
//
//    if (req.query.hasOwnProperty('key')) {
//        var result = JSON.parse(req.query.key);
//        query = db.collection("Customer").where('name', "in", result);
//        if (req.query.hasOwnProperty('next')) {
//            var getCount = await query.get();
//            count = getCount.size;
//            query = db.collection("Customer").where('name', "in", result).startAfter(req.query.next);
//        } else if (req.query.hasOwnProperty('previous')) {
//            var getCount = await query.get();
//            count = getCount.size;
//            query = db.collection("Customer").where('name', "in", result).endBefore(req.query.previous);
//        } else {
//            var getCount = await query.get();
//            count = getCount.size;
//        }
//    } else {
//        var getCount = await query.get();
//        count = getCount.size;
//        if (req.query.hasOwnProperty('next')) {
//            query = db.collection("Customer").orderBy("name").startAfter(req.query.next);
//        } else if (req.query.hasOwnProperty('previous')) {
//            query = db.collection("Customer").orderBy("name").endBefore(req.query.previous);
//        }
//    }


//    if (req.query.hasOwnProperty('key')) {
//        var result = JSON.parse(req.query.key);
//        query.where("name", "in", result).where("contact", "in", result);
//    }


    db.collection("Customer").get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.send(JSON.stringify({status: "success", data: data, size: count, limit: 6}));
    }).catch((err) => {
        res.send(JSON.stringify({status: "error", data: err}));
    });
}

function getAllCustomers(req, res) {
    var db = admin.firestore();
    db.collection('Customer').get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.end(JSON.stringify({status: "success", isUpdate: true, data: data}));
    }).catch((err) => {
        console.log("Erro : " + err);
        res.end(JSON.stringify({status: "error", error: err}));
    });
}

function serachCustomer(req, res) {
    var db = admin.firestore();
    db.collection("Customer").orderBy("name").where("name", ">=", req.query.search).where("name", "<=", req.query.search + '\uf8ff').get().then((snapshot) => {
        var data = {success: true, results: []};
        snapshot.forEach((doc) => {
            data.results.push({name: doc.data().name, value: doc.data().name, text: doc.data().name});
            data.results.push({name: doc.data().contact, value: doc.data().name, text: doc.data().contact});
        });
        res.send(JSON.stringify(data));
    }).catch((err) => {
        console.log('Error getting documents', err);
        res.send(JSON.stringify({success: false}));
    });
}

async function editCustomer(req, res) {
    var params = req.body;
    var data = {
        aname: params.aname,
        address: params.address,
        contact: params.contact,
        showcontact: params.showcontact,
        nic: params.nic,
        dob: params.dob,
        oaddress: params.oaddress,
        company: params.company,
        coaddress: params.coaddress
    };

    
    if (params.remove === "1") {
        data["image"] = "";
    }
    if (req.files !== null && req.files.image) {
        var sampleFile = req.files.image;
        var saveTemp = await sampleFile.mv(`./temp/${params.key.replace(/\s/g, '-')}.png`);
        if (saveTemp) {
            console.log(saveTemp);
        } else {
            const res1 = await bucket.upload(path.resolve(`./temp/${params.key.replace(/\s/g, '-')}.png`));
            const url = res1[0].metadata.mediaLink;
            await bucket.file(`${params.key.replace(/\s/g, '-')}.png`).makePublic();
            data["image"] = url;
            fs.unlink(`./temp/${params.key.replace(/\s/g, '-')}.png`, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //file removed
            });
            updateCustomer(req, res, data);
        }
    } else {
        updateCustomer(req, res, data);
    }
}

function updateCustomer(req, res, data) {
    var db = admin.firestore();
    db.collection('Customer').doc(req.body.key).set(data, {merge: true}).then(function () {
        db.collection('Customer').doc(req.body.key).get().then((snapshot) => {
            res.end(JSON.stringify({status: "success", isUpdate: true, data: snapshot.data()}));
        }).catch((err) => {
            console.log("Erro : " + err);
            res.end(JSON.stringify({status: "error", error: err}));
        });
    }).catch(function (error) {
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

function updateCustomerPriceList(req, res) {
    console.log("******************************************");
    console.log(req.body.key);
    var db = admin.firestore();
    db.collection('Customer').doc(req.body.key).set(req.body.data, {merge: true}).then(function () {
        db.collection('Customer').doc(req.body.key).get().then((snapshot) => {
            res.end(JSON.stringify({status: "success", isUpdate: true, data: snapshot.data()}));
        }).catch((err) => {
            console.log("Erro : " + err);
            res.end(JSON.stringify({status: "error", error: err}));
        });
    }).catch(function (error) {
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

function manualUpdateShipment(req, res)  {
    var db = admin.firestore();
    var obj={
        "ORIGINAL":{
  "cartons": {
    "1": { "carton": "1", "customer": "DYNAMIC", "products": [{ "product": "JUICE JAR", "quantity": "50", "unit": "PCS" }], "weight": "18.25" },
    "2": { "carton": "2", "customer": "DYNAMIC", "products": [{ "product": "JUICE JAR", "quantity": "50", "unit": "PCS" }], "weight": "18.25" },
    "3": { "carton": "3", "customer": "DYNAMIC", "products": [{ "product": "JUICE JAR", "quantity": "50", "unit": "PCS" }], "weight": "18.25" },
    "4": { "carton": "4", "customer": "DYNAMIC", "products": [{ "product": "JUICE JAR", "quantity": "50", "unit": "PCS" }], "weight": "18.25" },
    "5": { "carton": "5", "customer": "DYNAMIC", "products": [{ "product": "COOKER GASKET", "quantity": "400", "unit": "PCS" }], "weight": "28.45" },
    "6": { "carton": "6", "customer": "DYNAMIC", "products": [{ "product": "COOKER GASKET", "quantity": "400", "unit": "PCS" }], "weight": "37.15" },
    "7": { "carton": "7", "customer": "DYNAMIC", "products": [{ "product": "COOKER GASKET", "quantity": "400", "unit": "PCS" }], "weight": "36.45" },
    "8": { "carton": "8", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "100", "unit": "PCS" }], "weight": "29.70" },
    "9": { "carton": "9", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "100", "unit": "PCS" }], "weight": "45.30" },
    "10": {
      "carton": "10",
      "customer": "DYNAMIC",
      "products": [
        { "product": "JAR HANDLE", "quantity": "100", "unit": "PCS" },
        { "product": "JAR CUPLER", "quantity": "2000", "unit": "PCS" },
        { "product": "COOKER GASKET", "quantity": "150", "unit": "PCS" }
      ],
      "weight": "34.75"
    },
    "11": { "carton": "11", "customer": "DYNAMIC", "products": [{ "product": "JAR COVER", "quantity": "504", "unit": "PCS" }], "weight": "51.30" },
    "12": { "carton": "12", "customer": "DYNAMIC", "products": [{ "product": "JAR COVER", "quantity": "504", "unit": "PCS" }], "weight": "50.85" },
    "13": { "carton": "13", "customer": "DYNAMIC", "products": [{ "product": "JAR COVER", "quantity": "504", "unit": "PCS" }], "weight": "52.10" },
    "14": { "carton": "14", "customer": "DYNAMIC", "products": [{ "product": "JAR DOOM COVER", "quantity": "660", "unit": "PCS" }], "weight": "51.00" },
    "15": { "carton": "15", "customer": "DYNAMIC", "products": [{ "product": "JAR DOOM COVER", "quantity": "660", "unit": "PCS" }], "weight": "51.65" },
    "16": { "carton": "16", "customer": "DYNAMIC", "products": [{ "product": "JAR COVER", "quantity": "1800", "unit": "PCS" }], "weight": "36.00" },
    "17": { "carton": "17", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "50", "unit": "SET" }], "weight": "57.90" },
    "18": { "carton": "18", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "50", "unit": "SET" }], "weight": "58.00" },
    "19": { "carton": "19", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "50", "unit": "SET" }], "weight": "57.75" },
    "20": { "carton": "20", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "50", "unit": "SET" }], "weight": "57.75" },
    "21": { "carton": "21", "customer": "DYNAMIC", "products": [{ "product": "PAN SUPPORTER", "quantity": "84", "unit": "SET" }], "weight": "53.15" },
    "22": { "carton": "22", "customer": "DYNAMIC", "products": [{ "product": "PAN SUPPORTER", "quantity": "84", "unit": "SET" }], "weight": "53.15" },
    "23": {
      "carton": "23",
      "customer": "NILUPULI",
      "products": [
        { "product": "WHEEL CYLINDER ASSEMBLY", "quantity": "1", "unit": "PCS" },
        { "product": "BRAKE DISC PAD", "quantity": "30", "unit": "PCS" }
      ],
      "weight": "46.80"
    },
    "24": { "carton": "24", "customer": "NILUPULI", "products": [{ "product": "BRAKE DISC", "quantity": "30", "unit": "PCS" }], "weight": "44.75" },
    "25": {
      "carton": "25",
      "customer": "NILUPULI",
      "products": [
        { "product": "WHEEL CYLINDER", "quantity": "160", "unit": "PCS" },
        { "product": "SLEEVE CYLINDER", "quantity": "10", "unit": "PCS" },
        { "product": "CLUTCH", "quantity": "10", "unit": "KIT" }
      ],
      "weight": "38.05"
    },
    "26": {
      "carton": "26",
      "customer": "WIJAMINI",
      "products": [
        { "product": "REPAIR KIT", "quantity": "30", "unit": "KIT" },
        { "product": "VALVE", "quantity": "7", "unit": "PCS" }
      ],
      "weight": "10.05"
    },
    "27": {
      "carton": "27",
      "customer": "WIJAMINI",
      "products": [
        { "product": "COOLENT TANK", "quantity": "4", "unit": "PCS" },
        { "product": "REPAIR KIT VALVE", "quantity": "8", "unit": "KIT" },
        { "product": "CYLINDER HEAD", "quantity": "1", "unit": "PCS" }
      ],
      "weight": "16.15"
    },
    "28": {
      "carton": "28",
      "customer": "WIJAMINI",
      "products": [
        { "product": "COOLANT TANK", "quantity": "3", "unit": "PCS" },
        { "product": "REPAIR KIT", "quantity": "12", "unit": "PCS" },
        { "product": "VALVE PLATE", "quantity": "3", "unit": "PCS" },
        { "product": "VALVE HEAD", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "16.20"
    },
    "29": { "carton": "29", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "30": { "carton": "30", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "31": { "carton": "31", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "32": { "carton": "32", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "33": { "carton": "33", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "34": { "carton": "34", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "35": { "carton": "35", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "36": {
      "carton": "36",
      "customer": "HIRAN UBAID",
      "products": [
        { "product": "HINGES", "quantity": "28", "unit": "PCS" },
        { "product": "STAY", "quantity": "19", "unit": "PCS" },
        { "product": "LOCK", "quantity": "2", "unit": "SET" },
        { "product": "RING", "quantity": "42", "unit": "PCS" },
        { "product": "BOLT", "quantity": "48", "unit": "PCS" },
        { "product": "FASTENERS", "quantity": "40", "unit": "PCS" }
      ],
      "weight": "48.70"
    },
    "37": { "carton": "37", "customer": "DYNAMIC", "products": [{ "product": "MIXI BODY", "quantity": "36", "unit": "SET" }], "weight": "42.45" },
    "38": { "carton": "38", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "15.65" },
    "39": { "carton": "39", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "15.25" },
    "40": { "carton": "40", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "15.25" },
    "41": {
      "carton": "41",
      "customer": "DYNAMIC",
      "products": [
        { "product": "SILENCER", "quantity": "2", "unit": "PCS" },
        { "product": "VENT", "quantity": "3", "unit": "PCS" },
        { "product": "SPEEDO METER COVER", "quantity": "1", "unit": "PCS" },
        { "product": "SIDE COVER", "quantity": "10", "unit": "PCS" },
        { "product": "RADIATOR FAN", "quantity": "4", "unit": "PCS" }
      ],
      "weight": "32.45"
    },
    "42": {
      "carton": "42",
      "customer": "HASHAN LANKA AUTO PARTS",
      "products": [
        { "product": "STEERING BOX ASSY", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "12.30"
    },
    "43": {
      "carton": "43",
      "customer": "HASHAN LANKA AUTO PARTS",
      "products": [
        { "product": "BRAKE BOOSTER", "quantity": "4", "unit": "PCS" },
        { "product": "RADIATOR TANK", "quantity": "8", "unit": "PCS" },
        { "product": "CONTROL ASSY", "quantity": "3", "unit": "PCS" },
        { "product": "HOSE", "quantity": "1", "unit": "PCS" }
      ],
      "weight": "17.35"
    },
    "44": {
      "carton": "44",
      "customer": "HASHAN LANKA AUTO PARTS",
      "products": [
        { "product": "DRIVE AXLE SHAFT", "quantity": "2", "unit": "PCS" },
        { "product": "CLUTCH PULLY SET DOOR REGULATOR ASSY", "quantity": "6", "unit": "PCS" },
        { "product": "CLUTCH PULLY SET DOOR REGULATOR ASSY", "quantity": "1", "unit": "SET" },
        { "product": "SILENCER", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "43.45"
    },
    "45": { "carton": "45", "customer": "HASHAN LANKA AUTO PARTS", "products": [{ "product": "FRONT STAY", "quantity": "1", "unit": "PCS" }], "weight": "5.20" },
    "46": { "carton": "46", "customer": "HASHAN LANKA AUTO PARTS", "products": [{ "product": "BONNET", "quantity": "2", "unit": "PCS" }], "weight": "0.00" },
    "47": {
      "carton": "47",
      "customer": "HASHAN LANKA AUTO PARTS",
      "products": [
        { "product": "BONNET", "quantity": "2", "unit": "PCS" },
        { "product": "FRONT FENDER", "quantity": "1", "unit": "PCS" }
      ],
      "weight": "0.00"
    },
    "48": {
      "carton": "48",
      "customer": "HASHAN LANKA AUTO PARTS",
      "products": [
        { "product": "BUMPER", "quantity": "1", "unit": "PCS" },
        { "product": "FRONT FENDER", "quantity": "0.1", "unit": "PCS" },
        { "product": "WIRING KIT", "quantity": "1", "unit": "KIT" }
      ],
      "weight": "0.00"
    },
    "49": { "carton": "49", "customer": "HASHAN LANKA AUTO PARTS", "products": [{ "product": "KNUCKLE", "quantity": "2", "unit": "PCS" }], "weight": "23.75" },
    "50": { "carton": "50", "customer": "DYNAMIC", "products": [{ "product": "JUICE JAR", "quantity": "30", "unit": "PCS" }], "weight": "20.20" },
    "51": { "carton": "51", "customer": "DYNAMIC", "products": [{ "product": "PAN SUPPORTER", "quantity": "68", "unit": "SET" }], "weight": "45.00" },
    "52": {
      "carton": "52",
      "customer": "DYNAMIC",
      "products": [
        { "product": "CARBURATOR", "quantity": "40", "unit": "BOX" },
        { "product": "JAR SHAFT", "quantity": "1900", "unit": "PCS" }
      ],
      "weight": "34.95"
    },
    "53": {
      "carton": "53",
      "customer": "HYAS",
      "products": [
        { "product": "STEERING CONE KIT", "quantity": "5", "unit": "PCS" },
        { "product": "STEERING PIN", "quantity": "40", "unit": "PCS" },
        { "product": "WIPER WHEEL", "quantity": "10", "unit": "PCS" },
        { "product": "REVERSE SHAFT", "quantity": "2", "unit": "PCS" },
        { "product": "AXLE", "quantity": "19", "unit": "PCS" },
        { "product": "NEEDLE BEARING", "quantity": "20", "unit": "PCS" },
        { "product": "INNER RING", "quantity": "88", "unit": "PCS" },
        { "product": "FAN COVER", "quantity": "30", "unit": "PCS" },
        { "product": "BEARING", "quantity": "11", "unit": "PCS" }
      ],
      "weight": "21.60"
    },
    "54": { "carton": "54", "customer": "HYAS", "products": [{ "product": "BACK PLATE", "quantity": "10", "unit": "PCS" }], "weight": "11.05" },
    "55": {
      "carton": "55",
      "customer": "HYAS",
      "products": [
        { "product": "GEAR SHAFT", "quantity": "7", "unit": "PCS" },
        { "product": "TANK UNIT", "quantity": "6", "unit": "PCS" },
        { "product": "BOLT", "quantity": "10", "unit": "PCS" },
        { "product": "FUEL FILTER ELEMENT", "quantity": "10", "unit": "PCS" },
        { "product": "DUST COVER", "quantity": "12", "unit": "PCS" },
        { "product": "MINOR KIT", "quantity": "70", "unit": "PCS" },
        { "product": "PUSH ROD", "quantity": "40", "unit": "PCS" },
        { "product": "NEEDLE BUSH", "quantity": "10", "unit": "PCS" },
        { "product": "CLUTCH SHAFT", "quantity": "1", "unit": "PCS" },
        { "product": "AIR FILTER", "quantity": "8", "unit": "PCS" }
      ],
      "weight": "14.60"
    },
    "56": { "carton": "56", "customer": "NEW SELECTION", "products": [{ "product": "NECKLACE", "quantity": "79", "unit": "BOX" }], "weight": "21.45" },
    "57": { "carton": "57", "customer": "NST", "products": [{ "product": "BURNER TOP", "quantity": "200", "unit": "SET" }], "weight": "29.90" },
    "58": { "carton": "58", "customer": "NST", "products": [{ "product": "BURNER TOP", "quantity": "250", "unit": "SET" }], "weight": "34.00" },
    "59": { "carton": "59", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "19.30" },
    "60": { "carton": "60", "customer": "LOYD", "products": [{ "product": "STEERING BOX ASSY", "quantity": "3", "unit": "PCS" }], "weight": "14.60" },
    "61": { "carton": "61", "customer": "LOYD", "products": [{ "product": "SUSPENTION STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "23.00" },
    "62": { "carton": "62", "customer": "LOYD", "products": [{ "product": "SUSPENTION STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "23.05" },
    "63": { "carton": "63", "customer": "LOYD", "products": [{ "product": "SUSPENTION STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "25.30" },
    "64": { "carton": "64", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "2", "unit": "PCS" }], "weight": "16.00" },
    "65": {
      "carton": "65",
      "customer": "LOYD",
      "products": [
        { "product": "ENGINE MOUNTING", "quantity": "6", "unit": "PCS" },
        { "product": "BRAKE CALIPER", "quantity": "7", "unit": "PCS" },
        { "product": "SENSOR", "quantity": "20", "unit": "PCS" },
        { "product": "WHEEL CYLINDER ASSY", "quantity": "9", "unit": "PCS" },
        { "product": "CAP", "quantity": "40", "unit": "PCS" },
        { "product": "BEARING", "quantity": "20", "unit": "PCS" },
        { "product": "THERMOSTAT CAP", "quantity": "4", "unit": "PCS" },
        { "product": "OIL PUMP ASSY", "quantity": "7", "unit": "PCS" },
        { "product": "BEARING", "quantity": "10", "unit": "PCS" },
        { "product": "BUMPER HOLDER", "quantity": "35", "unit": "PCS" },
        { "product": "OUTER PIPE", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "26.85"
    },
    "66": {
      "carton": "66",
      "customer": "LOYD",
      "products": [
        { "product": "SPARK PLUG", "quantity": "90", "unit": "PCS" },
        { "product": "PISTON CUP SET", "quantity": "5", "unit": "PCS" },
        { "product": "HOSE", "quantity": "10", "unit": "PCS" },
        { "product": "PISTON SEAL SET", "quantity": "10", "unit": "PCS" },
        { "product": "THERMO CAP", "quantity": "4", "unit": "PCS" },
        { "product": "OUTER PIPE", "quantity": "10", "unit": "PCS" },
        { "product": "RACK BOOT", "quantity": "20", "unit": "PCS" }
      ],
      "weight": "19.65"
    },
    "67": {
      "carton": "67",
      "customer": "LOYD",
      "products": [
        { "product": "FAN ASSY", "quantity": "5", "unit": "PCS" },
        { "product": "RADIATOR ASSY", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "17.00"
    },
    "68": {
      "carton": "68",
      "customer": "LOYD",
      "products": [
        { "product": "LAMP UNIT", "quantity": "3", "unit": "PCS" },
        { "product": "HEAD LIGHT", "quantity": "2", "unit": "PCS" },
        { "product": "ENGINE FAN ASSY", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "13.85"
    },
    "69": {
      "carton": "69",
      "customer": "LOYD",
      "products": [
        { "product": "LAMP UNIT COMP", "quantity": "2", "unit": "PCS" },
        { "product": "ENGINE FAN ASSY", "quantity": "4", "unit": "PCS" }
      ],
      "weight": "13.30"
    },
    "70": {
      "carton": "70",
      "customer": "LOYD",
      "products": [
        { "product": "HEAD LIGHT", "quantity": "2", "unit": "PCS" },
        { "product": "SIDE MIRROR", "quantity": "5", "unit": "PCS" }
      ],
      "weight": "12.00"
    },
    "71": { "carton": "71", "customer": "LOYD", "products": [{ "product": "CLUTCH SET", "quantity": "5", "unit": "PCS" }], "weight": "16.15" },
    "72": { "carton": "72", "customer": "LOYD", "products": [{ "product": "SUSPENTION ARM", "quantity": "4", "unit": "PCS" }], "weight": "12.70" },
    "73": {
      "carton": "73",
      "customer": "LOYD",
      "products": [
        { "product": "AIR ELEMENT", "quantity": "20", "unit": "PCS" },
        { "product": "WIPER LINK", "quantity": "7", "unit": "PCS" },
        { "product": "LAMP UNIT", "quantity": "1", "unit": "PCS" },
        { "product": "SUSPENTION STRUT ASSY", "quantity": "2", "unit": "PCS" },
        { "product": "BOOT SET", "quantity": "8", "unit": "PCS" },
        { "product": "FUEL FILTER", "quantity": "16", "unit": "PCS" },
        { "product": "THERMO CASE", "quantity": "14", "unit": "PCS" },
        { "product": "SUSPENTION STRUT ASSY", "quantity": "1", "unit": "PCS" }
      ],
      "weight": "35.45"
    },
    "74": {
      "carton": "74",
      "customer": "LOYD",
      "products": [
        { "product": "ENGINE MOUNTING", "quantity": "4", "unit": "PCS" },
        { "product": "REGULATOR ASSY", "quantity": "4", "unit": "PCS" },
        { "product": "OUTER PIPE", "quantity": "14", "unit": "PCS" }
      ],
      "weight": "20.50"
    },
    "75": { "carton": "75", "customer": "CP PATHINAYAKA", "products": [{ "product": "GEAR CASE COVER", "quantity": "24", "unit": "PCS" }], "weight": "27.65" },
    "76": { "carton": "76", "customer": "CP PATHINAYAKA", "products": [{ "product": "GEAR CASE COVER", "quantity": "24", "unit": "PCS" }], "weight": "27.40" },
    "77": { "carton": "77", "customer": "CP PATHINAYAKA", "products": [{ "product": "GEAR CASE COVER", "quantity": "48", "unit": "PCS" }], "weight": "28.60" },
    "78": { "carton": "78", "customer": "CP PATHINAYAKA", "products": [{ "product": "GEAR CASE COVER", "quantity": "48", "unit": "PCS" }], "weight": "28.45" },
    "79": { "carton": "79", "customer": "CP PATHINAYAKA", "products": [{ "product": "BEARING", "quantity": "14", "unit": "PCS" }], "weight": "26.55" },
    "80": { "carton": "80", "customer": "CP PATHINAYAKA", "products": [{ "product": "BEARING", "quantity": "10", "unit": "PCS" }], "weight": "26.60" },
    "81": { "carton": "81", "customer": "CP PATHINAYAKA", "products": [{ "product": "BEARING", "quantity": "6", "unit": "PCS" }], "weight": "23.45" },
    "82": { "carton": "82", "customer": "CP PATHINAYAKA", "products": [{ "product": "BEARING", "quantity": "9", "unit": "PCS" }], "weight": "22.80" },
    "83": { "carton": "83", "customer": "CP PATHINAYAKA", "products": [{ "product": "BEARING", "quantity": "9", "unit": "PCS" }], "weight": "20.00" },
    "84": { "carton": "84", "customer": "FAZLAN", "products": [{ "product": "MUD GUARD", "quantity": "39", "unit": "PCS" }], "weight": "26.80" },
    "85": { "carton": "85", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "100", "unit": "PCS" }], "weight": "51.00" },
    "86": {
      "carton": "86",
      "customer": "SUMANA MOTORS",
      "products": [
        { "product": "WHEEL CYLINDER", "quantity": "40", "unit": "PCS" },
        { "product": "MASTER CYLINDER", "quantity": "20", "unit": "PCS" }
      ],
      "weight": "50.10"
    },
    "87": {
      "carton": "87",
      "customer": "SUMANA MOTORS",
      "products": [
        { "product": "WHEEL CYLINDER", "quantity": "60", "unit": "PCS" },
        { "product": "MASTER CYLINDER", "quantity": "4", "unit": "PCS" }
      ],
      "weight": "31.50"
    },
    "88": {
      "carton": "88",
      "customer": "SUMANA MOTORS",
      "products": [
        { "product": "INNER VANTERY", "quantity": "4", "unit": "PCS" },
        { "product": "FUEL PUMP", "quantity": "8", "unit": "PCS" },
        { "product": "CARBURATOR REPAIR KIT", "quantity": "59", "unit": "PCS" },
        { "product": "CARBURATOR ASSY", "quantity": "5", "unit": "PCS" },
        { "product": "VALVE", "quantity": "6", "unit": "PCS" }
      ],
      "weight": "21.75"
    },
    "89": {
      "carton": "89",
      "customer": "SUMANA MOTORS",
      "products": [
        { "product": "WHEEL CYLINDER", "quantity": "70", "unit": "PCS" },
        { "product": "MASTER CYLINDER", "quantity": "7", "unit": "PCS" }
      ],
      "weight": "38.75"
    },
    "90": {
      "carton": "90",
      "customer": "SUMANA MOTORS",
      "products": [
        { "product": "MASTER CYLINDER", "quantity": "19", "unit": "PCS" },
        { "product": "WHEEL CYLINDER", "quantity": "20", "unit": "PCS" }
      ],
      "weight": "44.80"
    },
    "91": { "carton": "91", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "20.75" },
    "92": { "carton": "92", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "20.75" },
    "93": { "carton": "93", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "20.75" },
    "94": { "carton": "94", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "20.75" },
    "95": { "carton": "95", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "20.70" },
    "96": { "carton": "96", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "19.25" },
    "97": { "carton": "97", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "19.30" },
    "98": { "carton": "98", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "4", "unit": "PCS" }], "weight": "19.25" },
    "99": { "carton": "99", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "3", "unit": "PCS" }], "weight": "16.00" },
    "100": { "carton": "100", "customer": "LOYD", "products": [{ "product": "STEERING GEAR BOX ASSY", "quantity": "5", "unit": "PCS" }], "weight": "24.00" },
    "101": { "carton": "101", "customer": "LOYD", "products": [{ "product": "CROSS MEMBER", "quantity": "3", "unit": "PCS" }], "weight": "26.75" },
    "102": { "carton": "102", "customer": "LOYD", "products": [{ "product": "CROSS MEMBER", "quantity": "3", "unit": "PCS" }], "weight": "22.40" },
    "103": { "carton": "103", "customer": "LOYD", "products": [{ "product": "SUSPENTION ARM ASSY", "quantity": "8", "unit": "PCS" }], "weight": "23.15" },
    "104": { "carton": "104", "customer": "LOYD", "products": [{ "product": "LAMP UNIT", "quantity": "8", "unit": "PCS" }], "weight": "18.40" },
    "105": { "carton": "105", "customer": "LOYD", "products": [{ "product": "RADIATOR ASSY", "quantity": "6", "unit": "PCS" }], "weight": "14.00" },
    "106": {
      "carton": "106",
      "customer": "LOYD",
      "products": [
        { "product": "IGNITION COIL ASSY", "quantity": "30", "unit": "PCS" },
        { "product": "SPARK PLUG", "quantity": "100", "unit": "PCS" },
        { "product": "BELT", "quantity": "30", "unit": "PCS" },
        { "product": "BRAKE CALIPER PIN", "quantity": "60", "unit": "PCS" }
      ],
      "weight": "23.55"
    },
    "107": {
      "carton": "107",
      "customer": "LOYD",
      "products": [
        { "product": "STRUT BUSH", "quantity": "16", "unit": "PCS" },
        { "product": "WHEEL CYLINDER", "quantity": "40", "unit": "PCS" },
        { "product": "TIE ROD END", "quantity": "12", "unit": "PCS" },
        { "product": "MOUNT BAR", "quantity": "30", "unit": "PCS" },
        { "product": "WHEEL BEARING", "quantity": "32", "unit": "PCS" },
        { "product": "AIR FILTER", "quantity": "15", "unit": "PCS" }
      ],
      "weight": "35.80"
    },
    "108": {
      "carton": "108",
      "customer": "LOYD",
      "products": [
        { "product": "SHOCK ABSORBER", "quantity": "19", "unit": "PCS" },
        { "product": "MUD FLAPS", "quantity": "6", "unit": "PCS" }
      ],
      "weight": "23.45"
    },
    "109": {
      "carton": "109",
      "customer": "LOYD",
      "products": [
        { "product": "WHEEL BEARING", "quantity": "30", "unit": "PCS" },
        { "product": "PIPE", "quantity": "10", "unit": "PCS" },
        { "product": "ENGINE MOUNTING", "quantity": "7", "unit": "PCS" },
        { "product": "SUSPENSION ARM", "quantity": "7", "unit": "PCS" }
      ],
      "weight": "60.00"
    },
    "110": {
      "carton": "110",
      "customer": "LOYD",
      "products": [
        { "product": "STRUT BUSH", "quantity": "18", "unit": "PCS" },
        { "product": "MIRROR", "quantity": "10", "unit": "PCS" },
        { "product": "THERMO", "quantity": "7", "unit": "PCS" },
        { "product": "STEERING LOCK ASSY", "quantity": "5", "unit": "PCS" },
        { "product": "AIR CLEANER ASSY", "quantity": "1", "unit": "PCS" },
        { "product": "STABILIZER BUSH KIT", "quantity": "29", "unit": "PCS" }
      ],
      "weight": "16.00"
    },
    "111": {
      "carton": "111",
      "customer": "LOYD",
      "products": [
        { "product": "GASKET", "quantity": "10", "unit": "PCS" },
        { "product": "HANDLE COMP", "quantity": "30", "unit": "PCS" },
        { "product": "WHEEL CYLINDER", "quantity": "30", "unit": "PCS" },
        { "product": "BELT", "quantity": "20", "unit": "PCS" },
        { "product": "THERMOSTAT COMP", "quantity": "5", "unit": "PCS" },
        { "product": "HOSE", "quantity": "20", "unit": "PCS" },
        { "product": "THERMO CASE", "quantity": "8", "unit": "PCS" },
        { "product": "SENSOR", "quantity": "4", "unit": "PCS" },
        { "product": "DOOR WEATHER STRIP", "quantity": "4", "unit": "PCS" },
        { "product": "CABLE", "quantity": "6", "unit": "PCS" },
        { "product": "PINION BOOT", "quantity": "20", "unit": "PCS" },
        { "product": "STRUT BUSH SET", "quantity": "16", "unit": "PCS" }
      ],
      "weight": "24.50"
    },
    "112": {
      "carton": "112",
      "customer": "LOYD",
      "products": [
        { "product": "WHEEL BOOT", "quantity": "9", "unit": "PCS" },
        { "product": "TIE ROD END", "quantity": "11", "unit": "PCS" },
        { "product": "HOSE", "quantity": "30", "unit": "PCS" },
        { "product": "PIPE", "quantity": "4", "unit": "PCS" },
        { "product": "ENGINE MOUNTING", "quantity": "4", "unit": "PCS" }
      ],
      "weight": "24.50"
    },
    "113": { "carton": "113", "customer": "LOYD", "products": [{ "product": "SHOCK ABSORBER", "quantity": "18", "unit": "PCS" }], "weight": "18.30" },
    "114": {
      "carton": "114",
      "customer": "LOYD",
      "products": [
        { "product": "INLET CAP", "quantity": "50", "unit": "PCS" },
        { "product": "CAM SHAFT", "quantity": "5", "unit": "PCS" },
        { "product": "REGULATOR ASSY", "quantity": "1", "unit": "PCS" },
        { "product": "THRMOSTER", "quantity": "14", "unit": "PCS" },
        { "product": "STRUT", "quantity": "6", "unit": "KIT" },
        { "product": "TIMING CHAIN", "quantity": "2", "unit": "PCS" },
        { "product": "STABILIZER BUSH KIT", "quantity": "30", "unit": "PCS" },
        { "product": "DOOR BALANCER", "quantity": "22", "unit": "PCS" },
        { "product": "INLET CAP", "quantity": "30", "unit": "PCS" },
        { "product": "FILTER CUP", "quantity": "8", "unit": "PCS" },
        { "product": "JOINT COMP BAR", "quantity": "10", "unit": "PCS" },
        { "product": "ENGINE MOUNTING", "quantity": "8", "unit": "PCS" }
      ],
      "weight": "50.00"
    },
    "115": {
      "carton": "115",
      "customer": "LOYD",
      "products": [
        { "product": "MIRROR ASSY", "quantity": "12", "unit": "PCS" },
        { "product": "WATER TANK", "quantity": "4", "unit": "PCS" },
        { "product": "TANK WASHER", "quantity": "5", "unit": "PCS" }
      ],
      "weight": "11.25"
    },
    "116": {
      "carton": "116",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "FLANGE YOKE", "quantity": "2", "unit": "PCS" },
        { "product": "UJ KIT", "quantity": "25", "unit": "PCS" }
      ],
      "weight": "21.35"
    },
    "117": {
      "carton": "117",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "BRAKE SHOE", "quantity": "3", "unit": "PCS" },
        { "product": "MASTER CYLINDER", "quantity": "2", "unit": "PCS" },
        { "product": "SHOE HOLD DOWN KIT", "quantity": "25", "unit": "PCS" },
        { "product": "BRAKE CYLINDER", "quantity": "6", "unit": "PCS" },
        { "product": "BELT", "quantity": "9", "unit": "KIT" },
        { "product": "WATER PUMP", "quantity": "3", "unit": "PCS" },
        { "product": "TIMING BELT", "quantity": "5", "unit": "PCS" }
      ],
      "weight": "32.45"
    },
    "118": {
      "carton": "118",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "CLUTCH BEARING", "quantity": "30", "unit": "PCS" },
        { "product": "CLUTCH SET", "quantity": "3", "unit": "PCS" },
        { "product": "ALTERNATOR ASSY", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "27.60"
    },
    "119": {
      "carton": "119",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "STEERING JOINT", "quantity": "20", "unit": "PCS" },
        { "product": "YOKE", "quantity": "14", "unit": "PCS" }
      ],
      "weight": "45.65"
    },
    "120": {
      "carton": "120",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "FLANGE YOKE", "quantity": "9", "unit": "PCS" },
        { "product": "STEERING ASSY", "quantity": "11", "unit": "PCS" }
      ],
      "weight": "31.75"
    },
    "121": {
      "carton": "121",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "STEERING ASSY", "quantity": "3", "unit": "PCS" },
        { "product": "TIE ROD END", "quantity": "14", "unit": "PCS" },
        { "product": "TIE ROD END", "quantity": "1", "unit": "BOX" },
        { "product": "STABILIZER BAR", "quantity": "4", "unit": "PCS" },
        { "product": "STABILIZER LINK BAR", "quantity": "5", "unit": "PCS" },
        { "product": "STABILZER MOUNT", "quantity": "6", "unit": "PCS" }
      ],
      "weight": "33.20"
    },
    "122": {
      "carton": "122",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "CLUTCH", "quantity": "5", "unit": "SET" },
        { "product": "METER HOLDER", "quantity": "6", "unit": "PCS" },
        { "product": "COUNTER", "quantity": "25", "unit": "PCS" }
      ],
      "weight": "24.15"
    },
    "123": { "carton": "123", "customer": "PATHINAYAKA MOTORS", "products": [{ "product": "DRIVE SHAFT", "quantity": "6", "unit": "PCS" }], "weight": "28.15" },
    "124": {
      "carton": "124",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "FLANGE YOKE", "quantity": "5", "unit": "PCS" },
        { "product": "AXLE SHAFT", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "26.45"
    },
    "125": {
      "carton": "125",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "DRIVE SHAFT", "quantity": "6", "unit": "PCS" },
        { "product": "LINK ASSY", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "30.20"
    },
    "126": { "carton": "126", "customer": "PATHINAYAKA MOTORS", "products": [{ "product": "BRAKE SHOE", "quantity": "20", "unit": "KIT" }], "weight": "24.60" },
    "127": {
      "carton": "127",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "BRAKE ASSY", "quantity": "2", "unit": "PCS" },
        { "product": "WHEEL CYLINDER", "quantity": "6", "unit": "PCS" },
        { "product": "MASTER CYLINDER", "quantity": "4", "unit": "PCS" },
        { "product": "SHOE KIT", "quantity": "8", "unit": "KIT" }
      ],
      "weight": "22.85"
    },
    "128": {
      "carton": "128",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "JOINT ASSEMBLY", "quantity": "10", "unit": "PCS" },
        { "product": "LOWER AC", "quantity": "1", "unit": "PCS" },
        { "product": "SLEEVE", "quantity": "10", "unit": "PCS" },
        { "product": "FLANGE", "quantity": "10", "unit": "PCS" }
      ],
      "weight": "37.60"
    },
    "129": { "carton": "129", "customer": "PATHINAYAKA MOTORS", "products": [{ "product": "WIPER BLADE", "quantity": "84", "unit": "PCS" }], "weight": "16.45" },
    "130": { "carton": "130", "customer": "PATHINAYAKA MOTORS", "products": [{ "product": "WIPER BLADE", "quantity": "60", "unit": "PCS" }], "weight": "16.30" },
    "131": { "carton": "131", "customer": "PATHINAYAKA MOTORS", "products": [{ "product": "WIPER BLADE", "quantity": "80", "unit": "PCS" }], "weight": "16.30" },
    "132": { "carton": "132", "customer": "PATHINAYAKA MOTORS", "products": [{ "product": "WIPER BLADE", "quantity": "82", "unit": "PCS" }], "weight": "15.60" },
    "133": {
      "carton": "133",
      "customer": "PATHINAYAKA MOTORS",
      "products": [
        { "product": "WHEEL CYLINDER", "quantity": "16", "unit": "PCS" },
        { "product": "STRUT", "quantity": "20", "unit": "PCS" },
        { "product": "MASTER CYLINDER", "quantity": "4", "unit": "PCS" },
        { "product": "BRAKE SHOE", "quantity": "2", "unit": "PCS" },
        { "product": "SHOE KIT", "quantity": "10", "unit": "PCS" },
        { "product": "SHOE KIT", "quantity": "5", "unit": "PCS" }
      ],
      "weight": "34.75"
    },
    "134": { "carton": "134", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "39.85" },
    "135": { "carton": "135", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "43.90" },
    "136": { "carton": "136", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "44.20" },
    "137": { "carton": "137", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "39.85" },
    "138": { "carton": "138", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "43.50" },
    "139": { "carton": "139", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "46.30" },
    "140": { "carton": "140", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "43.50" },
    "141": { "carton": "141", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "46.50" },
    "142": { "carton": "142", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "315", "unit": "PCS" }], "weight": "23.10" },
    "143": { "carton": "143", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "240", "unit": "PCS" }], "weight": "21.60" },
    "144": { "carton": "144", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "220", "unit": "PCS" }], "weight": "20.30" },
    "145": { "carton": "145", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "315", "unit": "PCS" }], "weight": "23.50" },
    "146": { "carton": "146", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "315", "unit": "PCS" }], "weight": "24.45" },
    "147": { "carton": "147", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "295", "unit": "PCS" }], "weight": "22.90" },
    "148": { "carton": "148", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "295", "unit": "PCS" }], "weight": "22.35" },
    "149": { "carton": "149", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "295", "unit": "PCS" }], "weight": "22.30" },
    "150": { "carton": "150", "customer": "NST", "products": [{ "product": "INSULATION TUBE", "quantity": "220", "unit": "PCS" }], "weight": "20.90" },
    "151": { "carton": "151", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "44.25" },
    "152": { "carton": "152", "customer": "HEMACHANDRA", "products": [{ "product": "DRIVE SHAFT ASSY", "quantity": "10", "unit": "PCS" }], "weight": "39.60" },
    "153": { "carton": "153", "customer": "HEMACHANDRA", "products": [{ "product": "AXLE JOINT", "quantity": "26", "unit": "PCS" }], "weight": "38.50" },
    "154": { "carton": "154", "customer": "HEMACHANDRA", "products": [{ "product": "AXLE JOINT", "quantity": "26", "unit": "PCS" }], "weight": "37.85" },
    "155": { "carton": "155", "customer": "HEMACHANDRA", "products": [{ "product": "AXLE JOINT", "quantity": "26", "unit": "PCS" }], "weight": "36.20" },
    "156": { "carton": "156", "customer": "HEMACHANDRA", "products": [{ "product": "AXLE JOINT", "quantity": "26", "unit": "PCS" }], "weight": "37.40" },
    "157": { "carton": "157", "customer": "HEMACHANDRA", "products": [{ "product": "AXLE JOINT", "quantity": "30", "unit": "PCS" }], "weight": "50.00" },
    "158": { "carton": "158", "customer": "HEMACHANDRA", "products": [{ "product": "AXLE JOINT", "quantity": "26", "unit": "PCS" }], "weight": "38.85" },
    "159": {
      "carton": "159",
      "customer": "HEMACHANDRA",
      "products": [
        { "product": "PISTON RING", "quantity": "44", "unit": "CARD" },
        { "product": "PISTON RING", "quantity": "38", "unit": "PCS" }
      ],
      "weight": "42.70"
    },
    "160": { "carton": "160", "customer": "DYNAMIC", "products": [{ "product": "JAR BASE", "quantity": "500", "unit": "PCS" }], "weight": "68.25" },
    "161": { "carton": "161", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "100", "unit": "PCS" }], "weight": "52.60" },
    "162": { "carton": "162", "customer": "DYNAMIC", "products": [{ "product": "CHATTNEY JAR", "quantity": "115", "unit": "PCS" }], "weight": "47.40" },
    "163": { "carton": "163", "customer": "DYNAMIC", "products": [{ "product": "CHATTNEY JAR", "quantity": "115", "unit": "PCS" }], "weight": "47.40" },
    "164": { "carton": "164", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "50", "unit": "PCS" }], "weight": "56.55" },
    "165": { "carton": "165", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "200", "unit": "PCS" }], "weight": "46.55" },
    "166": { "carton": "166", "customer": "NST", "products": [{ "product": "MIXI MOTOR", "quantity": "27", "unit": "PCS" }], "weight": "45.45" },
    "167": { "carton": "167", "customer": "NST", "products": [{ "product": "MIXI MOTOR", "quantity": "27", "unit": "PCS" }], "weight": "49.25" },
    "168": { "carton": "168", "customer": "NST", "products": [{ "product": "MIXI MOTOR", "quantity": "27", "unit": "PCS" }], "weight": "48.00" },
    "169": { "carton": "169", "customer": "NST", "products": [{ "product": "ARMATURE", "quantity": "60", "unit": "PCS" }], "weight": "32.55" },
    "170": { "carton": "170", "customer": "UDITHA", "products": [{ "product": "CHUTTNEY JAR", "quantity": "10", "unit": "PCS" }], "weight": "26.05" },
    "171": { "carton": "171", "customer": "UDITHA", "products": [{ "product": "CHUTTNEY JAR", "quantity": "10", "unit": "PCS" }], "weight": "25.85" },
    "172": { "carton": "172", "customer": "UDITHA", "products": [{ "product": "STRUT", "quantity": "8", "unit": "KIT" }], "weight": "30.60" },
    "173": { "carton": "173", "customer": "UDITHA", "products": [{ "product": "STRUT", "quantity": "8", "unit": "KIT" }], "weight": "41.15" },
    "174": { "carton": "174", "customer": "GLOBAL", "products": [{ "product": "HORN", "quantity": "160", "unit": "PCS" }], "weight": "41.85" },
    "175": { "carton": "175", "customer": "GLOBAL", "products": [{ "product": "HORN", "quantity": "160", "unit": "PCS" }], "weight": "35.25" },
    "176": { "carton": "176", "customer": "GLOBAL", "products": [{ "product": "HORN", "quantity": "160", "unit": "PCS" }], "weight": "40.45" },
    "177": { "carton": "177", "customer": "JAYATHU", "products": [{ "product": "STRUT", "quantity": "8", "unit": "KIT" }], "weight": "40.65" },
    "178": { "carton": "178", "customer": "JAYATHU", "products": [{ "product": "STRUT", "quantity": "8", "unit": "KIT" }], "weight": "37.10" },
    "179": { "carton": "179", "customer": "JAYATHU", "products": [{ "product": "STRUT", "quantity": "6", "unit": "KIT" }], "weight": "30.80" },
    "180": {
      "carton": "180",
      "customer": "JAYATHU",
      "products": [
        { "product": "STRUT", "quantity": "8", "unit": "KIT" },
        { "product": "GASKET", "quantity": "10", "unit": "PCS" },
        { "product": "CRANK SHAFT", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "50.00"
    },
    "181": {
      "carton": "181",
      "customer": "WIJAMINI",
      "products": [
        { "product": "DIAPHRAGM", "quantity": "50", "unit": "PCS" },
        { "product": "BOLT", "quantity": "10", "unit": "PCS" },
        { "product": "MINOR REPAIR KIT", "quantity": "20", "unit": "KIT" },
        { "product": "BUSH", "quantity": "1", "unit": "PKT" },
        { "product": "DIAPHRAGM", "quantity": "4", "unit": "PCS" },
        { "product": "VALVE", "quantity": "8", "unit": "KIT" },
        { "product": "FUEL PUMP", "quantity": "5", "unit": "PCS" },
        { "product": "BRAKE CHAMBER ASSEMBLY", "quantity": "3", "unit": "PCS" },
        { "product": "AIR CYLINDER", "quantity": "4", "unit": "PCS" }
      ],
      "weight": "34.25"
    },
    "182": { "carton": "182", "customer": "WIJAMINI", "products": [{ "product": "SUSPENSION", "quantity": "10", "unit": "PCS" }], "weight": "37.70" },
    "183": {
      "carton": "183",
      "customer": "WIJAMINI",
      "products": [
        { "product": "SUSPENSION", "quantity": "2", "unit": "PCS" },
        { "product": "PISTON PLATE", "quantity": "3", "unit": "PCS" },
        { "product": "RETAINING PLATE", "quantity": "7", "unit": "PCS" },
        { "product": "STEERING CROSS ASSY", "quantity": "4", "unit": "PCS" },
        { "product": "NUT", "quantity": "1", "unit": "PKT" }
      ],
      "weight": "30.15"
    },
    "184": { "carton": "184", "customer": "WIJAMINI", "products": [{ "product": "BOOSTER", "quantity": "12", "unit": "PCS" }], "weight": "38.00" },
    "185": { "carton": "185", "customer": "WIJAMINI", "products": [{ "product": "SPRING BLOWER", "quantity": "20", "unit": "PCS" }], "weight": "34.90" },
    "186": {
      "carton": "186",
      "customer": "WIJAMINI",
      "products": [
        { "product": "SPRING BLOWER", "quantity": "9", "unit": "PCS" },
        { "product": "COVER", "quantity": "100", "unit": "PCS" },
        { "product": "EMPTY BOX", "quantity": "100", "unit": "PCS" }
      ],
      "weight": "32.05"
    },
    "187": {
      "carton": "187",
      "customer": "JUMAIL",
      "products": [
        { "product": "FORK OIL SEAL", "quantity": "1150", "unit": "PCS" },
        { "product": "WIRE CLIP", "quantity": "2", "unit": "BOX" },
        { "product": "STEERING KIT", "quantity": "100", "unit": "KIT" },
        { "product": "PLUG CAP", "quantity": "200", "unit": "PCS" },
        { "product": "BRAKE ROD", "quantity": "50", "unit": "PCS" },
        { "product": "ROLLER SET", "quantity": "30", "unit": "PCS" }
      ],
      "weight": "52.60"
    },
    "188": { "carton": "188", "customer": "HASHAN LANKA AUTO PARTS", "products": [{ "product": "FAN BLADE", "quantity": "80", "unit": "PCS" }], "weight": "15.10" },
    "189": {
      "carton": "189",
      "customer": "DILSHAN WEERASIGHE",
      "products": [
        { "product": "GASKET", "quantity": "2", "unit": "SET" },
        { "product": "PIPE", "quantity": "6", "unit": "PCS" },
        { "product": "PISTON RING", "quantity": "7", "unit": "BOX" },
        { "product": "BEARING SHAFT", "quantity": "6", "unit": "PCS" },
        { "product": "BUSH", "quantity": "7", "unit": "PCS" },
        { "product": "OIL SEAL", "quantity": "3", "unit": "PCS" },
        { "product": "SPEEDO METER", "quantity": "1", "unit": "PCS" }
      ],
      "weight": "25.85"
    },
    "190": {
      "carton": "190",
      "customer": "DILSHAN WEERASIGHE",
      "products": [
        { "product": "RING", "quantity": "1", "unit": "SET" },
        { "product": "SPRING", "quantity": "4", "unit": "PCS" },
        { "product": "GASKET", "quantity": "1", "unit": "SET" },
        { "product": "SHOCK ABSORBER", "quantity": "2", "unit": "PCS" },
        { "product": "WIPER BLADE ASSY", "quantity": "4", "unit": "PCS" },
        { "product": "COOLANT TANK", "quantity": "1", "unit": "PCS" }
      ],
      "weight": "56.70"
    },
    "191": { "carton": "191", "customer": "NAZAR", "products": [{ "product": "JAR BASE", "quantity": "600", "unit": "PCS" }], "weight": "59.85" },
    "192": {
      "carton": "192",
      "customer": "AKMAL",
      "products": [
        { "product": "HANDLE BAR", "quantity": "6", "unit": "PCS" },
        { "product": "ENGINE COVER", "quantity": "8", "unit": "PCS" },
        { "product": "RADIATOR SCORPIO", "quantity": "8", "unit": "PCS" },
        { "product": "MUD GUARD", "quantity": "10", "unit": "PCS" },
        { "product": "TIMING CHAIN", "quantity": "160", "unit": "PCS" }
      ],
      "weight": "21.90"
    },
    "193": {
      "carton": "193",
      "customer": "MURSHIL",
      "products": [
        { "product": "TIMING CHAIN", "quantity": "160", "unit": "PCS" },
        { "product": "COUPLING RUBBER", "quantity": "100", "unit": "PCS" },
        { "product": "PLUG CAP", "quantity": "250", "unit": "PCS" }
      ],
      "weight": "62.65"
    },
    "194": {
      "carton": "194",
      "customer": "MURSHIL",
      "products": [
        { "product": "OIL SEAL", "quantity": "500", "unit": "PCS" },
        { "product": "AIR FILTER", "quantity": "200", "unit": "PCS" },
        { "product": "GASKET", "quantity": "300", "unit": "PCS" }
      ],
      "weight": "37.80"
    },
    "195": {
      "carton": "195",
      "customer": "MURSHIL",
      "products": [
        { "product": "ENGINE VALVE SEAL", "quantity": "500", "unit": "PCS" },
        { "product": "OIL SEAL", "quantity": "480", "unit": "PCS" },
        { "product": "COUPLING RUBBER", "quantity": "20", "unit": "PCS" }
      ],
      "weight": "41.40"
    },
    "196": {
      "carton": "196",
      "customer": "MURSHIL",
      "products": [
        { "product": "CLUTCH PLATE", "quantity": "100", "unit": "PCS" },
        { "product": "PLUG CAP", "quantity": "250", "unit": "PCS" },
        { "product": "SPEEDO WORM METER", "quantity": "400", "unit": "PCS" }
      ],
      "weight": "26.60"
    },
    "197": { "carton": "197", "customer": "MURSHIL", "products": [{ "product": "SHOCK DAMPER", "quantity": "300", "unit": "PCS" }], "weight": "50.20" },
    "198": {
      "carton": "198",
      "customer": "MURSHIL",
      "products": [
        { "product": "COUPLING RUBBER", "quantity": "80", "unit": "PCS" },
        { "product": "COVER", "quantity": "30", "unit": "PCS" },
        { "product": "OIL SEAL", "quantity": "1500", "unit": "PCS" }
      ],
      "weight": "57.50"
    },
    "199": {
      "carton": "199",
      "customer": "MURSHIL",
      "products": [
        { "product": "GASKET", "quantity": "300", "unit": "PCS" },
        { "product": "PLUG CAP", "quantity": "350", "unit": "PCS" }
      ],
      "weight": "30.65"
    },
    "200": { "carton": "200", "customer": "MURSHIL", "products": [{ "product": "AIR FILTER", "quantity": "500", "unit": "PCS" }], "weight": "14.25" },
    "201": { "carton": "201", "customer": "DEELAKA", "products": [{ "product": "REAR SPRING ASSAMBLY", "quantity": "1", "unit": "PCS" }], "weight": "11.60" },
    "202": {
      "carton": "202",
      "customer": "DYNAMIC",
      "products": [
        { "product": "WASHER", "quantity": "1300", "unit": "PCS" },
        { "product": "WIRE CLIP", "quantity": "200", "unit": "PKT" },
        { "product": "KNOB", "quantity": "3000", "unit": "PCS" }
      ],
      "weight": "34.15"
    },
    "203": { "carton": "203", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "18", "unit": "PCS" }], "weight": "14.90" },
    "204": { "carton": "204", "customer": "DYNAMIC", "products": [{ "product": "JAR SET", "quantity": "27", "unit": "PCS" }], "weight": "17.75" },
    "205": { "carton": "205", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "100", "unit": "PCS" }], "weight": "17.30" },
    "206": { "carton": "206", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "100", "unit": "PCS" }], "weight": "16.90" },
    "207": { "carton": "207", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "100", "unit": "PCS" }], "weight": "17.00" },
    "208": { "carton": "208", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "100", "unit": "PCS" }], "weight": "17.90" },
    "209": { "carton": "209", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "100", "unit": "PCS" }], "weight": "17.50" },
    "210": { "carton": "210", "customer": "DYNAMIC", "products": [{ "product": "FAN BLADE", "quantity": "100", "unit": "PCS" }], "weight": "17.20" },
    "211": { "carton": "211", "customer": "NIROSHAN", "products": [{ "product": "READING BOOKS", "quantity": "77", "unit": "PCS" }], "weight": "18.00" },
    "212": { "carton": "212", "customer": "THE GOLDEN GALLERY", "products": [{ "product": "BANGLES", "quantity": "600", "unit": "PCS" }], "weight": "35.55" },
    "213": { "carton": "213", "customer": "THE GOLDEN GALLERY", "products": [{ "product": "BANGLES", "quantity": "600", "unit": "PCS" }], "weight": "28.70" },
    "214": { "carton": "214", "customer": "AKMAL", "products": [{ "product": "HANDLE BOX", "quantity": "5", "unit": "SET" }], "weight": "8.80" },
    "215": {
      "carton": "215",
      "customer": "AKMAL",
      "products": [
        { "product": "HANDLE PLATE ASSY", "quantity": "20", "unit": "KIT" },
        { "product": "MUDGUARD", "quantity": "6", "unit": "PCS" },
        { "product": "SIGNAL LAMP", "quantity": "20", "unit": "PCS" },
        { "product": "GRIP", "quantity": "10", "unit": "SET" }
      ],
      "weight": "0.00"
    },
    "216": { "carton": "216", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "28.60" },
    "217": { "carton": "217", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "28.65" },
    "218": { "carton": "218", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "28.60" },
    "219": { "carton": "219", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "28.50" },
    "220": { "carton": "220", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "28.55" },
    "221": { "carton": "221", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "32.05" },
    "222": { "carton": "222", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "31.60" },
    "223": { "carton": "223", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "30.55" },
    "224": { "carton": "224", "customer": "HEMACHANDRA", "products": [{ "product": "CLUTCH", "quantity": "10", "unit": "PCS" }], "weight": "28.75" },
    "225": {
      "carton": "225",
      "customer": "HEMACHANDRA",
      "products": [
        { "product": "CLUTCH", "quantity": "5", "unit": "PCS" },
        { "product": "SUSPENSION ARM ASSY", "quantity": "10", "unit": "PCS" }
      ],
      "weight": "27.20"
    },
    "226": { "carton": "226", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPENSION ARM ASSY", "quantity": "20", "unit": "PCS" }], "weight": "25.30" },
    "227": { "carton": "227", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPENSION ARM ASSY", "quantity": "20", "unit": "PCS" }], "weight": "25.35" },
    "228": { "carton": "228", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPENSION ARM ASSY", "quantity": "20", "unit": "PCS" }], "weight": "25.45" },
    "229": { "carton": "229", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPENSION ARM ASSY", "quantity": "20", "unit": "PCS" }], "weight": "25.40" },
    "230": { "carton": "230", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPENSION ARM ASSY", "quantity": "20", "unit": "PCS" }], "weight": "25.40" },
    "231": { "carton": "231", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPENSION ARM ASSY", "quantity": "20", "unit": "PCS" }], "weight": "25.35" },
    "232": { "carton": "232", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPANSOR ARM ASSY", "quantity": "22", "unit": "PCS" }], "weight": "25.40" },
    "233": { "carton": "233", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPANSOR ARM ASSY", "quantity": "24", "unit": "PCS" }], "weight": "29.65" },
    "234": { "carton": "234", "customer": "HEMACHANDRA", "products": [{ "product": "SUSPANSOR ARM ASSY", "quantity": "24", "unit": "PCS" }], "weight": "29.45" },
    "235": { "carton": "235", "customer": "HEMACHANDRA", "products": [{ "product": "STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "25.45" },
    "236": { "carton": "236", "customer": "HEMACHANDRA", "products": [{ "product": "STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "25.45" },
    "237": { "carton": "237", "customer": "HEMACHANDRA", "products": [{ "product": "STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "25.45" },
    "238": { "carton": "238", "customer": "HEMACHANDRA", "products": [{ "product": "STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "25.45" },
    "239": { "carton": "239", "customer": "HEMACHANDRA", "products": [{ "product": "STRUT ASSY", "quantity": "8", "unit": "PCS" }], "weight": "25.35" },
    "240": { "carton": "240", "customer": "HEMACHANDRA", "products": [{ "product": "STEERING GEAR ASSY", "quantity": "6", "unit": "PCS" }], "weight": "31.20" },
    "241": { "carton": "241", "customer": "HEMACHANDRA", "products": [{ "product": "STEERING GEAR ASSY", "quantity": "6", "unit": "PCS" }], "weight": "31.10" },
    "242": { "carton": "242", "customer": "HEMACHANDRA", "products": [{ "product": "STEERING GEAR ASSY", "quantity": "3", "unit": "PCS" }], "weight": "15.60" },
    "243": { "carton": "243", "customer": "HEMACHANDRA", "products": [{ "product": "TIE ROD END", "quantity": "75", "unit": "PCS" }], "weight": "30.60" },
    "244": { "carton": "244", "customer": "HEMACHANDRA", "products": [{ "product": "ENGINE MOUNTING", "quantity": "16", "unit": "PCS" }], "weight": "30.05" },
    "245": { "carton": "245", "customer": "HEMACHANDRA", "products": [{ "product": "ENGINE MOUNTING", "quantity": "24", "unit": "PCS" }], "weight": "28.40" },
    "246": { "carton": "246", "customer": "HEMACHANDRA", "products": [{ "product": "ENGINE MOUNTING", "quantity": "25", "unit": "PCS" }], "weight": "35.25" },
    "247": {
      "carton": "247",
      "customer": "HEMACHANDRA",
      "products": [
        { "product": "HOSE", "quantity": "40", "unit": "PCS" },
        { "product": "OIL FILTER", "quantity": "10", "unit": "PCS" },
        { "product": "OIL SEAL", "quantity": "30", "unit": "PCS" },
        { "product": "KNOB", "quantity": "100", "unit": "PCS" },
        { "product": "GASKET", "quantity": "90", "unit": "PCS" },
        { "product": "SPARK PLUG", "quantity": "20", "unit": "PCS" },
        { "product": "BRAKE MASTER CYLINDER", "quantity": "12", "unit": "PCS" },
        { "product": "PLUG", "quantity": "10", "unit": "PCS" },
        { "product": "TIMING BELT", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "20.10"
    },
    "248": {
      "carton": "248",
      "customer": "HEMACHANDRA",
      "products": [
        { "product": "BELT", "quantity": "20", "unit": "PCS" },
        { "product": "VENT LOWER", "quantity": "2", "unit": "PCS" },
        { "product": "GLASS CHANEL", "quantity": "5", "unit": "PCS" },
        { "product": "CAP", "quantity": "140", "unit": "PCS" },
        { "product": "REGULATOR", "quantity": "7", "unit": "PCS" }
      ],
      "weight": "20.80"
    },
    "249": {
      "carton": "249",
      "customer": "HEMACHANDRA",
      "products": [
        { "product": "BELT", "quantity": "50", "unit": "PCS" },
        { "product": "SWITCH", "quantity": "8", "unit": "PCS" },
        { "product": "CAP COMP INLET", "quantity": "10", "unit": "PCS" },
        { "product": "INLET CAP", "quantity": "50", "unit": "PCS" },
        { "product": "RACK BOOT", "quantity": "50", "unit": "PCS" },
        { "product": "OIL FILTER", "quantity": "70", "unit": "PCS" }
      ],
      "weight": "20.45"
    },
    "250": { "carton": "250", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "6", "unit": "PCS" }], "weight": "32.00" },
    "251": { "carton": "251", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "6", "unit": "PCS" }], "weight": "32.00" },
    "252": { "carton": "252", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "6", "unit": "PCS" }], "weight": "32.00" },
    "253": { "carton": "253", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "6", "unit": "PCS" }], "weight": "32.00" },
    "254": { "carton": "254", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "6", "unit": "PCS" }], "weight": "32.00" },
    "255": { "carton": "255", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "6", "unit": "PCS" }], "weight": "32.00" },
    "256": { "carton": "256", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "6", "unit": "PCS" }], "weight": "32.00" },
    "257": { "carton": "257", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "4", "unit": "PCS" }], "weight": "21.30" },
    "258": { "carton": "258", "customer": "HEMACHANDRA", "products": [{ "product": "CROSS MEMBER", "quantity": "4", "unit": "PCS" }], "weight": "21.35" },
    "259": { "carton": "259", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.15" },
    "260": { "carton": "260", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.15" },
    "261": { "carton": "261", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.15" },
    "262": { "carton": "262", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.20" },
    "263": { "carton": "263", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.25" },
    "264": { "carton": "264", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.15" },
    "265": { "carton": "265", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.20" },
    "266": { "carton": "266", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.15" },
    "267": { "carton": "267", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.10" },
    "268": { "carton": "268", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.15" },
    "269": { "carton": "269", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.20" },
    "270": { "carton": "270", "customer": "RIZVI", "products": [{ "product": "DRIVER SEAT KIT", "quantity": "10", "unit": "PCS" }], "weight": "13.15" },
    "271": { "carton": "271", "customer": "RIZVI", "products": [{ "product": "CLAMP", "quantity": "60", "unit": "BOX" }], "weight": "36.00" },
    "272": {
      "carton": "272",
      "customer": "RIZVI",
      "products": [
        { "product": "VALVE SET", "quantity": "273", "unit": "SET" },
        { "product": "VALVE ASSY", "quantity": "50", "unit": "PCS" }
      ],
      "weight": "22.10"
    },
    "273": { "carton": "273", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "134", "unit": "PCS" }], "weight": "47.00" },
    "274": { "carton": "274", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "101", "unit": "PCS" }], "weight": "48.15" },
    "275": { "carton": "275", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "116", "unit": "PCS" }], "weight": "52.55" },
    "276": { "carton": "276", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "155", "unit": "PCS" }], "weight": "52.10" },
    "277": { "carton": "277", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "90", "unit": "PCS" }], "weight": "36.45" },
    "278": { "carton": "278", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "139", "unit": "PCS" }], "weight": "50.75" },
    "279": { "carton": "279", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "99", "unit": "PCS" }], "weight": "41.60" },
    "280": { "carton": "280", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "114", "unit": "PCS" }], "weight": "44.20" },
    "281": { "carton": "281", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "147", "unit": "PCS" }], "weight": "51.00" },
    "282": { "carton": "282", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "144", "unit": "PCS" }], "weight": "50.70" },
    "283": { "carton": "283", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "119", "unit": "PCS" }], "weight": "51.50" },
    "284": { "carton": "284", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "125", "unit": "PCS" }], "weight": "41.10" },
    "285": { "carton": "285", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "114", "unit": "PCS" }], "weight": "50.00" },
    "286": { "carton": "286", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "90", "unit": "PCS" }], "weight": "35.60" },
    "287": { "carton": "287", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "98", "unit": "PCS" }], "weight": "50.95" },
    "288": { "carton": "288", "customer": "SUNERA", "products": [{ "product": "READING BOOKS", "quantity": "117", "unit": "PCS" }], "weight": "49.15" },
    "289": {
      "carton": "289",
      "customer": "NILUPULI",
      "products": [
        { "product": "BRAKE SHOE", "quantity": "26", "unit": "PCS" },
        { "product": "CLUTCH CYLINDER", "quantity": "70", "unit": "KIT" },
        { "product": "MINOR KIT", "quantity": "70", "unit": "PCS" }
      ],
      "weight": "26.70"
    },
    "290": {
      "carton": "290",
      "customer": "NILUPULI",
      "products": [
        { "product": "CLUTCH CYLINDER", "quantity": "100", "unit": "PCS" },
        { "product": "CYLINDER ASSY", "quantity": "90", "unit": "KIT" },
        { "product": "CYLINDER MASTER KIT", "quantity": "8", "unit": "PCS" }
      ],
      "weight": "18.40"
    },
    "291": {
      "carton": "291",
      "customer": "NILUPULI",
      "products": [
        { "product": "BRAKE SHOE", "quantity": "24", "unit": "PCS" },
        { "product": "WHEEL CYLINDER", "quantity": "100", "unit": "PCS" }
      ],
      "weight": "36.00"
    },
    "292": { "carton": "292", "customer": "THE GOLDEN GALLERY", "products": [{ "product": "BANGLES", "quantity": "600", "unit": "PCS" }], "weight": "23.00" },
    "293": { "carton": "293", "customer": "THE GOLDEN GALLERY", "products": [{ "product": "BANGLES", "quantity": "600", "unit": "PCS" }], "weight": "38.90" },
    "294": { "carton": "294", "customer": "THE GOLDEN GALLERY", "products": [{ "product": "BANGLES", "quantity": "600", "unit": "PCS" }], "weight": "38.90" },
    "295": {
      "carton": "295",
      "customer": "JUVANANTH",
      "products": [
        { "product": "SHAFT ASSY", "quantity": "2", "unit": "PCS" },
        { "product": "SLEEVE", "quantity": "2", "unit": "PCS" },
        { "product": "SLEEVE", "quantity": "12", "unit": "PCS" },
        { "product": "GASKET", "quantity": "10", "unit": "PCS" },
        { "product": "SEAL", "quantity": "12", "unit": "PCS" }
      ],
      "weight": "19.55"
    },
    "296": { "carton": "296", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSY", "quantity": "4", "unit": "PCS" }], "weight": "43.55" },
    "297": { "carton": "297", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSEMBLY", "quantity": "4", "unit": "PCS" }], "weight": "43.10" },
    "298": { "carton": "298", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSEMBLY", "quantity": "4", "unit": "PCS" }], "weight": "43.60" },
    "299": { "carton": "299", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSEMBLY", "quantity": "4", "unit": "PCS" }], "weight": "43.30" },
    "300": { "carton": "300", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSEMBLY", "quantity": "4", "unit": "PCS" }], "weight": "43.45" },
    "301": { "carton": "301", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSEMBLY", "quantity": "4", "unit": "PCS" }], "weight": "43.45" },
    "302": { "carton": "302", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSEMBLY", "quantity": "4", "unit": "PCS" }], "weight": "52.20" },
    "303": { "carton": "303", "customer": "DEELAKA", "products": [{ "product": "STEERING GEAR ASSEMBLY", "quantity": "4", "unit": "PCS" }], "weight": "40.90" },
    "304": { "carton": "304", "customer": "DEELAKA", "products": [{ "product": "YOKE TEETH SUB ASSY", "quantity": "10", "unit": "PKT" }], "weight": "27.90" },
    "305": { "carton": "305", "customer": "DEELAKA", "products": [{ "product": "FRONT FENDER LINING", "quantity": "50", "unit": "PCS" }], "weight": "37.50" },
    "306": { "carton": "306", "customer": "DEELAKA", "products": [{ "product": "FRONT FENDER LINING", "quantity": "50", "unit": "PCS" }], "weight": "36.50" },
    "307": { "carton": "307", "customer": "DEELAKA", "products": [{ "product": "FRONT FENDER LINING", "quantity": "50", "unit": "PCS" }], "weight": "36.60" },
    "308": { "carton": "308", "customer": "DEELAKA", "products": [{ "product": "FRONT FENDER LINING", "quantity": "50", "unit": "PCS" }], "weight": "38.00" },
    "309": {
      "carton": "309",
      "customer": "DEELAKA",
      "products": [
        { "product": "PATTI", "quantity": "25", "unit": "PCS" },
        { "product": "EMPTY BOX", "quantity": "22", "unit": "PCS" }
      ],
      "weight": "41.70"
    },
    "310": { "carton": "310", "customer": "RIZVI", "products": [{ "product": "BEARING", "quantity": "570", "unit": "PCS" }], "weight": "39.25" },
    "311": { "carton": "311", "customer": "RIZVI", "products": [{ "product": "BEARING", "quantity": "570", "unit": "PCS" }], "weight": "39.30" },
    "312": { "carton": "312", "customer": "RIZVI", "products": [{ "product": "BEARING", "quantity": "570", "unit": "PCS" }], "weight": "39.30" },
    "313": { "carton": "313", "customer": "RIZVI", "products": [{ "product": "BEARING", "quantity": "570", "unit": "PCS" }], "weight": "39.30" },
    "314": { "carton": "314", "customer": "RIZVI", "products": [{ "product": "BEARING", "quantity": "285", "unit": "PCS" }], "weight": "19.55" },
    "315": {
      "carton": "315",
      "customer": "RISHARD",
      "products": [
        { "product": "FANCY EARINGS", "quantity": "31", "unit": "BOX" },
        { "product": "RING", "quantity": "816", "unit": "PCS" }
      ],
      "weight": "35.35"
    },
    "316": { "carton": "316", "customer": "RISHARD", "products": [{ "product": "FANCY RING", "quantity": "540", "unit": "CARD" }], "weight": "30.60" },
    "317": { "carton": "317", "customer": "RISHARD", "products": [{ "product": "FANCY EARINGS", "quantity": "80", "unit": "PKT" }], "weight": "0.00" },
    "318": { "carton": "318", "customer": "NIROSHAN", "products": [{ "product": "FUEL INJECTOR", "quantity": "4", "unit": "PCS" }], "weight": "28.10" },
    "319": { "carton": "319", "customer": "NIROSHAN", "products": [{ "product": "FUEL PUMP MOTOR", "quantity": "56", "unit": "PCS" }], "weight": "28.55" },
    "320": { "carton": "320", "customer": "NIROSHAN", "products": [{ "product": "INJECTOR PUMP", "quantity": "4", "unit": "PCS" }], "weight": "28.55" },
    "321": { "carton": "321", "customer": "NIROSHAN", "products": [{ "product": "INJECTOR PUMP", "quantity": "4", "unit": "PCS" }], "weight": "28.30" },
    "322": { "carton": "322", "customer": "NIROSHAN", "products": [{ "product": "FUEL PUMP MOTOR", "quantity": "56", "unit": "PCS" }], "weight": "33.50" },
    "323": {
      "carton": "323",
      "customer": "UDITHA",
      "products": [
        { "product": "COMBINATION SWITCH", "quantity": "2", "unit": "PCS" },
        { "product": "SENSOR", "quantity": "50", "unit": "PCS" },
        { "product": "RADIATOR TANK", "quantity": "3", "unit": "PCS" },
        { "product": "IDLER PULLY", "quantity": "50", "unit": "PCS" }
      ],
      "weight": "23.10"
    },
    "324": {
      "carton": "324",
      "customer": "UDITHA",
      "products": [
        { "product": "HUB CAP", "quantity": "250", "unit": "PCS" },
        { "product": "LOWER BALL JOINT", "quantity": "15", "unit": "PCS" },
        { "product": "BEARING", "quantity": "50", "unit": "PCS" }
      ],
      "weight": "26.85"
    },
    "325": { "carton": "325", "customer": "UDITHA", "products": [{ "product": "WHEEL CYLINDER ASSY", "quantity": "81", "unit": "PCS" }], "weight": "22.00" },
    "326": {
      "carton": "326",
      "customer": "UDITHA",
      "products": [
        { "product": "BUSH HOLDER", "quantity": "1", "unit": "PCS" },
        { "product": "STEERING ASSY", "quantity": "10", "unit": "PCS" }
      ],
      "weight": "26.10"
    },
    "327": { "carton": "327", "customer": "UDITHA", "products": [{ "product": "STEERING ASSY", "quantity": "1", "unit": "PCS" }], "weight": "24.20" },
    "328": { "carton": "328", "customer": "UDITHA", "products": [{ "product": "ENGINE MOUNTING", "quantity": "40", "unit": "PCS" }], "weight": "28.60" },
    "329": { "carton": "329", "customer": "UDITHA", "products": [{ "product": "STRUT DAMPER", "quantity": "4", "unit": "KIT" }], "weight": "28.30" },
    "330": {
      "carton": "330",
      "customer": "JAYATHU",
      "products": [
        { "product": "SHOCK ABSORBER", "quantity": "8", "unit": "PCS" },
        { "product": "STRUT DAMPER", "quantity": "6", "unit": "PCS" }
      ],
      "weight": "60.00"
    },
    "331": { "carton": "331", "customer": "JAYATHU", "products": [{ "product": "SIDE MIRROR", "quantity": "20", "unit": "PCS" }], "weight": "29.30" },
    "332": { "carton": "332", "customer": "JAYATHU", "products": [{ "product": "OUTER GARNISH", "quantity": "40", "unit": "PCS" }], "weight": "24.70" },
    "333": {
      "carton": "333",
      "customer": "JAYATHU",
      "products": [
        { "product": "WIPER LINK", "quantity": "5", "unit": "PCS" },
        { "product": "OUTER GARNISH", "quantity": "25", "unit": "PCS" }
      ],
      "weight": "17.50"
    },
    "334": { "carton": "334", "customer": "JAYATHU", "products": [{ "product": "AXLE DRIVE SHAFT ASSY", "quantity": "6", "unit": "PCS" }], "weight": "27.20" },
    "335": {
      "carton": "335",
      "customer": "JAYATHU",
      "products": [
        { "product": "RADIATOR PIPE", "quantity": "7", "unit": "PCS" },
        { "product": "COMBINATION WIRE", "quantity": "10", "unit": "PCS" }
      ],
      "weight": "12.30"
    },
    "336": {
      "carton": "336",
      "customer": "JAYATHU",
      "products": [
        { "product": "AXLE DRIVE SHAFT ASSY", "quantity": "5", "unit": "PCS" },
        { "product": "AXLE JOINT ASSEMBLY", "quantity": "10", "unit": "PCS" }
      ],
      "weight": "37.60"
    },
    "337": {
      "carton": "337",
      "customer": "JAYATHU",
      "products": [
        { "product": "SIDE MIRROR", "quantity": "17", "unit": "PCS" },
        { "product": "STEERING RACK END", "quantity": "40", "unit": "PCS" },
        { "product": "SHAFT", "quantity": "10", "unit": "PCS" },
        { "product": "ANTENNA", "quantity": "6", "unit": "PCS" },
        { "product": "SLIDING COMP", "quantity": "30", "unit": "PCS" }
      ],
      "weight": "13.55"
    },
    "338": {
      "carton": "338",
      "customer": "JAYATHU",
      "products": [
        { "product": "GEAR LEVER", "quantity": "81", "unit": "PCS" },
        { "product": "WHEEL CYLINDER", "quantity": "40", "unit": "KIT" },
        { "product": "WIPER MOTOR", "quantity": "5", "unit": "PCS" }
      ],
      "weight": "200.80"
    },
    "339": { "carton": "339", "customer": "JAYATHU", "products": [{ "product": "OUTER GARNISH", "quantity": "40", "unit": "SET" }], "weight": "33.40" },
    "340": { "carton": "340", "customer": "JAYATHU", "products": [{ "product": "OUTER GARNISH", "quantity": "40", "unit": "SET" }], "weight": "29.45" },
    "341": {
      "carton": "341",
      "customer": "JAYATHU",
      "products": [
        { "product": "SHOCK ABSORBER", "quantity": "20", "unit": "PCS" },
        { "product": "DICKEY SHOCKER", "quantity": "70", "unit": "PCS" }
      ],
      "weight": "33.30"
    },
    "342": { "carton": "342", "customer": "JAYATHU", "products": [{ "product": "OUTER GARNISH", "quantity": "40", "unit": "SET" }], "weight": "25.50" },
    "343": {
      "carton": "343",
      "customer": "WIJAMINI",
      "products": [
        { "product": "CYLINDER KIT", "quantity": "3", "unit": "KIT" },
        { "product": "CABLE ASSY", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "30.25"
    },
    "344": { "carton": "344", "customer": "WIJAMINI", "products": [{ "product": "WATER PUMP", "quantity": "4", "unit": "PCS" }], "weight": "20.30" },
    "345": {
      "carton": "345",
      "customer": "WIJAMINI",
      "products": [
        { "product": "MASTER CYLINDER", "quantity": "10", "unit": "PCS" },
        { "product": "FILTER HEAD", "quantity": "10", "unit": "PCS" },
        { "product": "WIPER BLADE", "quantity": "20", "unit": "PCS" }
      ],
      "weight": "25.30"
    },
    "346": {
      "carton": "346",
      "customer": "WIJAMINI",
      "products": [
        { "product": "WIPER MOTOR", "quantity": "2", "unit": "PCS" },
        { "product": "CLUTCH DRIVE", "quantity": "6", "unit": "PCS" },
        { "product": "ARMATURE", "quantity": "4", "unit": "PCS" },
        { "product": "DISTRIBUTOR TUBE", "quantity": "2", "unit": "PCS" },
        { "product": "GASKET", "quantity": "10", "unit": "PCS" },
        { "product": "CABLE", "quantity": "1", "unit": "PCS" },
        { "product": "WATER PUMP", "quantity": "5", "unit": "PCS" },
        { "product": "SYNCHRO COVER", "quantity": "18", "unit": "PCS" },
        { "product": "GREASING HUB", "quantity": "20", "unit": "PCS" },
        { "product": "OIL SEAL", "quantity": "5", "unit": "PCS" },
        { "product": "CLUTCH RELEASE", "quantity": "4", "unit": "PCS" },
        { "product": "OIL FILTER", "quantity": "24", "unit": "PCS" }
      ],
      "weight": "38.25"
    },
    "347": {
      "carton": "347",
      "customer": "WIJAMINI",
      "products": [
        { "product": "CYLINDER LINER", "quantity": "3", "unit": "PCS" },
        { "product": "WHEEL CYLINDER", "quantity": "24", "unit": "PCS" }
      ],
      "weight": "30.65"
    },
    "348": { "carton": "348", "customer": "WIJAMINI", "products": [{ "product": "SPIDER", "quantity": "4", "unit": "PCS" }], "weight": "33.50" },
    "349": { "carton": "349", "customer": "WIJAMINI", "products": [{ "product": "PINION GEAR", "quantity": "1", "unit": "PCS" }], "weight": "31.30" },
    "350": { "carton": "350", "customer": "WIJAMINI", "products": [{ "product": "CYLINDER LINER", "quantity": "4", "unit": "PCS" }], "weight": "25.90" },
    "351": { "carton": "351", "customer": "WIJAMINI", "products": [{ "product": "PINION GEAR", "quantity": "1", "unit": "PCS" }], "weight": "31.30" },
    "352": {
      "carton": "352",
      "customer": "WIJAMINI",
      "products": [
        { "product": "SPIDER", "quantity": "1", "unit": "PCS" },
        { "product": "BEARING", "quantity": "10", "unit": "PCS" }
      ],
      "weight": "29.10"
    },
    "353": { "carton": "353", "customer": "WIJAMINI", "products": [{ "product": "PINION GEAR", "quantity": "1", "unit": "PCS" }], "weight": "31.40" },
    "354": {
      "carton": "354",
      "customer": "WIJAMINI",
      "products": [
        { "product": "CLUTCH", "quantity": "4", "unit": "PCS" },
        { "product": "BEARING", "quantity": "10", "unit": "PCS" },
        { "product": "PINION", "quantity": "16", "unit": "PCS" }
      ],
      "weight": "32.40"
    },
    "355": {
      "carton": "355",
      "customer": "WIJAMINI",
      "products": [
        { "product": "AIR DRYER KIT", "quantity": "5", "unit": "PCS" },
        { "product": "VALVE", "quantity": "30", "unit": "PCS" },
        { "product": "AIR DRYER KIT", "quantity": "2", "unit": "PCS" },
        { "product": "DIAPHRAGM", "quantity": "4", "unit": "PCS" }
      ],
      "weight": "22.65"
    },
    "356": { "carton": "356", "customer": "WIJAMINI", "products": [{ "product": "BRAKE BOOSTER", "quantity": "8", "unit": "PCS" }], "weight": "30.65" },
    "357": {
      "carton": "357",
      "customer": "WIJAMINI",
      "products": [
        { "product": "SHAFT", "quantity": "30", "unit": "PCS" },
        { "product": "BRAKE BOOSTER", "quantity": "2", "unit": "PCS" }
      ],
      "weight": "18.80"
    },
    "358": {
      "carton": "358",
      "customer": "WIJAMINI",
      "products": [
        { "product": "SHAFT", "quantity": "3", "unit": "PCS" },
        { "product": "WINDOW BALANCER", "quantity": "3", "unit": "PCS" },
        { "product": "REGULATOR HANDLE", "quantity": "50", "unit": "PCS" }
      ],
      "weight": "19.70"
    },
    "359": { "carton": "359", "customer": "WIJAMINI", "products": [{ "product": "PISTON", "quantity": "2", "unit": "PCS" }], "weight": "21.50" },
    "360": { "carton": "360", "customer": "WIJAMINI", "products": [{ "product": "RADIATOR COOLENT", "quantity": "7", "unit": "PCS" }], "weight": "36.00" },
    "361": { "carton": "361", "customer": "WIJAMINI", "products": [{ "product": "PISTON", "quantity": "3", "unit": "PCS" }], "weight": "31.40" },
    "362": { "carton": "362", "customer": "UDITHA", "products": [{ "product": "STRUT DAMPER", "quantity": "8", "unit": "PCS" }], "weight": "40.90" },
    "363": { "carton": "363", "customer": "UDITHA", "products": [{ "product": "STRUT DAMPER", "quantity": "8", "unit": "PCS" }], "weight": "39.80" },
    "364": { "carton": "364", "customer": "UDITHA", "products": [{ "product": "STRUT DAMPER", "quantity": "8", "unit": "PCS" }], "weight": "40.90" },
    "365": { "carton": "365", "customer": "UDITHA", "products": [{ "product": "STRUT DAMPER", "quantity": "8", "unit": "PCS" }], "weight": "40.90" },
    "366": { "carton": "366", "customer": "UDITHA", "products": [{ "product": "STRUT DAMPER", "quantity": "8", "unit": "PCS" }], "weight": "40.25" },
    "367": { "carton": "367", "customer": "UDITHA", "products": [{ "product": "DIESEL FILTER", "quantity": "20", "unit": "PCS" }], "weight": "20.80" },
    "368": { "carton": "368", "customer": "UBAID", "products": [{ "product": "BATTON", "quantity": "33", "unit": "PKT" }], "weight": "23.05" },
    "369": { "carton": "369", "customer": "UBAID", "products": [{ "product": "BATTON", "quantity": "27", "unit": "PKT" }], "weight": "29.20" },
    "370": { "carton": "370", "customer": "MOHAMED ARSHATH", "products": [{ "product": "SHIRT", "quantity": "200", "unit": "PCS" }], "weight": "32.00" }
  }
}
        
    };
    db.collection('Shipment').doc("ABEPE2529H SHIPMENT 134").set(obj, {merge: true}).then(function () {
                console.log("================================ IS UPDATE ===============================")
                res.end(JSON.stringify({status: "success", isUpdate: true}));
            }).catch(function (error) {
                res.end(JSON.stringify({status: "error", error: error}));
            });
}

module.exports = {addCustomer, getCustomer, serachCustomer, editCustomer, updateCustomerPriceList, getAllCustomers, manualUpdateShipment};