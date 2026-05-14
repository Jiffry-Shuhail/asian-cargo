var admin = require("firebase-admin");

function getProducts(req, res) {
    var db = admin.firestore();
    db.collection('Product').get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            if (doc.data().isActive) {
                data[doc.id] = doc.data();
            }
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

async function getAllActiveProduct(req, res) {

    var offset = req.body.start ? parseInt(req.body.start) : 1;
    var limit = req.body.length ? parseInt(req.body.length) : 6;

//    admin.firestore().collection('Product').where("name", "==", "")
//            .get()
//    .then((querySnapshot) => {
//        querySnapshot.forEach((doc) => {
//            console.log(doc.id, " => ", doc.data());
//            admin.firestore().collection('Product').doc(doc.id).update({isActive: false}).then(() => {
//                console.log(`Document successfully updated! ${doc.id}`);})
//            });
//        })

    var query=admin.firestore().collection('Product').where("isActive", "==", true) .orderBy('isActive','desc');
    var collectionRef=admin.firestore().collection('Product').where("isActive", "==", true) .orderBy('isActive','desc');
    if(req.body.search.value){
        let values=JSON.parse(req.body.search.value);
        let keyWord=values.name?values.name.toUpperCase():'';
        if(values.cat==="name"){
            collectionRef=admin.firestore().collection('Product').where('name', '>=', keyWord).where('name', '<=', keyWord+'\uf8ff').where("isActive", "==", true);
            query=admin.firestore().collection('Product').where('name', '>=', keyWord).where('name', '<=', keyWord+'\uf8ff').where("isActive", "==", true).orderBy('name','desc').orderBy('isActive','desc');
        }else{
            collectionRef=admin.firestore().collection('Product').where('category', '>=', keyWord).where('category', '<=', keyWord+'\uf8ff').where("isActive", "==", true);
            query=admin.firestore().collection('Product').where('category', '>=', keyWord).where('category', '<=', keyWord+'\uf8ff').where("isActive", "==", true).orderBy('category','desc').orderBy('isActive','desc');
        }
        
    }
    
    const snapshotCount = await collectionRef.count().get();
    const totalRecords = snapshotCount.data().count;

    query.offset(offset)
            .limitToLast(limit)
            .get()
            .then((querySnapshot) => {
                var data = [];
                var index = 0;
                querySnapshot.forEach((doc) => {
                    var prod = doc.data();
                    if (prod.isActive) {
                        let editButton = `<div class="btn-group" role="group" aria-label="Basic example">
  <button class="btn btn-inverse-dark edit-good" style="height:55px; border-radius:0"><i class="fa fa-pencil"></i></button>
  <button class="btn btn-inverse-danger remove-good" style="height:55px; border-radius:0"><i class="fa fa-trash"></i></button>
</div>`;
                        prod.editButton = editButton;
                        data.push(prod);
                        index++;
                    }
                });
                res.json({
                    draw: req.body.draw,
                    recordsTotal: totalRecords, // total number of records in the collection
                    recordsFiltered: totalRecords, // total number of records after filtering
                    data: data
                });
            });
}

function deActivate(req, res){
    admin.firestore().collection('Product').doc(req.query.id).update({isActive: false}).then(() => {
                res.send(JSON.stringify({isOk: true}));
            }).catch((err) => {
        res.send(JSON.stringify({isOk: false}));
    });
}

function addProduct(req, res) {
    var db = admin.firestore();
    db.collection('Product').doc(req.body.key).set(req.body.data).then(function () {
        res.end(JSON.stringify({status: "success"}));
    }).catch(function (error) {
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

function updateProducts(req, res) {
    var db = admin.firestore();
    db.collection('Product').set(req.body.data, {merge: true}).then(function () {
        res.end(JSON.stringify({status: "success"}));
    }).catch(function (error) {
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

function updateProductsCat(req, res) {
    admin.firestore().collection('Product').doc(req.query.id).update({"category": req.query.cat}).then(() => {
                res.send(JSON.stringify({isOk: true}));
            }).catch((err) => {
        res.send(JSON.stringify({isOk: false}));
    });
}

function getCategory(req, res) {
    var db = admin.firestore();
    db.collection('Category').get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            if (doc.data().isActive) {
                data[doc.id] = doc.data();
            }
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}


function getActiveCategory(req, res) {
    var db = admin.firestore();
    db.collection('Category').where("isActive","==",true).get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            if (doc.data().isActive) {
                data[doc.id] = doc.data();
            }
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

async function getAllActiveCategory(req, res) {

    var offset = req.body.start ? parseInt(req.body.start) : 1;
    var limit = req.body.length ? parseInt(req.body.length) : 6;

    var query=admin.firestore().collection('Category').where("isActive", "==", true) .orderBy('isActive','desc');
    var collectionRef=admin.firestore().collection('Category').where("isActive", "==", true) .orderBy('isActive','desc');
    if(req.body.search.value){
        let keyWord=req.body.search.value.toUpperCase();
        collectionRef=admin.firestore().collection('Category').where('name', '>=', keyWord).where('name', '<=', keyWord+'\uf8ff').where("isActive", "==", true).orderBy('name','desc');;
        query=admin.firestore().collection('Category').where('name', '>=', keyWord).where('name', '<=', keyWord+'\uf8ff').where("isActive", "==", true).orderBy('name').orderBy('isActive');
    }
    
    const snapshotCount = await collectionRef.count().get();
    const totalRecords = snapshotCount.data().count;

    query.offset(offset)
            .limitToLast(limit)
            .get()
            .then((querySnapshot) => {
                var data = [];
                var index = 0;
                querySnapshot.forEach((doc) => {
                    var prod = doc.data();
                    if (prod.isActive) {
                        let editButton = `
                        <button class="btn btn-inverse-danger remove-category" style="height:55px; width:100%; border-radius:0"><i class="fa fa-trash"></i></button>`;
                        prod.editButton = editButton;
                        prod.status = 'Active';
                        data.push(prod);
                        index++;
                    }
                });
                res.json({
                    draw: req.body.draw,
                    recordsTotal: totalRecords, // total number of records in the collection
                    recordsFiltered: totalRecords, // total number of records after filtering
                    data: data
                });
            });
}

function deActivateCategory(req, res){
    admin.firestore().collection('Category').doc(req.query.id).update({isActive: false}).then(() => {
                res.send(JSON.stringify({isOk: true}));
            }).catch((err) => {
        res.send(JSON.stringify({isOk: false}));
    });
}

function addCategory(req, res) {
    var db = admin.firestore();
    db.collection('Category').doc(req.body.key).set(req.body.data).then(function () {
        res.end(JSON.stringify({status: "success"}));
    }).catch(function (error) {
        res.end(JSON.stringify({status: "error", error: error}));
    });
}

function getUnits(req, res) {
    var db = admin.firestore();
    db.collection('Unit').get().then((snapshot) => {
        var data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data();
        });
        res.send(JSON.stringify({status: "success", data: data}));
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
}

async function getSerchedProductNCategoru(req, res) {
    var db = admin.firestore();
    var data = {success: true, results: []};
    var product = await db.collection('Product').orderBy("name").where("name", ">=", req.query.search).where("name", "<=", req.query.search + '\uf8ff').limit(10).get();
    product.forEach(doc => {
        data.results.push({name: doc.data().name, value: doc.data().name, text: doc.data().name});
    });
    var category = await db.collection('Category').orderBy("name").where("name", ">=", req.query.search).where("name", "<=", req.query.search + '\uf8ff').limit(10).get();
    category.forEach(doc => {
        data.results.push({name: doc.data().name, value: doc.data().name, text: doc.data().name});
    });
    res.send(JSON.stringify(data));
}

module.exports = {addProduct, getProducts, addCategory, getCategory, getUnits, getSerchedProductNCategoru,updateProducts,getAllActiveProduct,deActivate,getActiveCategory,updateProductsCat,getAllActiveCategory,deActivateCategory};