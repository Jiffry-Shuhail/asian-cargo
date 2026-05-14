var express = require('express');
var router = express.Router();
var exporter = require('./products');

router.post('/', function (req, res, next) {
    exporter.addProduct(req, res);
});

module.exports = router;