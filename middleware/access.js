'use strict';

// Kept dependency-injected so negative authorization tests never contact Firebase.
function createAccessGuard({ auth, firestore }) {
    return async function requireAccess(req, res, next) {
        res.set('Cache-Control', 'no-store');
        const cookie = req.cookies && req.cookies.session;
        if (!cookie) return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED' });
        let identity;
        try {
            identity = await auth.verifySessionCookie(cookie, true);
        } catch (_) {
            return res.status(401).json({ error: 'INVALID_SESSION' });
        }
        try {
            const account = await firestore.collection('Access').doc(identity.uid).get();
            const access = account.exists ? account.data() : null;
            // Read on every request: suspension and permission removal are not token-bound.
            if (!access || access.active !== true) {
                return res.status(403).json({ error: 'ACCESS_DENIED' });
            }
            const required = req.path.split('/')[1].toLowerCase() === 'getallusers' ? 'users:read' : 'legacy:operate';
            if (!Array.isArray(access.permissions) || !access.permissions.includes(required)) {
                return res.status(403).json({ error: 'ACCESS_DENIED' });
            }
            req.identity = identity;
            return next();
        } catch (_) {
            return res.status(503).json({ error: 'AUTHORIZATION_UNAVAILABLE' });
        }
    };
}
module.exports = { createAccessGuard };
