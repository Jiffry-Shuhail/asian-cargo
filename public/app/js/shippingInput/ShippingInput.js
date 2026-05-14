$.getScript('/app/js/others/validation.js');
$.getScript('/app/js/others/mobile-number.js');
$.getScript('/app/js/shipmentInput/cutomerSide.js');
$.getScript('/app/js/shipmentInput/productSide.js');
$.getScript('/app/js/shipmentInput/weightSide.js');
$.getScript('/app/js/shipmentInput/EditShipment.js');
$.getScript('/app/js/shipmentInput/pendingShipment.js');
$(".shippingprocess-addProduct").load("/app/model/findReplaceProductModel.html");
$(".shippingprocess-editExporter").load("/app/model/editExporter.html");
$(".shipmetnattachement-modal").load("/app/model/shipmentAtachment.html");
$.getScript('/app/js/shipmentInput/shipmentAtachment.js');
$('#exporter').dropdown({selectOnKeydown: false});
$('#shipmentStausBar').removeClass('d-none');


var shipmentStatus = [];

var isTop = false;
var CUSTOMER = {};
var CUSTOMER_NAME = [];
var PRODUCTS = {};
var PRODUCTS_NAME = [];
var CATEGORY = {};
var CATEGORY_NAME = [];
var UNITS = {};
var UNITS_NAME = [];
var EXPORTER = {};

var CARTON_NUMBER_INDEX = 0;

var cartoonNumber = 0;
var findedIndex = new Array();
var selctindex = 0;
var isDown = false;
var isValidUpdateChacker = {isLodedExoter: false, isLoadedCustomer: false, isLodedProduct: false};
var isValidPendingChecker = {isLodedExoter: false, isLoadedPending: false};
var nextTab = '#productTab';

var pendingShipments = {};

var synm = setInterval(sync, 300000);

const  FIND_ELEMENTS = $('.floating-chat');

$(document).keydown(function (evt) {
    evt = evt || window.event;
    if (evt.ctrlKey && evt.keyCode === 83) {
        evt.preventDefault();
        $('#save-shipment').click();
    } else if ((evt.keyCode === 70 || evt.keyCode === 120) && evt.ctrlKey) {
        evt.preventDefault();
        evt.preventDefault();
        if (FIND_ELEMENTS.hasClass("expand")) {
            FIND_ELEMENTS.find('.header button').click();
        } else {
            FIND_ELEMENTS.click();
        }
    }
});

$(function () {

    $(".nav li:nth-child(1)").find('img').removeClass('activenac');

    autocompleteForStatus(document.getElementById('shipment-status'), document.getElementById('toggle-status'), shipmentStatus);

    $.get("/getAllCustomers", function (data, status) {
        let response = JSON.parse(data);
        $.each(response.data, function (index, value) {
            if (isEmpty(CUSTOMER[value.name.trim()])) {
                CUSTOMER[value.name.trim()] = value;
                CUSTOMER_NAME.push(value.name.trim());
            }
        });
        $(`#dataTable > tbody > tr`).eq(0).find('td').eq(0).focus();
        JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(0).find('td').eq(0), CUSTOMER_NAME, "2");
        $(".contact").keydown(enforceFormat);
        $(".contact").keyup(formatToPhone);
        isValidUpdateChacker.isLoadedCustomer = true;
        if (isValidUpdateChacker.isLodedExoter && isValidUpdateChacker.isLoadedCustomer && isValidUpdateChacker.isLodedProduct) {
            startProcess();
        }
    });

    $.get("/getProducts", function (data, status) {
        let response = JSON.parse(data);
        $.each(response.data, function (index, value) {
            PRODUCTS[index] = value;
            PRODUCTS_NAME.push(value.name.trim());
        });

        JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(0).find('td').eq(3), PRODUCTS_NAME, "1");
        JqueryAutoCompleteForInput($('#findProduct'), PRODUCTS_NAME);
        JqueryAutoCompleteForInput($('#replaceProduct'), PRODUCTS_NAME);
        $(".special").keypress(ignoreSimble);
        isValidUpdateChacker.isLodedProduct = true;
        if (isValidUpdateChacker.isLodedExoter && isValidUpdateChacker.isLoadedCustomer && isValidUpdateChacker.isLodedProduct) {
            startProcess();
        }
    });

    $.get("/getCategory", function (data, status) {
        let response = JSON.parse(data);
        $.each(response.data, function (key, value) {
            CATEGORY[key] = value;
            CATEGORY_NAME.push(value.name.trim());
        });
        JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(0).find('td').eq(4), CATEGORY_NAME, "3");
    });

    $.get("/getUnits", function (data, status) {
        var response = JSON.parse(data);
        $.each(response.data, function (key, value) {
            UNITS[key] = value;
            UNITS_NAME.push(value.unit.trim());
        });
        JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(0).find('td').eq(6), UNITS_NAME, "4");
        $(".doubletd").keypress(isNumberTD);
        $(".next-column").keypress(nextColumn);
        $(".dash-validate").keypress(onlyOneDashForTD);
    });

    $.get("/getExporter", function (data, status) {
        var response = JSON.parse(data);
        EXPORTER = response.data;
        var values = [];
        values.push({name: "ADD EXPORTER", value: "ADD EXPORTER", className: {active: 'active', animating: 'animating', item: 'item'}});
        for (var e in EXPORTER) {
            values.push({name: EXPORTER[e].exName.trim(), value: e});
        }
        isValidUpdateChacker.isLodedExoter = true;
        isValidPendingChecker.isLodedExoter = true;
        $('#exporter').dropdown({
            selectOnKeydown: false,
            values: values,
            onChange: function (value, text, $selectedItem) {

                if (!isEmpty(value) && value === "ADD EXPORTER") {
                    clearExporter();
                    $('#packing-charges').val('225');
                    $('#weight-charges').val('140');
                    $('#editExporter').modal('show');
                    $('#reference-no').focus();
                } else {
                    if (!isEmpty($selectedItem)) {
                        getShipmentCount(value);
                    }
                }

            }
        });
        $('#exporter').dropdown('clear');
        $("#exporter").dropdown("set selected", 'ABEPE2529H');
        if (isValidUpdateChacker.isLodedExoter && isValidUpdateChacker.isLoadedCustomer && isValidUpdateChacker.isLodedProduct) {
            startProcess();
        }
        if (isValidPendingChecker.isLodedExoter && isValidPendingChecker.isLoadedPending) {
            drawPendingSipmentNotifaction();
        }
    });

    $.ajax({
        url: "/getPendingShipment",
        type: "POST",
        dataType: 'json',
        headers: {
            Accept: "application/json",
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        cache: false,
        success: function (data) {
            if (data.status === "success") {
                if (Object.keys(data.data).length > 0) {
                    pendingShipments = data.data;
                    isValidPendingChecker.isLoadedPending = true;
                    if (isValidPendingChecker.isLodedExoter && isValidPendingChecker.isLoadedPending) {
                        drawPendingSipmentNotifaction();
                    }
                }
            }
        },
        error: function (xhr, status, error) {
        }
    }).done(function (msg) {
    });

    $('.create').keypress(create);
    $(".remove-row").click(removeRow);

    FIND_ELEMENTS.click(openFindElement);
});

