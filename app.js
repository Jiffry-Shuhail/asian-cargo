var createError = require('http-errors');
var fileUpload = require('express-fileupload');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');


var shippingprocess = require('./routes/js/shippingprocess');
var exporter = require('./routes/js/exporter');
var shipment = require('./routes/js/shipment');
var products = require('./routes/js/products');
var customer = require('./routes/js/customer');
var pendingShipments = require('./routes/js/pendingShipments');
var updateShipment = require('./routes/js/updateShipment');
var weightUpdate = require('./routes/js/weightUpdate');
var updateShipmentHeader = require('./routes/js/updateShipmentHeader');
var editCustomer = require('./routes/js/editCustomer');


var csrfMiddleware = csrf({cookie: true});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var homeRouter = require('./routes/home');

var authentication = require('./routes/authentication');
var exporterRouter = require('./routes/js/exporterRoute');
var productsRoute = require('./routes/js/productsRoute');
var customerRoute = require('./routes/js/customerRoute');
var syncShipmentRoute = require('./routes/js/syncShipmentRoute');
var addShipment = require('./routes/js/addShipment');
var shipmentsRoute = require('./routes/js/shipmentsRoute');
var pendingShipmentsRoute = require('./routes/js/pendingShipmentsRoute');
var clearing = require('./routes/js/clearing');
var quotation = require('./routes/js/quotation');
var readExcel = require('./routes/js/readExcel');
var systemJS = require('./routes/js/system');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.urlencoded({extended: false,limit: '50mb'}));
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 }}));

app.all('*', function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(lessMiddleware(path.join(__dirname, 'temp')));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
//app.use('/login', indexRouter);
// Every business endpoint below this boundary requires active server-side access.
const { createAccessGuard } = require('./middleware/access');
const admin = require('firebase-admin');
app.use(createAccessGuard({ auth: admin.auth(), firestore: admin.firestore() }));
app.use(express.static(path.join(__dirname, 'temp')));
app.use('/users', usersRouter);
app.use('/home', homeRouter);
app.use('/addExporter', exporterRouter);
app.use('/addProduct', productsRoute);
app.use('/addCustomer', customerRoute);
app.use('/syncShipment', syncShipmentRoute);
app.use('/addShipment', addShipment);
app.use('/getAllShipment', shipmentsRoute);
app.use('/getPendingShipment', pendingShipmentsRoute);
app.use('/updateShipment', updateShipment);
app.use('/weightUpdate', weightUpdate);
app.use('/updateShipmentHeader', updateShipmentHeader);
app.use('/editCustomer', editCustomer);

app.use("/getAllUsers", (req, res) => {
    authentication.getAllUsers(req, res);
});
app.use("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/");
});

app.use("/getCustomer", (req, res) => {
    customer.getCustomer(req, res);
});


app.use("/manualUpdateShipment", (req, res) => {
    res.status(410).json({error: "MAINTENANCE_ENDPOINT_REMOVED"});
});

app.use("/serachCustomer", (req, res) => {
    customer.serachCustomer(req, res);
});

app.use("/getAllCustomers", (req, res) => {
    customer.getAllCustomers(req, res);
});

app.use("/getExporter", (req, res) => {
    exporter.getExporter(req, res);
});

app.use("/getShipmentCount", (req, res) => {
    shipment.getShipmentCount(req, res);
});

app.use("/searchShipments", (req, res) => {
    shipment.searchShipments(req, res);
});

app.use("/getContainer", (req, res) => {
    systemJS.getContainer(req, res);
});

app.use("/getShippingProcess", (req, res) => {
    systemJS.getShippingProcess(req, res);
});

app.use("/getShipments", (req, res) => {
    shipment.getShipments(req, res);
});

app.use("/getProducts", (req, res) => {
    products.getProducts(req, res);
});

app.post("/getAllActiveProduct", (req, res) => {
    products.getAllActiveProduct(req, res);
});

app.use("/getDeActivateProduct", (req, res) => {
    products.deActivate(req, res);
});

app.use("/getActiveCategory", (req, res) => {
    products.getActiveCategory(req, res);
});

app.use("/updateProductsCat", (req, res) => {
    products.updateProductsCat(req, res);
});


app.use("/getCategory", (req, res) => {
    products.getCategory(req, res);
});

app.use("/addCategory", (req, res) => {
    products.addCategory(req, res);
});

app.use("/getAllActiveCategory", (req, res) => {
    products.getAllActiveCategory(req, res);
});

app.use("/deActivateCategory", (req, res) => {
    products.deActivateCategory(req, res);
});

app.use("/getUnits", (req, res) => {
    products.getUnits(req, res);
});

app.use("/getSerchedProductNCategoru", (req, res) => {
    products.getSerchedProductNCategoru(req, res);
});

app.post("/updateProducts", (req, res) => {
     res.status(501).json({error: "PRODUCT_UPDATE_NOT_IMPLEMENTED"});
});

app.use("/removePendingShipment", (req, res) => {
    pendingShipments.removePendingShipment(req, res);
});

app.post("/updateCustomerPriceList", (req, res) => {
    customer.updateCustomerPriceList(req, res);
});

app.post("/createInvoice", (req, res) => {
     shipment.createInvoice(req, res);
});

app.post("/createCustomerInvoice", (req, res) => {
     shipment.createCustomerInvoice(req, res);
});

app.post("/addOrUpdateClearing", (req, res) => {
     clearing.addOrUpdateClearing(req, res);
});


app.use("/getAllClearing", (req, res) => {
    clearing.getAllClearing(req, res);
});

app.post("/addOrUpdateQuotation", (req, res) => {
     quotation.addOrUpdateQuotation(req, res);
});

app.use("/getAllQuotation", (req, res) => {
    quotation.getAllQuotation(req, res);
});

app.post("/readExcel", (req, res) => {
     readExcel.read(req, res);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
