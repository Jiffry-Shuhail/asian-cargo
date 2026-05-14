var admin = require('firebase-admin');
var serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://asian-cargo.firebaseio.com",
    projectId: "asian-cargo",
    storageBucket: "asian-cargo.appspot.com"
});

var db = admin.firestore();

async function autheticate(req, res, next) {
    const result=await checkIsActive();
    var sessionCookie = req.cookies.session || '';
    admin.auth().verifySessionCookie(sessionCookie, false /** checkRevoked */)
            .then((decodedClaims) => {
                res.render('home.html', {image: decodedClaims.picture,result:result});
            })
            .catch(error => {
                res.render('index.html');
            });
}

async function sessionLogin(req, res) {
    const result=await checkIsActive();
    var idToken = req.body.idToken.toString();
    var expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
        var options = {maxAge: expiresIn, httpOnly: true};
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({status: "success",result:result}));
    }, (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST");
    });
}

const getAllUsers = (req, res) => {
    admin.auth().listUsers().then((userRecords) => {
        var users = [];
        userRecords.users.forEach((user) => users.push(user.toJSON()));
        res.send(JSON.stringify({status: "success", data: users}));
    }).catch((error) => console.log(error));
};


const checkIsActive =() => {
    db.collection('SYSTEM').doc('CONFIG').get().then((doc) => {
        if (doc.exists) {
            var config = doc.data();
            if (config.isActive && endOfMonth(new Date()).getDate() === new Date().getDate()) {
                config.isActive = false;
                config.invoice = config.invoice+50;
                db.collection('SYSTEM').doc('CONFIG').update({
                    isActive: false,
                    invoice: db.firestore.FieldValue.increment(50)
                });
            }

            if (config.isActive) {
                return {isActive: true,status:config.status,
                    msg:config.msg};
            } else {
                return {
                    isActive: false,
                    invoice:config.invoice,
                    status:config.status,
                    msg:config.msg,
                    amount: (Math.random() * (config.amountEnd - config.amountStart) + config.amountStart).toFixed(2)
                };
            }
        }
    }).catch((err) => {
        return {isActive: false,msg:'Sever Side Error'};
    });
};


const endOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

module.exports = {autheticate, sessionLogin, getAllUsers};