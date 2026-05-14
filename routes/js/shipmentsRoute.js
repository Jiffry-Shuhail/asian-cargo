var express = require('express');
var router = express.Router();
var exporter = require('./shipment');

router.post('/', function (req, res, next) {
    exporter.getAllShipment(req, res);
});

module.exports = router;