function create(e) {
    if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
        isCarton($(this).parent().index());
        if (!isEmpty(CARTON_NUMBER_INDEX)) {
            if (isValidRow(CARTON_NUMBER_INDEX)) {
                let carton = $(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(2).text();
                let dataArray = [];
                for (let i = CARTON_NUMBER_INDEX; i <= $(this).parent().index(); i++) {
                    dataArray.push({
                        customer: $(`#dataTable > tbody > tr`).eq(i).find('td').eq(0).text(),
                        contact: $(`#dataTable > tbody > tr`).eq(i).find('td').eq(1).text(),
                        product: $(`#dataTable > tbody > tr`).eq(i).find('td').eq(3).text(),
                        category: $(`#dataTable > tbody > tr`).eq(i).find('td').eq(4).text(),
                        quantity: $(`#dataTable > tbody > tr`).eq(i).find('td').eq(5).text(),
                        unit: $(`#dataTable > tbody > tr`).eq(i).find('td').eq(6).text(),
                        weight: $(`#dataTable > tbody > tr`).eq(i).find('td').eq(7).text()
                    });
                }

                if (carton.includes(":")) {
                    let cartonNumberArray = carton.split(":");
                    let validData = getValidCarton(cartonNumberArray);
                    if (validData.isValid) {
                        let start = validData.data.start;
                        let end = validData.data.end;
                        let cartonIndex = "";
                        if (validData.data.isFront) {
                            cartonIndex = validData.data.text + start;
                        } else {
                            cartonIndex = start + validData.data.text;
                        }
                        $(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(2).text(cartonIndex);

                        start++;
                        let isAvailable = false;
                        for (let i = start; i <= end; i++) {

                            if (validData.data.isFront) {
                                cartonIndex = validData.data.text + i;
                            } else {
                                cartonIndex = i + validData.data.text;
                            }

                            let errorIndex = 0;
                            $(`#dataTable > tbody > tr`).each(function (index, el) {
                                if (!isEmpty($(el).children().eq(2).text()) && $(el).children().eq(2).text() === cartonIndex) {
                                    isAvailable = true;
                                    errorIndex = index;
                                    return false;
                                }
                            });

                            if (!isAvailable) {
                                let isFirst = true;
                                $.each(dataArray, function (index, value) {
                                    $(`#dataTable`).append(`<tr>
                                    <td class="table-padding-0 uppecase autocomplete customer" style="width: 25%;" contenteditable="">${value.customer}</td>
                                    <td class="table-padding-0 uppecase contact next-column" style="width: 10%;" contenteditable="">${value.contact}</td>
                                    <td class="table-padding-0 uppecase dash-validate next-column carton-number" style="width: 5%;" contenteditable="">${(isFirst) ? cartonIndex : ""}</td>
                                    <td class="table-padding-0 autocomplete uppecase special product-name" style="width: 25%;" contenteditable="">${value.product}</td>
                                    <td class="table-padding-0 autocomplete uppecase special category" style="width: 10%;" contenteditable="">${value.category}</td>
                                    <td class="table-padding-0 next-column text-right doubletd" style="width: 10%;" contenteditable="">${value.quantity}</td>
                                    <td class="table-padding-0 text-center autocomplete uppecase unit next-column" style="width: 7%;" contenteditable="">${value.unit}</td>
                                    <td class="table-padding-0 text-right doubletd create" style="width: 7%;" contenteditable="">${value.weight}</td>
                                    <td class="table-padding-0 text-center" style="width: 1%; padding: 0"><button class="btn btn-inverse-danger btn-rounded p-10 remove-row"><i class="mdi mdi-delete-variant"></i></button></td>
                                </tr>`);
                                    if (isFirst) {
                                        isFirst = false;
                                    }
                                });
                                JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(0), CUSTOMER_NAME, "2");
                                JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(3), PRODUCTS_NAME, "1");
                                JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(4), CATEGORY_NAME, "3");
                                JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(6), UNITS_NAME, "4");
                            } else {
                                $(`#dataTable > tbody > tr`).eq(errorIndex + 1).find('td').eq(2).focus();
                                Lobibox.notify('warning', {position: 'top right', msg: `this carton number already exis ${cartonIndex}`});
                            }
                        }

                        counts();

                        if (!isAvailable) {
                            $(`#dataTable`).append(`<tr>
                                    <td class="table-padding-0 uppecase autocomplete customer" style="width: 25%;" contenteditable=""></td>
                                    <td class="table-padding-0 uppecase contact next-column" style="width: 10%;" contenteditable=""></td>
                                    <td class="table-padding-0 uppecase dash-validate next-column carton-number" style="width: 5%;" contenteditable=""></td>
                                    <td class="table-padding-0 autocomplete uppecase special product-name" style="width: 25%;" contenteditable=""></td>
                                    <td class="table-padding-0 autocomplete uppecase special category" style="width: 10%;" contenteditable=""></td>
                                    <td class="table-padding-0 next-column text-right doubletd" style="width: 10%;" contenteditable=""></td>
                                    <td class="table-padding-0 text-center autocomplete uppecase unit next-column" style="width: 7%;" contenteditable="">PCS</td>
                                    <td class="table-padding-0 text-right doubletd create" style="width: 7%;" contenteditable=""></td>
                                    <td class="table-padding-0 text-center" style="width: 1%; padding: 0"><button class="btn btn-inverse-danger btn-rounded p-10 remove-row"><i class="mdi mdi-delete-variant"></i></button></td>
                                </tr>`);

                            isFirst = false;
                            JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(0), CUSTOMER_NAME, "2");
                            JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(3), PRODUCTS_NAME, "1");
                            JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(4), CATEGORY_NAME, "3");
                            JqueryAutoComplete($(`#dataTable > tbody > tr:last`).eq(CARTON_NUMBER_INDEX).find('td').eq(6), UNITS_NAME, "4");
                            $(".doubletd").keypress(isNumberTD);
                            $(".carton-number").keydown(insertCartonNumber);
                            $(".next-column").keypress(nextColumn);
                            $(".dash-validate").keypress(onlyOneDashForTD);
                            $('.create').keypress(create);
                            $(".next-column").keypress(nextColumn);
                            $(".remove-row").click(removeRow);

                            $(`#dataTable > tbody > tr:last`).find('td').eq(0).focus();
                        }

                    } else {
                        $(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(0).focus();
                        Lobibox.notify('warning', {position: 'top right', msg: validData.msg});
                    }
                }
            }
        } else {
            $(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(2).focus();
            Lobibox.notify('warning', {position: 'top right', msg: "Empty Carton Number"});
        }
    } else if (e.keyCode === 13) {
        addSingleRow(this);
    }
}

