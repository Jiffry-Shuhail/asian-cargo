var express = require('express');
var router = express.Router();
var exporter = require('./exporter');

router.post('/', function (req, res, next) {
    exporter.addExporter(req, res);
});

module.exports = router;