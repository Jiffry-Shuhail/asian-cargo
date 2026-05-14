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
var customer = {};
var customerName = [];
var products = {};
var productsName = [];
var category = {};
var categoryName = [];
var units = {};
var unitsName = [];
var exporter = {};

var cartoonNumber = 0;
var findedIndex = new Array();
var selctindex = 0;
var isDown = false;
var isValidUpdateChacker = {isLodedExoter: false, isLoadedCustomer: false, isLodedProduct: false};
var isValidPendingChecker = {isLodedExoter: false, isLoadedPending: false};
var nextTab = '#productTab';

var pendingShipments = {};

var synm = setInterval(sync, 300000);

document.onkeydown = function (evt) {
    evt = evt || window.event;
    if (evt.ctrlKey && evt.keyCode === 83) {
        evt.preventDefault();
        $('#save-shipment').click();
    } else if (evt.keyCode === 9) {
        evt.preventDefault();
        $(nextTab).click();
    } else if (evt.ctrlKey && evt.keyCode === 70 && element.hasClass("enter")) {
        evt.preventDefault();
        if (element.hasClass("expand")) {
            element.find('.header button').click();
        } else {
            element.click();
        }
    }
};

$(function () {

    $(".nav li:nth-child(1)").find('img').removeClass('activenac');

    autocompleteForStatus(document.getElementById('shipment-status'), document.getElementById('toggle-status'), shipmentStatus);

    $.get("/getAllCustomers", function (data, status) {
        var response = JSON.parse(data);
        var customerData = response.data;
        for (var key in customerData) {
            if (isEmpty(customer[customerData[key].name.trim()])) {
                customer[customerData[key].name.trim()] = customerData[key];
                customerName.push(customerData[key].name.trim());
            }
        }
        if (!isEmpty(document.getElementById('customerTable'))) {
            document.getElementById('customerTable').rows[0].cells[1].focus();
            autocomplete(document.getElementById('customerTable').rows[0].cells[1], customerName, "2");
        }
        $(".contact").keydown(enforceFormat);
        $(".contact").keyup(formatToPhone);
        isValidUpdateChacker.isLoadedCustomer = true;
        if (isValidUpdateChacker.isLodedExoter && isValidUpdateChacker.isLoadedCustomer && isValidUpdateChacker.isLodedProduct) {
            startProcess();
        }
    });

    $.get("/getProducts", function (data, status) {
        var response = JSON.parse(data);
        var productData = response.data;
        for (var key in productData) {
            products[key] = productData[key];
            productsName.push(productData[key].name.trim());
        }
        if (!isEmpty(document.getElementById('productTable'))) {
            autocomplete(document.getElementById('productTable').rows[0].cells[1], productsName, "1");
            autocompleteInput(document.getElementById('findProduct'), productsName, "1");
            autocompleteInput(document.getElementById('replaceProduct'), productsName, "2");
            $(".special").keypress(ignoreSimble);
        }
        isValidUpdateChacker.isLodedProduct = true;
        if (isValidUpdateChacker.isLodedExoter && isValidUpdateChacker.isLoadedCustomer && isValidUpdateChacker.isLodedProduct) {
            startProcess();
        }
    });

    $.get("/getCategory", function (data, status) {
        var response = JSON.parse(data);
        var categorytData = response.data;
        for (var key in categorytData) {
            category[key] = categorytData[key];
            categoryName.push(categorytData[key].name.trim());
        }
        if (!isEmpty(document.getElementById('productTable'))) {
            autocomplete(document.getElementById('productTable').rows[0].cells[2], categoryName, "3");
        }
    });

    $.get("/getUnits", function (data, status) {
        var response = JSON.parse(data);
        var unitsData = response.data;
        for (var key in unitsData) {
            units[key] = unitsData[key];
            unitsName.push(unitsData[key].unit.trim());
        }
        if (!isEmpty(document.getElementById('productTable'))) {
            autocomplete(document.getElementById('productTable').rows[0].cells[4], unitsName, "4");
        }
        $(".doubletd").keypress(isNumberTD);
        $(".next-column").keypress(nextColumn);
        $(".dash-validate").keypress(onlyOneDashForTD);
    });

    $.get("/getExporter", function (data, status) {
        var response = JSON.parse(data);
        exporter = response.data;
        var values = [];
        values.push({name: "ADD EXPORTER", value: "ADD EXPORTER", className: {active: 'active', animating: 'animating', item: 'item'}});
        for (var e in exporter) {
            values.push({name: exporter[e].exName.trim(), value: e});
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

});

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
    $('#shipment-number').html(`00${exporter[getKey(value)].shipment}`);
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

function autocomplete(inp, arr, option) {
    var nameofTag = Object.keys(autocompleteConfiguration).length;
    autocompleteConfiguration[nameofTag] = {element: inp, listners: {}};
    /*the autocomplete function takes two arguments,
     the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", autocompleteConfiguration[nameofTag].listners['input'] = function (e) {
        var a, b, i, val = this.innerHTML;
        if (this.childElementCount > 0) {
            val = this.childNodes[0].nodeValue;
        }
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute('contenteditable', 'false');
        if (inp.parentNode.rowIndex > 2) {
            a.setAttribute("class", "autocomplete-items1");
            isTop = true;
        } else {
            a.setAttribute("class", "autocomplete-items");
            isTop = false;
        }
        /*append the DIV element as a child of the autocomplete container:*/
        this.appendChild(a);
        /*for each item in the array...*/
        var itemsCount = 0;
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/

            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                b.setAttribute('contenteditable', 'false');
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.innerHTML = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                     (or any other open lists of autocompleted values:*/
                    closeAllLists();
                    e.preventDefault();
                    if (option === "1") {
                        var Table = inp.parentNode.parentNode.parentNode;
                        if (!isEmpty(products[getKey(this.getElementsByTagName("input")[0].value)].category)) {
                            Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 1].innerHTML = products[getKey(this.getElementsByTagName("input")[0].value)].category;
                            Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 2].focus();
                            selectText(Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 2]);
                        } else {
                            Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 1].focus();
                            selectText(Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 1]);
                        }

                    } else if (option === "2") {
                        var Table = inp.parentNode.parentNode.parentNode;
                        var isCustomerExist = false;
                        var customerRow = 0;
                        for (var j = 0; j < Table.rows.length; j++) {
                            if (Table.rows[j].cells[1].innerHTML.trim().toUpperCase() === this.getElementsByTagName("input")[0].value.trim().toUpperCase() && j !== inp.parentNode.rowIndex) {
                                isCustomerExist = true;
                                customerRow = j;
                                break;
                            }
                        }
                        if (!isCustomerExist) {
                            if (!isEmpty(customer[this.getElementsByTagName("input")[0].value].contact)) {
                                Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 1].innerHTML = customer[this.getElementsByTagName("input")[0].value].contact;
                                Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 2].focus();
                                selectText(Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 2]);
                            } else {
                                Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 1].focus();
                                selectText(Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 1]);
                            }
                        } else {
                            Lobibox.notify('warning', {position: 'top right', msg: `This customer already exist at ${customerRow} line`});
                            Table.rows[inp.parentNode.rowIndex - 1].cells[inp.cellIndex + 2].focus();
                            positionCursor(Table.rows[inp.parentNode.rowIndex - 1].cells[inp.cellIndex + 2], Table.rows[inp.parentNode.rowIndex - 1].cells[inp.cellIndex + 2].innerHTML.length);
                            if (isEmpty(Table.rows[inp.parentNode.rowIndex].cells[inp.cellIndex + 2].innerHTML)) {
                                removeCustomer(inp.childNodes[0]);
                            }
                        }
                    }
                });
                if (itemsCount <= 10) {
                    if (inp.parentNode.parentNode.rowIndex > 2) {
                        a.prepend(b);
                    } else {
                        a.appendChild(b);
                    }
                    itemsCount++;
                }
            }
        }
    }, false);
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
        } else if (e.ctrlKey && e.keyCode == 13 && option === "4") {
            e.preventDefault();
            if (!isEmpty(e.srcElement.innerHTML)) {
                addProductRows(e.target.parentNode);
            }
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            closeAllLists();
            if (option === "1" || option === "2" || option === "3") {
                e.preventDefault();
                if (!isEmpty(e.target.innerHTML)) {
                    nextColumn(e);
                }
                e.preventDefault();
            }
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x)
                    x[currentFocus].click();
            } else {
                if (option === "4") {
                    e.preventDefault();
                    if (!isEmpty(e.target.innerHTML)) {
                        addProductRow(e.target.parentNode);
                    }
                }
            }
        }
    }, false);
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
        if (isTop) {
            x = document.getElementsByClassName("autocomplete-items1");
        } else {
            x = document.getElementsByClassName("autocomplete-items");
        }

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

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    e.target; // newly activated tab
    e.relatedTarget; // previous active tab

    e.target.classList.add("bg-light");
    e.relatedTarget.classList.remove("bg-light");


    if ($('.nav-tabs .active').children('div').eq(0).children('small').text().toUpperCase() === "Products".toUpperCase()) {
        var Table = document.getElementById('customerTable');
        if (isEmpty(Table.rows[0].cells[1].innerHTML) || isEmpty(Table.rows[0].cells[3].innerHTML)) {
            Lobibox.notify('warning', {position: 'top right', msg: "Please complete the Customer details"});
            nextTab = '#productTab';
            e.relatedTarget.click();
            closeElement();
            setTimeout(function () {
                element.removeClass('enter');
            }, 1000);
        } else {
            getCustomerCount();
            nextTab = '#weightTab';
            Table = document.getElementById('productTable');
            Table.rows[0].cells[1].focus();
            setTimeout(function () {
                element.addClass('enter');
            }, 1000);
        }
    } else if ($('.nav-tabs .active').children('div').eq(0).children('small').text().toUpperCase() === "Weight".toUpperCase()) {
        var Table = document.getElementById('productTable');
        if (isEmpty(Table.rows[0].cells[1].innerHTML) || isEmpty(Table.rows[0].cells[2].innerHTML) || isEmpty(Table.rows[0].cells[3].innerHTML)) {
            Lobibox.notify('warning', {position: 'top right', msg: "Please complete the Peoduct details"});
            nextTab = '#weightTab';
            e.relatedTarget.click();
        } else {
            if (!setWeightTable()) {
                assignProductsCount(document.getElementById('productTable'));
                nextTab = '#customerTab';
                Table = document.getElementById('weightTable');
                Table.rows[0].cells[3].focus();
                selectText(Table.rows[0].cells[3]);
            }
            closeElement();
            setTimeout(function () {
                element.removeClass('enter');
            }, 1000);
        }
    } else if ($('.nav-tabs .active').children('div').eq(0).children('small').text().toUpperCase() === "Customers".toUpperCase()) {
        if (document.getElementById('productTable').rows.length > 1) {
            assignProductsCount(document.getElementById('productTable'));
        }
        nextTab = '#productTab';
        var Table = document.getElementById('customerTable');
        Table.rows[Table.rows.length - 1].cells[1].focus();
        closeElement();
        setTimeout(function () {
            element.removeClass('enter');
        }, 1000);
    }
});

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
        if (!isEmpty(Table.rows[i].cells[3].innerText)) {

            if (isEmpty(Table.rows[i].cells[1].innerText)) {
                Lobibox.notify('warning', {position: 'top right', msg: "Please enter customer Name"});
                Table.rows[i].cells[1].focus();
                return false;
            }

            if(isEmpty(customer[getKey(Table.rows[i].cells[1].innerText.trim().toUpperCase())])){
                Lobibox.notify('warning', {position: 'top right', msg: `${Table.rows[i].cells[1].innerText.trim().toUpperCase()} This Customer is not Save properly. save again`});
                Table.rows[i].cells[1].focus();
                return false;
            }

            if (Table.rows[i].cells[3].innerText.includes(":")) {
                Lobibox.notify('warning', {position: 'top right', msg: "Please solve the <b>:</b> symble"});
                $('#customerTab').click();
                Table.rows[i].cells[3].focus();
                return false;
            } else if (Table.rows[i].cells[3].innerText.includes("-")) {
                var cartons = Table.rows[i].cells[3].innerText.trim().toUpperCase().split("-");
                for (var c = 0; c < cartons.length; c++) {
                    weightSet[cartons[c]] = {
                        carton: cartons[c],
                        customer: Table.rows[i].cells[1].innerText.toUpperCase(),
                        products: [],
                        weight: 0
                    };
                }
            } else {
                weightSet[Table.rows[i].cells[3].innerText.toUpperCase()] = {
                    carton: Table.rows[i].cells[3].innerText.toUpperCase(),
                    customer: Table.rows[i].cells[1].innerText.toUpperCase(),
                    products: [],
                    weight: 0
                };
            }
        }
    }

    var productTable = document.getElementById('productTable');
    var tempCarton = 0;
    for (var i = 0; i < productTable.rows.length; i++) {
        if (!isEmpty(productTable.rows[i].cells[1].innerText) && !isEmpty(productTable.rows[i].cells[2].innerText) && !isEmpty(productTable.rows[i].cells[3].innerText) && !isEmpty(productTable.rows[i].cells[4].innerText)) {
            if (!isEmpty(productTable.rows[i].cells[0].innerText)) {
                tempCarton = productTable.rows[i].cells[0].innerText.trim().toUpperCase();
            }

            if (!isEmpty(weightSet[tempCarton])) {

                if (!isEmpty(productTable.rows[i].cells[1].innerText)) {
                    if (!isEmpty(productTable.rows[i].cells[3].innerText)) {
                        if (!isEmpty(productTable.rows[i].cells[4].innerText)) {
                            if(!isEmpty(products[getKey(productTable.rows[i].cells[1].textContent.trim().toUpperCase())])){
                                if(unitsName.find(unName=>unName===productTable.rows[i].cells[4].innerText.trim().toUpperCase())){
                                    weightSet[tempCarton].products.push({
                                        product: productTable.rows[i].cells[1].textContent.trim().toUpperCase(),
                                        quantity: productTable.rows[i].cells[3].innerText.trim().toUpperCase(),
                                        unit: productTable.rows[i].cells[4].innerText.trim().toUpperCase()
                                    });
                                }else{
                                    Lobibox.notify('warning', {position: 'top right', msg: `Please enter Correct Unit on : Carton N0 :<b> ${tempCarton}</b> : Product <b>${productTable.rows[i].cells[1].textContent.trim().toUpperCase()}</b>`});
                                    $('#productTab').click();
                                    productTable.rows[i].cells[4].focus();
                                    return false;
                                }
                            }else{
                                Lobibox.notify('warning', {position: 'top right', msg: `<b>${productTable.rows[i].cells[1].textContent.trim().toUpperCase()}</b> : Carton N0 :<b>${tempCarton}</b> : This product is not Saved Properly Pleased Save Again`});
                                $('#productTab').click();
                                productTable.rows[i].cells[1].focus();
                                return false;
                            }
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
        if (!isEmpty(weightSet[weightTable.rows[i].cells[0].innerText.trim()])) {
            weightSet[weightTable.rows[i].cells[0].innerText.trim()].weight = weightTable.rows[i].cells[3].innerText;
        }
    }

    if (isEligable) {
        if (!isEmpty($('#shipment-status').val())) {
            var shipmentData = {
                shipment: parseInt($('#shipment-number').html()),
                status: $('#shipment-status').val().trim().toUpperCase(),
                exporter: $("#exporter").dropdown("get value"),
                index:exporter[getKey($("#exporter").dropdown("get value"))].shipment
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
            currentElement.removeEventListener(l, listners[l]);
        }
    }
    document.getElementById("toggle-status").removeEventListener("click", stausConfiguration.click);
    document.getElementById("toggle-status").removeEventListener("input", stausConfiguration.input);
    document.getElementById("shipment-status").removeEventListener("keydown", stausConfiguration.keydouwn);
    editShipment = null;
    shipmentStatus = [];
    clearInterval(synm);
    $('#shipmentStausBar').addClass('d-none');
    $('#daterangetagAndAutocomplter').addClass('d-none');
};