function addSingleRow(element) {
    CARTON_NUMBER_INDEX = $(element).parent().index();
    if (isValidRow(CARTON_NUMBER_INDEX)) {
        let carton = $(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(2).text();

        let isAvailable = false;
        let errorIndex = 0;
        $(`#dataTable > tbody > tr`).each(function (index, el) {
            if (!isEmpty($(el).children().eq(2).text()) && index !== CARTON_NUMBER_INDEX && $(el).children().eq(2).text() === carton) {
                isAvailable = true;
                errorIndex = index;
                return false;
            }
        });

        if (!isAvailable) {
            counts();

            $(`#dataTable > tbody > tr:eq(${(CARTON_NUMBER_INDEX++)})`).after(`<tr>
                                    <td class="table-padding-0 uppecase autocomplete customer" style="width: 25%;" contenteditable=""></td>
                                    <td class="table-padding-0 uppecase contact next-column" style="width: 10%;" contenteditable=""></td>
                                    <td class="table-padding-0 uppecase dash-validate next-column carton-number" style="width: 5%;" contenteditable=""></td>
                                    <td class="table-padding-0 autocomplete uppecase special product-name" style="width: 25%;" contenteditable=""></td>
                                    <td class="table-padding-0 autocomplete uppecase special category" style="width: 10%;" contenteditable=""></td>
                                    <td class="table-padding-0 next-column text-right doubletd" style="width: 10%;" contenteditable=""></td>
                                    <td class="table-padding-0 text-center autocomplete uppecase unit next-column" style="width: 7%;" contenteditable="">PCS</td>
                                    <td class="table-padding-0 text-right doubletd create" style="width: 7%;" contenteditable=""></td>
                                    <td class="table-padding-0 text-center" style="width: 1%; padding: 0"><button class="btn btn-inverse-danger btn-rounded p-10 remove-row"><i class="mdi mdi-delete-variant"></i></button></td>
                                </tr>`);

            JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(0), CUSTOMER_NAME, "2");
            JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(3), PRODUCTS_NAME, "1");
            JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(4), CATEGORY_NAME, "3");
            JqueryAutoComplete($(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(6), UNITS_NAME, "4");
            $(".doubletd").keypress(isNumberTD);
            $(".carton-number").keydown(insertCartonNumber);
            $(".next-column").keypress(nextColumn);
            $(".dash-validate").keypress(onlyOneDashForTD);
            $('.create').keypress(create);
            $(".next-column").keypress(nextColumn);
            $(".remove-row").click(removeRow);

            $(`#dataTable > tbody > tr`).eq(CARTON_NUMBER_INDEX).find('td').eq(0).focus();
        } else {
            $(`#dataTable > tbody > tr`).eq(errorIndex + 1).find('td').eq(2).focus();
            Lobibox.notify('warning', {position: 'top right', msg: `this carton number already exis ${CARTON_NUMBER_INDEX}`});
        }
    }
}

function isCarton(index) {
    if (!isEmpty($(`#dataTable > tbody > tr`).eq(index).find('td').eq(2).text())) {
        CARTON_NUMBER_INDEX = index;
        return index;
    } else {
        if ((index - 1) >= 0) {
            isCarton((index - 1));
        } else {
            return 0;
        }
    }
}

