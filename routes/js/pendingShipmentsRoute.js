var express = require('express');
var router = express.Router();
var exporter = require('./pendingShipments');

router.post('/', function (req, res, next) {
    exporter.getPendingShipment(req, res);
});

module.exports = router;