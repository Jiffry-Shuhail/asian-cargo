var admin = require('firebase-admin');
// Use GOOGLE_APPLICATION_CREDENTIALS locally or workload identity in the cloud.
admin.initializeApp({ credential: admin.credential.applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT || 'asian-cargo' });

var db = admin.firestore();

async function autheticate(req, res, next) {
    const result=await checkIsActive();
    var sessionCookie = req.cookies.session || '';
    admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then((decodedClaims) => {
                res.render('home.html', {image: decodedClaims.picture,result:result});
            })
            .catch(error => {
                res.render('index.html');
            });
}

async function sessionLogin(req, res) {
    const result=await checkIsActive();
    if (!req.body || typeof req.body.idToken !== 'string' || !req.body.idToken.trim()) {
        return res.status(400).json({error: 'ID_TOKEN_REQUIRED'});
    }
    var idToken = req.body.idToken;
    var expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
        var options = {maxAge: expiresIn, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production'};
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({status: "success",result:result}));
    }, (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST");
    });
}

const getAllUsers = (req, res) => {
    admin.auth().listUsers().then((userRecords) => {
        var users = [];
        userRecords.users.forEach((user) => users.push({uid: user.uid, email: user.email, displayName: user.displayName, disabled: user.disabled}));
        res.send(JSON.stringify({status: "success", data: users}));
    }).catch(() => res.status(503).json({error: 'USER_DIRECTORY_UNAVAILABLE'}));
};


// Read-only: automatic month-end billing needs an approved rule and idempotent job.
const checkIsActive = async () => {
    try {
        const doc = await db.collection('SYSTEM').doc('CONFIG').get();
        if (!doc.exists) return {isActive: false, msg: 'System configuration missing'};
        const config = doc.data();
        return {isActive: config.isActive === true, status: config.status, msg: config.msg};
    } catch (_) {
        return {isActive: false, msg: 'System configuration unavailable'};
    }
};

const endOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

module.exports = {autheticate, sessionLogin, getAllUsers};