function isValidRow(index) {
    let customerSide = false;
    let productSide = false;
    let isQuantity = false;
    let isUnit = false;
    let isWeight = true;

    let cutomerName = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(0).text();
    let cutomerContact = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(1).text();
    let carton = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(1).text();
    let productName = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(3).text();
    let category = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(4).text();
    let quantity = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(5).text();
    let unit = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(6).text();
    let weight = $(`#dataTable > tbody > tr`).eq(index).find('td').eq(7).text();


    if (!isEmpty(carton)) {
        if (isEmpty(weight)) {
            $(`#dataTable > tbody > tr`).eq(index).find('td').eq(7).text("0.00");
        }
    }

    if (index === 0 || !isEmpty(carton)) {
        if (!isEmpty(cutomerName) && !CUSTOMER.hasOwnProperty(cutomerName)) {
            if (!isEmpty(cutomerContact)) {
                //Insert Customer
                console.log("************************************");
                customerSide = true;
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Cutomer Contact Number"});
                $(`#dataTable > tbody > tr`).eq(index).find('td').eq(1).focus();
                customerSide = false;
            }
        } else if (!isEmpty(cutomerName) && CUSTOMER.hasOwnProperty(cutomerName)) {
            customerSide = true;
        } else {
            Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Cutomer"});
            $(`#dataTable > tbody > tr`).eq(index).find('td').eq(0).focus();
            customerSide = false;
        }
    } else if (!isEmpty(carton)) {
        if (!isEmpty(cutomerName) && !CUSTOMER.hasOwnProperty(cutomerName)) {
            if (!isEmpty(cutomerContact)) {
                //Insert Customer
                console.log("************************************");
                customerSide = true;
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Cutomer Contact Number"});
                $(`#dataTable > tbody > tr`).eq(index).find('td').eq(1).focus();
                customerSide = false;
            }
        } else {
            if (!isEmpty(cutomerName) && !CUSTOMER.hasOwnProperty(cutomerName)) {
                if (!isEmpty(cutomerContact)) {
                    //Insert Customer
                    console.log("************************************");
                    customerSide = true;
                } else {
                    Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Cutomer Contact Number"});
                    $(`#dataTable > tbody > tr`).eq(index).find('td').eq(1).focus();
                    customerSide = false;
                }
            } else if (!isEmpty(cutomerName) && CUSTOMER.hasOwnProperty(cutomerName)) {
                customerSide = true;
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Cutomer"});
                $(`#dataTable > tbody > tr`).eq(index).find('td').eq(0).focus();
                customerSide = false;
            }
        }
    }

    if (!isEmpty(productName) && !PRODUCTS.hasOwnProperty(getKey(productName))) {
        if (!isEmpty(category)) {

            if (CATEGORY_NAME.find(e => e === category.trim()) === undefined) {
                //Insert Category
            }
            //Insert Product
            productSide = true;
        } else {
            Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Cetagory"});
            $(`#dataTable > tbody > tr`).eq(index).find('td').eq(4).focus();
            productSide = false;
        }
    } else if (!isEmpty(productName) && PRODUCTS.hasOwnProperty(getKey(productName))) {
        productSide = true;
    } else {
        Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Product"});
        $(`#dataTable > tbody > tr`).eq(index).find('td').eq(3).focus();
        productSide = false;
    }

    if (!isEmpty(quantity)) {
        isQuantity = true;
    } else {
        Lobibox.notify('warning', {position: 'top right', msg: "Please Enter Quantity"});
        $(`#dataTable > tbody > tr`).eq(index).find('td').eq(5).focus();
        isQuantity = false;
    }

    if (!isEmpty(unit) && UNITS_NAME.find(e => e === unit.trim()) !== undefined) {
        isUnit = true;
    } else {
        Lobibox.notify('warning', {position: 'top right', msg: "Please Select Unit"});
        $(`#dataTable > tbody > tr`).eq(index).find('td').eq(6).focus();
        isUnit = false;
    }

    console.log(isUnit + "" + isQuantity + "" + productSide + "" + customerSide);

    return isUnit && isQuantity && productSide && customerSide && isWeight;
}

function counts() {

    let countOfCustomer = [];
    let countOfProducts = [];
    let totalWeight = 0;
    $(`#dataTable > tbody > tr`).each(function (index, el) {
        let customer = $(el).children().eq(0).text();
        let product = $(el).children().eq(3).text();
        let weight = parseFloat($(el).children().eq(7).text()).toFixed(2);
        if (!isEmpty(customer) && countOfCustomer.findIndex(element => element === customer) === -1) {
            countOfCustomer.push(customer);
        }

        if (!isEmpty(product) && countOfProducts.findIndex(element => element === product) === -1) {
            countOfProducts.push(product);
        }

        if (!isEmpty(weight)) {
            $(el).children().eq(7).text(weight);
            totalWeight += parseFloat(weight);
        }
    });
    $('.total-product').html(countOfProducts.length);
    $('.total-customer').html(countOfCustomer.length);
    $('.total-weight').html(formatMoney(totalWeight));
}

function insertCartonNumber(evnt) {
    if (evnt.keyCode === 45) {
        let cartonNumber = "";
        $(`#dataTable > tbody > tr`).each(function (index, el) {
            if (!isEmpty($(el).children().eq(2).text()) && index !== ($('#dataTable tbody tr').length - 1)) {
                cartonNumber = $(el).children().eq(2).text();
            }
        });

        if (cartonNumber.match(/^[0-9]+$/)) {
            cartonNumber = parseInt(cartonNumber) + 1;
        } else {
            let cartonIndex = cartonNumber.match(/[^\d]+|\d+/g);
            if (cartonIndex.length === 2) {
                if (cartonIndex[0].match(/^[A-Za-z]+$/)) {
                    cartonNumber = cartonIndex[0] + (parseInt(cartonIndex[1]) + 1);
                } else {
                    cartonNumber = (parseInt(cartonIndex[0]) + 1) + cartonIndex[1];
                }
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: "Invalid Carton Number"});
            }
        }
        $(`#dataTable > tbody > tr`).eq($(this).parent().index()).find('td').eq(2).text(cartonNumber);
    }
}

