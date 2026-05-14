var express = require('express');
var router = express.Router();
var authentication = require('./authentication');



/* GET home page. */
router.get('/', function (req, res, next) {
    authentication.autheticate(req, res, next);
});


router.post('/sessionLogin', function (req, res, next) {
    authentication.sessionLogin(req, res);
});

module.exports = router;
