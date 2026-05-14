var express = require('express');
var router = express.Router();
var authentication = require('./authentication');

/* GET home page. */
router.get('/', function (req, res, next) {
    authentication.autheticate(req, res, next);
});

module.exports = router;