function removeRow() {
    var correctRow = $(this).parent().parent();
    var Table = correctRow.parent();
    if (correctRow.index() === 0) {
        Table.find('tr').eq(0).find('td').eq(0).text('');
        Table.find('tr').eq(0).find('td').eq(1).text('');
        Table.find('tr').eq(0).find('td').eq(2).text('1');
        Table.find('tr').eq(0).find('td').eq(3).text('');
        Table.find('tr').eq(0).find('td').eq(4).text('');
        Table.find('tr').eq(0).find('td').eq(5).text('');
        Table.find('tr').eq(0).find('td').eq(6).text('PCS');
        Table.find('tr').eq(0).find('td').eq(7).text('');
        Table.find('tr').eq(0).find('td').eq(0).focus();
        $('.total-product').html("0");
    } else {
        $(this).closest("tr").remove();
    }

    counts();
}

function startProcess() {
    if (!isEmpty(editShipment)) {
        $("#exporter").dropdown("set selected", editShipment.exporter);
        $('#shipment-number').html(`00${editShipment.shipment}`);
        shipmentStatus = editShipment.status;
        autocompleteForStatus(document.getElementById('shipment-status'), document.getElementById('toggle-status'), shipmentStatus);
        $('#shipment-status').val(editShipmentStatus);
        compressedEdited(editShipment[$('#shipment-status').val()].cartons);
    } else {
        autocompleteForStatus(document.getElementById('shipment-status'), document.getElementById('toggle-status'), shipmentStatus);
        $('.content-wrapper').removeClass('d-none');
        $('#loader').addClass('d-none');
    }
}

function getShipmentCount(value) {
    $('#shipment-number').html(`00${EXPORTER[getKey(value)].shipment}`);
}

function clearExporter() {
    $('#reference-no').val('');
    $('#exporter-name').val('');
    $('#contact-number').val('');
    $('#address').val('');
    $('#buyer').val('');
    $('#consignee').val('');
    $('#consignee-address').val('');
    $('#country-of-final-destination').val('');
    $('#country-of-origin-goods').val('');
    $('#port-of-discharge').val('');
    $('#port-of-loading').val('');
    $('#terms-of-delivery-and-payments').val('');
    $('#packing-charges').val('');
    $('#weight-charges').val('');
}

var autocompleteLinsterInput = "";

var stausConfiguration = {
    click: null,
    input: null,
    keydouwn: null
};

var autocompleteConfiguration = {};

function autocompleteForStatus(inp, inp2, arr) {
    /*the autocomplete function takes two arguments,
     the text field element and an array of possible autocompleted values:*/
    var currentFocus;

    inp2.addEventListener("click", stausConfiguration.click = function (e) {
        if (!isDown) {
            isDown = true;
            var a, b, i;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", inp.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items-header");
            /*append the DIV element as a child of the autocomplete container:*/
            inp.parentNode.appendChild(a);
            inp.parentNode.setAttribute('style', 'border-bottom-left-radius: 0; border-bottom-right-radius: 0;');
            /*for each item in the array...*/
            var itemsCount = 0;
            for (i = 0; i < arr.length; i++) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = arr[i];
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    compressedEdited(editShipment[inp.value].cartons);
                    /*close the list of autocompleted values,
                     (or any other open lists of autocompleted values:*/
                    closeAllLists();
                    e.preventDefault();
                });
                if (itemsCount <= 10) {
                    a.appendChild(b);
                    itemsCount++;
                }
            }
        } else {
            isDown = false;
            closeAllLists();
        }
    });

    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", stausConfiguration.input = function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items-header");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        this.parentNode.setAttribute('style', 'border-bottom-left-radius: 0; border-bottom-right-radius: 0;');
        /*for each item in the array...*/
        var itemsCount = 0;
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/

            if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    compressedEdited(editShipment[inp.value].cartons);
                    /*close the list of autocompleted values,
                     (or any other open lists of autocompleted values:*/
                    closeAllLists();
                    e.preventDefault();
                });
                if (itemsCount <= 10) {
                    a.appendChild(b);
                    itemsCount++;
                }
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", stausConfiguration.keydouwn = function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x)
            x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
             increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
             decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            closeAllLists();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x)
                    x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x)
            return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
         except the one passed as an argument:*/
        inp.parentNode.setAttribute('style', '');
        var x;
        x = document.getElementsByClassName("autocomplete-items-header");

        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        if (e.target.id !== "toggle-status") {
            closeAllLists(e.target);
        }
    });
}

