var express = require('express');
var router = express.Router();
var customer = require('./customer');

router.post('/', function (req, res, next) {
    customer.editCustomer(req, res);
});

module.exports = router;