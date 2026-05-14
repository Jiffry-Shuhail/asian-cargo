$.getScript('/app/js/iconchanger.js');
// $('body').toggleClass('sidebar-icon-only');
$(".content-wrapper").html("");
$(".content-wrapper").load("/app/html/shippingprocessNew.html");
// $(".content-wrapper").load("/app/html/shippingprocess.html");

var editShipment=null;
var editShipmentStatus=null;

var destroy=function (){
    console.log("****************** DESTROY ******************");  
};

$(".nav li:nth-child(1)").click(function () {
    destroy();
   $(".content-wrapper").load("/app/html/shippingprocessNew.html");
    // $(".content-wrapper").load("/app/html/shippingprocess.html");
});

$(".nav li:nth-child(2)").click(function () {
    destroy();
    $(".content-wrapper").load("/app/html/clearing.html");
});


$(".nav li:nth-child(3)").click(function () {
    destroy();
    $(".content-wrapper").load("/app/html/quotation.html");
});

$(".nav li:nth-child(4)").click(function () {
    destroy();
    $(".content-wrapper").load("/app/html/shipments.html");
});
$(".nav li:nth-child(5)").click(function () {
    destroy();
    $(".content-wrapper").load("/app/html/customers.html");
});

$(".nav li:nth-child(6)").click(function () {
    destroy();
    $(".content-wrapper").load("/app/html/goods.html");
});

$(".nav li:nth-child(7)").click(function () {
    destroy();
    $(".content-wrapper").load("/app/html/category.html");
});

$(".nav li:nth-child(8)").click(function () {
    destroy();
    $(".content-wrapper").load("/app/html/users.html");
});