function JqueryAutoComplete(inp, arr, option) {
    let nameofTag = Object.keys(autocompleteConfiguration).length;
    autocompleteConfiguration[nameofTag] = {element: inp, listners: {}};

    var currentFocus;

    inp.on('input', autocompleteConfiguration[nameofTag].listners['input'] = function (e) {
        let a, b, val = $(this).text();
        closeAllLists();
        val = $(this).text();
        if (!val) {
            return false;
        }
        currentFocus = -1;

        a = (inp.parent().index() > 2) ? $(`<div id='${$(this).attr('id')}autocomplete-list' class='autocomplete-items1'></div>`) :
                $(`<div id='${$(this).attr('id')}autocomplete-list' class='autocomplete-items'></div>`);

        a.appendTo($(this));

        $.each(arr.filter(value => value.substr(0, val.length).toUpperCase() === val.toUpperCase()), function (index, value) {
            b = $(`<div><strong>${value.substr(0, val.length)}</strong>${value.substr(val.length)}<input type='hidden' value='${value}'></div>`);
            b.click(function (e) {
                inp.text($(this).find('input').val());
                if (option === "1" && PRODUCTS.hasOwnProperty(getKey($(this).find('input').val()))) {
                    $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1).text(PRODUCTS[getKey($(this).find('input').val())].category);
                    $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2).focus();
                    selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2)[0]);
                } else if (option === "2" && CUSTOMER.hasOwnProperty($(this).find('input').val())) {
                    $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(1).text(CUSTOMER[$(this).find('input').val()].contact);
                    $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(3).focus();
                    selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2)[0]);
                } else if (option === "3" || option === "4") {
                    $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1).focus();
                    selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1)[0]);
                }
                closeAllLists();
                e.preventDefault();
            });
            if (index < 10) {
                b.appendTo(a);
            }
        });
    });

    inp.keydown(autocompleteConfiguration[nameofTag].listners['keydown'] = function (e) {
        var x = $(`#${$(this).attr('id')}autocomplete-list`);
        if (x)
            x = x.find('div');

        if (e.keyCode === 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode === 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode === 13) {
            e.preventDefault();
            closeAllLists();

            if (currentFocus > -1) {
                if (x) {
                    inp.text(x.eq(currentFocus).find('input').val());
                    if (option === "1" && PRODUCTS.hasOwnProperty(getKey(x.eq(currentFocus).find('input').val()))) {
                        $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1).text(PRODUCTS[getKey(x.eq(currentFocus).find('input').val())].category);
                        $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2).focus();
                        selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2)[0]);
                    } else if (option === "2" && CUSTOMER.hasOwnProperty(x.eq(currentFocus).find('input').val())) {
                        $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1).text(CUSTOMER[x.eq(currentFocus).find('input').val()].contact);
                        $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2).focus();
                        selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2)[0]);
                    } else if (option === "2") {
                        selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 2)[0]);
                    } else if (option === "3" || option === "4") {
                        $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1).focus();
                        selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1)[0]);
                    }
                    closeAllLists();
                }
            } else if (option === "2" || option === "3" || option === "4") {
                $(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1).focus();
                selectText($(`#dataTable > tbody > tr`).eq(inp.parent().index()).find('td').eq(inp.index() + 1)[0]);
            }
        }
    });

    function addActive(x) {
        if (!x)
            return false;
        removeActive(x);
        if (currentFocus >= x.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = (x.length - 1);
        x.eq(currentFocus).addClass("autocomplete-active");
    }
    function removeActive(x) {
        $(x).each(function () {
            $(this, '.autocomplete-active').removeClass("autocomplete-active");
        });
    }
    function closeAllLists(elmnt) {
        $('.autocomplete-items').each(function () {
            if ($(elmnt) !== $(this) && $(elmnt) !== inp) {
                $(this).remove();
            }
        });
        $('.autocomplete-items1').each(function () {
            if ($(elmnt) !== $(this) && $(elmnt) !== inp) {
                $(this).remove();
            }
        });
    }
    $(document).click(function (e) {
        if ($(this).attr('id') !== "toggle-status") {
            closeAllLists($(this));
        }
    });
}

function autocompleteInput(inp, arr, option) {
    var nameofTag = Object.keys(autocompleteConfiguration).length;
    autocompleteConfiguration[nameofTag] = {element: inp, listners: {}};
    /*the autocomplete function takes two arguments,
     the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", autocompleteConfiguration[nameofTag].listners['input'] = function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        var itemsCount = 0;
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/

            if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                     (or any other open lists of autocompleted values:*/
                    closeAllLists();
                    e.preventDefault();
                    if (option === "1") {
                        selctindex = 0;
                        document.getElementById('replaceProduct').focus();
                        document.getElementById('replaceProduct').select();
                        findProduct();
                    }
                });
                if (itemsCount <= 10) {
                    a.appendChild(b);
                    itemsCount++;
                }
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", autocompleteConfiguration[nameofTag].listners['keydown'] = function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x)
            x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
             increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
             decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            closeAllLists();
            if (option === "1") {
                if (isEmpty(document.getElementById('findProduct').value)) {
                    findedIndex = new Array();
                    selctindex = 0;
                    document.getElementById('findCount').innerHTML = "0/0";
                } else {
                    document.getElementById('replaceProduct').focus();
                    document.getElementById('replaceProduct').select();
                }
            }
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x)
                    x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x)
            return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
         except the one passed as an argument:*/
        var x;
        x = document.getElementsByClassName("autocomplete-items");

        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        if (e.target.id !== "toggle-status") {
            closeAllLists(e.target);
        }
    });
}


