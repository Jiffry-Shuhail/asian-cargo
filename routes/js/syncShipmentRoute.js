var express = require('express');
var router = express.Router();
var exporter = require('./syncShipment');

router.post('/', function (req, res, next) {
    exporter.syncShipment(req, res);
});

module.exports = router;