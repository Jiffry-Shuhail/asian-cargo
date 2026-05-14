var express = require('express');
var router = express.Router();
var customer = require('./customer');

router.post('/', function (req, res, next) {
    customer.addCustomer(req, res);
});

module.exports = router;