function JqueryAutoCompleteForInput(inp, arr) {
    let nameofTag = Object.keys(autocompleteConfiguration).length;
    autocompleteConfiguration[nameofTag] = {element: inp, listners: {}};

    var currentFocus;

    inp.on('input', autocompleteConfiguration[nameofTag].listners['input'] = function (e) {
        let a, b, val = $(this).val();
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        a = $(`<div id='${$(this).attr('id')}autocomplete-list' class='autocomplete-items'></div>`);
        $(this).parent().append(a);

        $.each(arr.filter(value => value.substr(0, val.length).toUpperCase() === val.toUpperCase()), function (index, value) {
            b = $(`<div><strong>${value.substr(0, val.length)}</strong>${value.substr(val.length)}<input type='hidden' value='${value}'></div>`);
            b.click(function (e) {
                inp.val($(this).find('input').val());
                closeAllLists();
                e.preventDefault();
            });
            if (index < 10) {
                b.appendTo(a);
            }
        });

    });

    inp.keydown(autocompleteConfiguration[nameofTag].listners['keydown'] = function (e) {
        var x = $(`#${$(this).attr('id')}autocomplete-list`);
        if (x)
            x = x.find('div');

        if (e.keyCode === 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode === 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode === 13) {
            e.preventDefault();
            closeAllLists();

            if (currentFocus > -1) {
                if (x) {
                    inp.val(x.eq(currentFocus).find('input').val());
                    closeAllLists();
                }
            }
        }
    });

    function addActive(x) {
        if (!x)
            return false;
        removeActive(x);
        if (currentFocus >= x.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = (x.length - 1);
        x.eq(currentFocus).addClass("autocomplete-active");
    }
    function removeActive(x) {
        $(x).each(function () {
            $(this, '.autocomplete-active').removeClass("autocomplete-active");
        });
    }
    function closeAllLists(elmnt) {
        $('.autocomplete-items').each(function () {
            if ($(elmnt) !== $(this) && $(elmnt) !== inp) {
                $(this).remove();
            }
        });
    }
    $(document).click(function (e) {
        if ($(this).attr('id') !== "toggle-status") {
            closeAllLists($(this));
        }
    });
}

$('#sync').click(sync);

function sync() {
    var Table = document.getElementById('customerTable');
    if (!isEmpty(Table.rows[0].cells[1].innerHTML) && !isEmpty(Table.rows[0].cells[3].innerHTML)) {
        var customerSide = {};
        for (var i = 0; i < Table.rows.length; i++) {
            customerSide[i] = [Table.rows[i].cells[0].innerHTML, Table.rows[i].cells[1].innerHTML, Table.rows[i].cells[2].innerHTML, Table.rows[i].cells[3].innerHTML];
        }

        var productTable = document.getElementById('productTable');
        var productSide = {};
        for (var i = 0; i < productTable.rows.length; i++) {
            productSide[i] = [productTable.rows[i].cells[0].innerHTML, productTable.rows[i].cells[1].innerHTML, productTable.rows[i].cells[2].innerHTML, productTable.rows[i].cells[3].innerHTML, productTable.rows[i].cells[4].innerHTML];
        }

        var weightTable = document.getElementById('weightTable');
        var weightSide = {};
        for (var i = 0; i < weightTable.rows.length; i++) {
            weightSide[i] = [weightTable.rows[i].cells[0].innerHTML, weightTable.rows[i].cells[1].innerHTML, weightTable.rows[i].cells[2].innerHTML, weightTable.rows[i].cells[3].innerHTML];
        }

        var shippingData = {
            customerSide: customerSide,
            productSide: productSide,
            weightSide: weightSide,
            expotrer: $("#exporter").dropdown("get value"),
            activeStatus: $('#shipment-status').val(),
            status: shipmentStatus
        };

        var savedKey = $("#exporter").dropdown("get value") + " SHIPMENT " + ((!isEmpty(editShipment)) ? editShipment.shipment : exporter[$("#exporter").dropdown("get value")].shipment);

        $.ajax({
            url: "/syncShipment",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({key: savedKey, data: shippingData}),
            beforeSend: function (xhr) {
                $('#sync').find('i').addClass('fa-spin fa-3x fa-fw');
            },
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                console.log(data.status);
                $('#sync').find('i').removeClass('fa-spin fa-3x fa-fw');
                if (data.status === "error") {
                    console.log("Error******************************");
                    console.log(JSON.stringify(data.error));
                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
                }
            }
        });
    }
}

$('#reset').click(function () {
    sync();
    reset();
});

function reset() {
    editShipment = null;
    pendingShipmentKey = null;
    editShipmentStatus = null;
    shipmentStatus = [];
    isTop = false;
    cartoonNumber = '0';
    findedIndex = new Array();
    selctindex = 0;
    countOfProducts = {};
    cartonNumerindex = 0;
    isReplace = true;
    $('#customerTable').html("");
    addEmptyCustomerRow();
    $('#productTable').html("");
    var productTable = document.getElementById('productTable');
    addEmptyProductRow(productTable, {rowIndex: 0});
    var evt = new KeyboardEvent('keydown', {'keyCode': 45, 'which': 45});
    productTable.rows[productTable.rows.length - 1].cells[0].dispatchEvent(evt);
    $('#weightTable').html("");
    $('.total-customer').html('0');
    $('#shipment-status').val('ORIGINAL');
    $('.total-product').html('0');
    $('.total-weight').html('0');
    $("#exporter").dropdown("set selected", 'ABEPE2529H');
    getShipmentCount('ABEPE2529H');
    $('#customerTab').click();
}

$('#save-shipment').click(saveShipment);

function saveShipment() {
    var Table = document.getElementById('customerTable');
    var weightSet = {};
    for (var i = 0; i < Table.rows.length; i++) {
        if (!isEmpty(Table.rows[i].cells[3].innerHTML)) {

            if (isEmpty(Table.rows[i].cells[1].innerHTML)) {
                Lobibox.notify('warning', {position: 'top right', msg: "Please enter customer Name"});
                Table.rows[i].cells[1].focus();
                return false;
            }

            if (Table.rows[i].cells[3].innerHTML.includes(":")) {
                Lobibox.notify('warning', {position: 'top right', msg: "Please solve the <b>:</b> symble"});
                $('#customerTab').click();
                Table.rows[i].cells[3].focus();
                return false;
            } else if (Table.rows[i].cells[3].innerHTML.includes("-")) {
                var cartons = Table.rows[i].cells[3].innerHTML.trim().toUpperCase().split("-");
                for (var c = 0; c < cartons.length; c++) {
                    weightSet[cartons[c]] = {
                        carton: cartons[c],
                        customer: Table.rows[i].cells[1].innerHTML.toUpperCase(),
                        products: [],
                        weight: 0
                    };
                }
            } else {
                weightSet[Table.rows[i].cells[3].innerHTML.toUpperCase()] = {
                    carton: Table.rows[i].cells[3].innerHTML.toUpperCase(),
                    customer: Table.rows[i].cells[1].innerHTML.toUpperCase(),
                    products: [],
                    weight: 0
                };
            }
        }
    }

    var productTable = document.getElementById('productTable');
    var tempCarton = 0;
    for (var i = 0; i < productTable.rows.length; i++) {
        if (!isEmpty(productTable.rows[i].cells[1].innerHTML) && !isEmpty(productTable.rows[i].cells[2].innerHTML) && !isEmpty(productTable.rows[i].cells[3].innerHTML) && !isEmpty(productTable.rows[i].cells[4].innerHTML)) {
            if (!isEmpty(productTable.rows[i].cells[0].innerHTML)) {
                tempCarton = productTable.rows[i].cells[0].innerHTML.trim().toUpperCase();
            }

            if (!isEmpty(weightSet[tempCarton])) {

                if (!isEmpty(productTable.rows[i].cells[1].innerHTML)) {
                    if (!isEmpty(productTable.rows[i].cells[3].innerHTML)) {
                        if (!isEmpty(productTable.rows[i].cells[4].innerHTML)) {
                            weightSet[tempCarton].products.push({
                                product: productTable.rows[i].cells[1].textContent.trim().toUpperCase(),
                                quantity: productTable.rows[i].cells[3].innerHTML.trim().toUpperCase(),
                                unit: productTable.rows[i].cells[4].innerHTML.trim().toUpperCase()
                            });
                        } else {
                            Lobibox.notify('warning', {position: 'top right', msg: `Please enter Unit`});
                            $('#productTab').click();
                            productTable.rows[i].cells[4].focus();
                            return false;
                        }
                    } else {
                        Lobibox.notify('warning', {position: 'top right', msg: `Please enter Quantity`});
                        $('#productTab').click();
                        productTable.rows[i].cells[3].focus();
                        return false;
                    }
                }

            } else {
                Lobibox.notify('warning', {position: 'top right', msg: `<b>${tempCarton}</b> this cartoon number miss in Customer side`});
                $('#customerTab').click();
                return false;
            }
        }
    }

    var isEligable = false;
    for (var ws in weightSet) {
        isEligable = true;
        if (weightSet[ws].products.length === 0) {
            console.log(weightSet);
            Lobibox.notify('warning', {position: 'top right', msg: `<b>${ws}</b> this cartoon number miss in Product side`});
            $('#productTab').click();
            productTable.rows[productTable.rows.length - 1].cells[0].focus();
            return false;
        }
    }

    var weightTable = document.getElementById('weightTable');
    for (var i = 0; i < weightTable.rows.length; i++) {
        if (!isEmpty(weightSet[weightTable.rows[i].cells[0].innerHTML.trim()])) {
            weightSet[weightTable.rows[i].cells[0].innerHTML.trim()].weight = weightTable.rows[i].cells[3].innerHTML;
        }
    }

    if (isEligable) {
        if (!isEmpty($('#shipment-status').val())) {
            var shipmentData = {
                shipment: parseInt($('#shipment-number').html()) + "",
                status: $('#shipment-status').val().trim().toUpperCase(),
                exporter: $("#exporter").dropdown("get value")
            };
            shipmentData[$('#shipment-status').val().trim().toUpperCase()] = {cartons: weightSet};
            $.ajax({
                url: "/addShipment",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({data: shipmentData, pending: pendingShipmentKey}),
                beforeSend: function (xhr) {
                    $('.content-wrapper').addClass('d-none');
                    $('#loader').removeClass('d-none');
                },
                headers: {
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN')
                },
                cache: false,
                success: function (data) {
                    if (data.status === "error") {
                        Lobibox.notify('warning', {position: 'top right', msg: data.error});
                    } else if (data.status === "success") {
                        exporter[data.data.exporter].shipment = data.data.shipment;
                        reset();
                        $('.content-wrapper').removeClass('d-none');
                        $('#loader').addClass('d-none');
                    }
                },
                error: function (xhr, status, error) {
                    var err = eval("(" + xhr.responseText + ")");
                    Lobibox.notify('warning', {position: 'top right', msg: err.Message});
                }
            }).done(function (msg) {
            });
        } else {
            Lobibox.notify('warning', {position: 'top right', msg: `Please enter Shipment Status`});
            $('#shipment-status').focus();
        }
    } else {
        Lobibox.notify('warning', {position: 'top right', msg: `Please complete your process`});
    }
}

destroy = function () {
    $(".nav li:nth-child(1)").find('img').addClass('activenac');
    for (var a in autocompleteConfiguration) {
        var currentElement = autocompleteConfiguration[a].element;
        var listners = autocompleteConfiguration[a].listners;
        for (var l in listners) {
//            currentElement.removeEventListener(l, listners[l]);
        }
    }
//    document.getElementById("toggle-status").removeEventListener("click", stausConfiguration.click);
//    document.getElementById("toggle-status").removeEventListener("input", stausConfiguration.input);
//    document.getElementById("shipment-status").removeEventListener("keydown", stausConfiguration.keydouwn);
    editShipment = null;
    shipmentStatus = [];
    clearInterval(synm);
    $('#shipmentStausBar').addClass('d-none');
    $('#daterangetagAndAutocomplter').addClass('d-none');
};

function openFindElement() {
    let messages = FIND_ELEMENTS.find('.messages');
    FIND_ELEMENTS.find('>i').hide();
    FIND_ELEMENTS.addClass('expand');
    FIND_ELEMENTS.find('.chat').addClass('enter');
    FIND_ELEMENTS.off('click', openFindElement);
    FIND_ELEMENTS.find('.header button').click(closeFindElement);
    messages.scrollTop(messages.prop("scrollHeight"));
    $('#findProduct').val("");
    $('#replaceProduct').val("");
    $('#findProduct').focus();
}

function closeFindElement() {
    FIND_ELEMENTS.find('.chat').removeClass('enter').hide();
    FIND_ELEMENTS.find('>i').show();
    FIND_ELEMENTS.removeClass('expand');
    FIND_ELEMENTS.find('.header button').off('click', closeFindElement);
    setTimeout(function () {
        FIND_ELEMENTS.find('.chat').removeClass('enter').show();
        FIND_ELEMENTS.click(openFindElement);
    }, 500);
}