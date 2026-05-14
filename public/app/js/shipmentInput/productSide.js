var countOfProducts = {};
var cartonNumerindex = 0;
var element = $('.floating-chat');
var isReplace = true;

function addProductRow(row) {
    if (isValidProductRow(row)) {
        addProduct(row);
        var Table = row.parentNode;
        assignProductsCount(Table);
        addEmptyProductRow(Table, row);
    }
}

function isValidProductRow(row) {
    var Table = row.parentNode.parentNode;
    if (!isEmpty(Table.rows[row.rowIndex].cells[1].innerHTML)) {
        if (!isEmpty(Table.rows[row.rowIndex].cells[2].innerHTML)) {
            if (!isEmpty(Table.rows[row.rowIndex].cells[3].innerHTML)) {
                if (!isEmpty(Table.rows[row.rowIndex].cells[4].innerHTML)) {
                    return true;
                } else {
                    Table.rows[row.rowIndex].cells[4].focus();
                    Lobibox.notify('warning', {position: 'top right', msg: "Empty Unit"});
                    return false;
                }
            } else {
                Table.rows[row.rowIndex].cells[3].focus();
                Lobibox.notify('warning', {position: 'top right', msg: "Empty Quantity"});
                return false;
            }
        } else {
            Table.rows[row.rowIndex].cells[2].focus();
            Lobibox.notify('warning', {position: 'top right', msg: "Empty Product Category"});
            return false;
        }
    } else {
        Table.rows[row.rowIndex].cells[1].focus();
        Lobibox.notify('warning', {position: 'top right', msg: "Empty Product Name"});
        return false;
    }
}

function addProductOLD(row) {
    var Table = row.parentNode.parentNode;
    var product = getKey(Table.rows[row.rowIndex].cells[1].textContent.trim().toUpperCase());
    var isAvailable = products[product];
    if (isEmpty(isAvailable)) {
        addCategory(Table, row);
        var ProductData = {
            name: product,
            hscode: "",
            weight: 0,
            unit: "g",
            description: "",
            isActive: true,
            date: new Date().toString(),
            rate: "0.01",
            image: "",
            category: Table.rows[row.rowIndex].cells[1].textContent.trim().toUpperCase()
        };
        $.ajax({
            url: "/addProduct",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({key: product, data: ProductData}),
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                if (data.status === "error") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
                }
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                Lobibox.notify('warning', {position: 'top right', msg: err.Message});
            }
        });
        products[product] = ProductData;
        productsName.push(Table.rows[row.rowIndex].cells[1].textContent.trim().toUpperCase());
    }
}

function addProduct(row) {
    var Table = row.parentNode.parentNode;
    var product = getKey(Table.rows[row.rowIndex].cells[1].textContent.trim().toUpperCase());
    var isAvailable = products[product];
    if (isEmpty(isAvailable)) {
        addCategory(Table, row);
        var ProductData = {
            name: product,
            hscode: "",
            weight: 0,
            unit: "g",
            description: "",
            isActive: true,
            date: new Date().toString(),
            rate: "0.01",
            image: "",
            category: Table.rows[row.rowIndex].cells[2].textContent.trim().toUpperCase()
        };
        $.ajax({
            url: "/addProduct",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({key: product, data: ProductData}),
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                if (data.status === "error") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
                }
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                Lobibox.notify('warning', {position: 'top right', msg: err.Message});
            }
        });
        products[product] = ProductData;
        productsName.push(Table.rows[row.rowIndex].cells[1].textContent.trim().toUpperCase());
    }
}

function addCategory(Table, row) {
    var cetagoryNameKey = getKey(Table.rows[row.rowIndex].cells[2].textContent.trim().toUpperCase());
    if (isEmpty(category[getKey(Table.rows[row.rowIndex].cells[2].textContent.trim().toUpperCase())])) {
        var categoryData = {
            isActive: true,
            name: Table.rows[row.rowIndex].cells[2].textContent.trim().toUpperCase()
        };
        $.ajax({
            url: "/addCategory",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({key: cetagoryNameKey, data: categoryData}),
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                if (data.status === "error") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
                }
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                Lobibox.notify('warning', {position: 'top right', msg: err.Message});
            }
        });
        category[cetagoryNameKey] = categoryData;
        categoryName.push(Table.rows[row.rowIndex].cells[2].textContent.trim().toUpperCase());
    }
}

function addEmptyProductRow(Table, row) {
    var tr = Table.insertRow(row.rowIndex);

    var numberTD = tr.insertCell(0);
    numberTD.setAttribute('style', 'width: 7%;');
    numberTD.setAttribute('class', 'table-padding-0 uppecase dash-validate next-column carton-number');
    numberTD.setAttribute('contenteditable', 'true');

    var nameTD = tr.insertCell(1);
    nameTD.setAttribute('style', 'width: 48%;');
    nameTD.setAttribute('class', 'table-padding-0 autocomplete uppecase special');
    nameTD.setAttribute('contenteditable', 'true');
    autocomplete(nameTD, productsName, "1");

    var categoryTD = tr.insertCell(2);
    categoryTD.setAttribute('style', 'width: 20%;');
    categoryTD.setAttribute('class', 'table-padding-0 autocomplete uppecase');
    categoryTD.setAttribute('contenteditable', 'true');
    autocomplete(categoryTD, categoryName, "3");

    var quantityTD = tr.insertCell(3);
    quantityTD.setAttribute('style', 'width: 10%;');
    quantityTD.setAttribute('class', 'table-padding-0 next-column text-right doubletd');
    quantityTD.setAttribute('contenteditable', 'true');

    var unitTD = tr.insertCell(4);
    unitTD.setAttribute('style', 'width: 10%;');
    unitTD.setAttribute('class', 'table-padding-0 text-center autocomplete uppecase');
    unitTD.setAttribute('contenteditable', 'true');
    unitTD.innerHTML = "PCS";
    autocomplete(unitTD, unitsName, "4");

    var removeTd = tr.insertCell(5);
    removeTd.setAttribute('style', 'width: 1%; padding: 0');
    removeTd.setAttribute('class', 'table-padding-0 text-center');

    var removeButton = document.createElement('button');
    removeButton.setAttribute('onclick', 'removeProduct(this)');
    removeButton.setAttribute('class', 'btn btn-inverse-danger btn-rounded p-10');

    var removeI = document.createElement('i');
    removeI.setAttribute('class', 'mdi mdi-delete-variant');
    removeButton.appendChild(removeI);
    removeTd.appendChild(removeButton);

    $(".doubletd").keypress(isNumberTD);
    $(".next-column").keypress(nextColumn);
    $(".dash-validate").keypress(onlyOneDashForTD);
    $(".special").keypress(ignoreSimble);
    $(".carton-number").keydown(insertCartoonNumber);

    numberTD.focus();
}

function removeProduct(row) {
    var correctRow = row.parentNode.parentNode;
    var Table = correctRow.parentNode;
    if (correctRow.rowIndex === 1) {
        Table = Table.parentNode;
        Table.rows[1].cells[0].innerHTML = "1";
        Table.rows[1].cells[1].innerHTML = "";
        Table.rows[1].cells[2].innerHTML = "";
        Table.rows[1].cells[3].innerHTML = "";
        Table.rows[1].cells[4].innerHTML = "PCS";
        Table.rows[1].cells[1].focus();
        $('.total-product').html("0");
    } else {
        Table = Table.parentNode;
        if (isEmpty(Table.rows[correctRow.rowIndex].cells[0].cinnerHTML)) {
            Table = correctRow.parentNode;
            Table.removeChild(correctRow);
        } else {
            correctRow.parentNode.removeChild(correctRow);
        }
        assignProductsCount(Table);
    }
}

function assignProductsCount(Table) {
    countOfProducts = {};
    for (var i = 0; i < Table.rows.length; i++) {
        if (!isEmpty(Table.rows[i].cells[1].innerHTML.trim())) {
            countOfProducts[getKey(Table.rows[i].cells[1].innerHTML.trim().toUpperCase())] = Table.rows[i].cells[1].innerHTML.trim().toUpperCase();
        }
    }
    $('.total-product').html(Object.keys(countOfProducts).length);
}

function insertCartoonNumber(evnt) {
    if (evnt.keyCode === 45) {
        var Table = evnt.target.parentNode.parentNode;
        for (var i = 0; i < Table.rows.length; i++) {
            if (!isEmpty(Table.rows[i].cells[0].innerHTML) && i !== (Table.rows.length - 1)) {
                cartoonNumber = Table.rows[i].cells[0].innerHTML;
            }
        }
        if (cartoonNumber.match(/^[0-9]+$/)) {
            cartoonNumber = parseInt(cartoonNumber);
            cartoonNumber++;
        } else {
            var cartonIndex = cartoonNumber.match(/[^\d]+|\d+/g);
            if (cartonIndex.length === 2) {
                if (cartonIndex[0].match(/^[A-Za-z]+$/)) {
                    cartoonNumber = parseInt(cartonIndex[1]);
                    cartoonNumber++;
                    cartoonNumber = cartonIndex[0] + cartoonNumber;
                } else {
                    cartoonNumber = parseInt(cartonIndex[0]);
                    cartoonNumber++;
                    cartoonNumber = cartoonNumber + cartonIndex[1];
                }
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: "Invalid Carton Number"});
            }
        }

        evnt.target.innerHTML = cartoonNumber;
    }
}

function addProductRows(row) {
    var Table = row.parentNode.parentNode;
    isCartoonNumber(row.rowIndex, Table);
    if (!isEmpty(cartonNumerindex) && cartonNumerindex !== 0) {
        var cartonNumber = Table.rows[cartonNumerindex].cells[0].textContent;

        //Collect The Products of the Carton
        var ProductArray = new Array();
        for (var i = cartonNumerindex; i <= row.rowIndex; i++) {
            ProductArray.push({
                product: Table.rows[i].cells[1].textContent.trim(),
                category: Table.rows[i].cells[2].textContent.trim(),
                quantity: Table.rows[i].cells[3].textContent.trim(),
                unit: Table.rows[i].cells[4].textContent.trim()
            });
        }

        if (cartonNumber.includes(":")) {
            var cartonNumberArray = cartonNumber.split(":");
            if (cartonNumberArray.length === 2) {

                if (isValidProductRow(row)) {
                    addProduct(row);
                    var validData = getValidCarton(cartonNumberArray);
                    if (validData.isValid) {
                        var start = validData.data.start;
                        var end = validData.data.end;
                        var cartonIndex = "";
                        if (validData.data.isFront) {
                            cartonIndex = validData.data.text + start;
                        } else {
                            cartonIndex = start + validData.data.text;
                        }
                        Table.rows[cartonNumerindex].cells[0].innerHTML = cartonIndex;
                        start++;
                        for (var i = start; i <= end; i++) {

                            var isFirst = false;
                            for (var proa in ProductArray) {
                                var tr = Table.insertRow();

                                var numberTD = tr.insertCell(0);
                                numberTD.setAttribute('style', 'width: 7%;');
                                numberTD.setAttribute('class', 'table-padding-0 uppecase dash-validate next-column carton-number');
                                numberTD.setAttribute('contenteditable', 'true');
                                if (!isFirst) {
                                    if (validData.data.isFront) {
                                        cartonIndex = validData.data.text + i;
                                    } else {
                                        cartonIndex = i + validData.data.text;
                                    }
                                    numberTD.innerHTML = cartonIndex;
                                    isFirst = true;
                                }

                                var nameTD = tr.insertCell(1);
                                nameTD.setAttribute('style', 'width: 48%;');
                                nameTD.setAttribute('class', 'table-padding-0 autocomplete uppecase');
                                nameTD.setAttribute('contenteditable', 'true');
                                nameTD.innerHTML = ProductArray[proa].product;
                                autocomplete(nameTD, productsName, "1");

                                var categoryTD = tr.insertCell(2);
                                categoryTD.setAttribute('style', 'width: 20%;');
                                categoryTD.setAttribute('class', 'table-padding-0 autocomplete uppecase');
                                categoryTD.setAttribute('contenteditable', 'true');
                                categoryTD.innerHTML = ProductArray[proa].category;
                                autocomplete(categoryTD, categoryName, "3");

                                var quantityTD = tr.insertCell(3);
                                quantityTD.setAttribute('style', 'width: 10%;');
                                quantityTD.setAttribute('class', 'table-padding-0 next-column text-right doubletd');
                                quantityTD.setAttribute('contenteditable', 'true');
                                quantityTD.innerHTML = ProductArray[proa].quantity;

                                var unitTD = tr.insertCell(4);
                                unitTD.setAttribute('style', 'width: 10%;');
                                unitTD.setAttribute('class', 'table-padding-0 text-center autocomplete uppecase');
                                unitTD.setAttribute('contenteditable', 'true');
                                unitTD.innerHTML = ProductArray[proa].unit;
                                autocomplete(unitTD, unitsName, "4");

                                var removeTd = tr.insertCell(5);
                                removeTd.setAttribute('style', 'width: 1%; padding: 0');
                                removeTd.setAttribute('class', 'table-padding-0 text-center');

                                var removeButton = document.createElement('button');
                                removeButton.setAttribute('onclick', 'removeProduct(this)');
                                removeButton.setAttribute('class', 'btn btn-inverse-danger btn-rounded p-10');

                                var removeI = document.createElement('i');
                                removeI.setAttribute('class', 'mdi mdi-delete-variant');
                                removeButton.appendChild(removeI);
                                removeTd.appendChild(removeButton);
                            }
                            isFirst = false;
                        }
                        assignProductsCount(row.parentNode);
                        addEmptyProductRow(row.parentNode, Table.rows[row.parentNode.rows.length]);
                        var evt = new KeyboardEvent('keydown', {'keyCode': 45, 'which': 45});
                        Table.rows[row.parentNode.rows.length].cells[0].dispatchEvent(evt);
                        Table.rows[row.parentNode.rows.length].cells[1].focus();
                    } else {
                        Table.rows[row.parentNode.rows.length - 1].cells[1].focus();
                        Lobibox.notify('warning', {position: 'top right', msg: validData.msg});
                    }
                }
            } else {
                addProductRow(row);
            }
        } else {
            addProductRow(row);
        }
    } else {
        Table.rows[cartonNumerindex].cells[0].focus();
        Lobibox.notify('warning', {position: 'top right', msg: "Empty Carton Number"});
        return false;
    }
}

function isCartoonNumber(index, Table) {
    if (!isEmpty(Table.rows[index].cells[0].innerHTML)) {
        cartonNumerindex = index;
        return index;
    } else {
        if ((index - 1) != 0) {
            isCartoonNumber((index - 1), Table);
        } else {
            return 0;
        }
    }
}

function getValidCarton(arr) {
    if (arr.length === 2) {
        if (arr[0].match(/^[0-9]+$/) && arr[1].match(/^[0-9]+$/)) {
            if (parseInt(arr[0]) <= parseInt(arr[1])) {
                return {isValid: true, data: {isFront: false, text: "", start: parseInt(arr[0]), end: parseInt(arr[1])}};
            } else {
                return {isValid: false, msg: "Carton Number range are undifferent"};
            }
        } else {
            if (arr[0].match(/[^\d]+|\d+/g).length === 2 && arr[1].match(/[^\d]+|\d+/g).length === 2) {
                var startCartonn = arr[0].match(/[^\d]+|\d+/g);
                var secondCartonn = arr[1].match(/[^\d]+|\d+/g);
                if (startCartonn[0].match(/^[A-Za-z]+$/) && secondCartonn[0].match(/^[A-Za-z]+$/)) {
                    if (startCartonn[0].toUpperCase() === secondCartonn[0].toUpperCase()) {
                        if (parseInt(startCartonn[1]) <= parseInt(secondCartonn[1])) {
                            return {isValid: true, data: {isFront: true, text: startCartonn[0], start: parseInt(startCartonn[1]), end: parseInt(secondCartonn[1])}};
                        } else {
                            return {isValid: false, msg: "Carton Number range are undifferent"};
                        }
                    } else {
                        return {isValid: false, msg: "Invalid Carton Letter or Word"};
                    }
                } else if (startCartonn[1].match(/^[A-Za-z]+$/) && secondCartonn[1].match(/^[A-Za-z]+$/)) {
                    if (startCartonn[1].toUpperCase() === secondCartonn[1].toUpperCase()) {
                        if (parseInt(startCartonn[0]) <= parseInt(secondCartonn[0])) {
                            return {isValid: true, data: {isFront: false, text: startCartonn[1], start: parseInt(startCartonn[0]), end: parseInt(secondCartonn[0])}};
                        } else {
                            return {isValid: false, msg: "Carton Number range are undifferent"};
                        }
                    } else {
                        return {isValid: false, msg: "Invalid Carton Letter or Word"};
                    }
                } else {
                    return {isValid: false, msg: "Invalid Carton Number"};
                }
            } else {
                return {isValid: false, msg: "Invalid Carton Number"};
            }
        }
    } else {
        return {isValid: false, msg: "Invalid Carton Number"};
    }
}

element.click(openElement);

$('#replace').click(function () {
    if (findedIndex.length > 0 && !isEmpty($('#replaceProduct').val().trim().toUpperCase())) {
        if (!isEmpty(products[getKey($('#replaceProduct').val().trim().toUpperCase())])) {

            var Table = document.getElementById('productTable');
            Table.rows[findedIndex[selctindex]].cells[1].innerHTML = $('#replaceProduct').val().trim().toUpperCase();
            Table.rows[findedIndex[selctindex]].cells[2].innerHTML = products[getKey($('#replaceProduct').val().trim().toUpperCase())].category;
            findedIndex.splice(findedIndex.indexOf(findedIndex[selctindex]), 1);
            if (selctindex >= findedIndex.length) {
                selctindex = 0;
            }
            if (findedIndex.length === 0) {
                $('#findCount').html("0/0");
            } else {
                $('#findCount').html((selctindex + 1) + "/" + findedIndex.length);
            }
            Table.rows[findedIndex[selctindex]].cells[1].focus();
            selectText(Table.rows[findedIndex[selctindex]].cells[1]);
        } else {
            isReplace = true;
            $('#productname').val($('#replaceProduct').val().trim().toUpperCase());
            $('#addProductReplaced').modal('show');
            $('#category').focus();
        }
    }
});

$('#replaceAll').click(function () {
    if (findedIndex.length > 0 && !isEmpty($('#replaceProduct').val().toUpperCase())) {
        if (!isEmpty(products[getKey($('#replaceProduct').val().trim().toUpperCase())])) {
            var Table = document.getElementById('productTable');
            for (var i = 0; i < findedIndex.length; i++) {
                Table.rows[findedIndex[i]].cells[1].innerHTML = $('#replaceProduct').val().trim().toUpperCase();
                Table.rows[findedIndex[i]].cells[2].innerHTML = products[getKey($('#replaceProduct').val().trim().toUpperCase())].category;
            }
            findedIndex = new Array();
            selctindex = 0;
            $('#findCount').html("0/0");
        } else {
            isReplace = false;
            $('#productname').val($('#replaceProduct').val().trim().toUpperCase());
            $('#addProductReplaced').modal('show');
            $('#category').focus();
        }
    }
});

$('#findNext').click(function () {
    selctindex++;
    var Table = document.getElementById('productTable');
    if (selctindex >= findedIndex.length) {
        selctindex = 0;
    }
    if (findedIndex.length > 0) {
        document.getElementById('findCount').innerHTML = (selctindex + 1) + "/" + findedIndex.length;
        Table.rows[findedIndex[selctindex]].cells[1].focus();
        selectText(Table.rows[findedIndex[selctindex]].cells[1]);
    }
});

$('#saveProduct').click(function () {
    if (!isEmpty($('#productname').val())) {
        if (!isEmpty($('#category').val())) {
            var product = getKey($('#productname').val().trim().toUpperCase());
            var ProductData = {
                name: $('#productname').val().trim().toUpperCase(),
                hscode: "",
                weight: 0,
                unit: "g",
                description: "",
                isActive: true,
                date: new Date().toString(),
                rate: "0.01",
                image: "",
                category: $('#category').val().trim().toUpperCase()
            };
            $.ajax({
                url: "/addProduct",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({key: product, data: ProductData}),
                headers: {
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN')
                },
                cache: false,
                success: function (data) {
                    if (data.status === "error") {
                        Lobibox.notify('warning', {position: 'top right', msg: data.error});
                    }
                },
                error: function (xhr, status, error) {
                    var err = eval("(" + xhr.responseText + ")");
                    Lobibox.notify('warning', {position: 'top right', msg: err.Message});
                }
            });
            products[product] = ProductData;
            productsName.push($('#productname').val().trim().toUpperCase());
            $('#category').val("");
            $('#productname').val("");
            $('#addProductReplaced').modal('hide');
            if(isReplace){
                $('#replace').click();
            }else{
                $('#replaceAll').click();
            }
        } else {
            $('#category').focus();
            Lobibox.notify('warning', {position: 'top right', msg: "Please enter Category name"});
        }
    } else {
        $('#productname').focus();
        Lobibox.notify('warning', {position: 'top right', msg: "Please enter Product name"});
    }
});

function findProduct() {
    findedIndex = new Array();
    var findProductName = document.getElementById('findProduct').value;
    var Table = document.getElementById('productTable');
    for (var i = 0; i < Table.rows.length; i++) {
        if (!isEmpty(Table.rows[i].cells[1].innerHTML) && !isEmpty(findProductName) && findProductName.toUpperCase() === Table.rows[i].cells[1].innerHTML.toUpperCase()) {
            findedIndex.push(i);
        }
    }

    if (findedIndex.length > 0) {
        document.getElementById('findCount').innerHTML = "1/" + findedIndex.length;
        if (selctindex > findedIndex[findedIndex.length - 1]) {
            selctindex = 0;
        }
        Table.rows[findedIndex[selctindex]].cells[1].focus();
        selectText(Table.rows[findedIndex[selctindex]].cells[1]);
    }
}

function openElement() {
    var messages = element.find('.messages');
    element.find('>i').hide();
    element.addClass('expand');
    element.find('.chat').addClass('enter');
    element.off('click', openElement);
    element.find('.header button').click(closeElement);
    messages.scrollTop(messages.prop("scrollHeight"));
    document.getElementById('findProduct').value = "";
    document.getElementById('replaceProduct').value = "";
    document.getElementById('findProduct').focus();
}

function closeElement() {
    element.find('.chat').removeClass('enter').hide();
    element.find('>i').show();
    element.removeClass('expand');
    element.find('.header button').off('click', closeElement);
    setTimeout(function () {
        element.find('.chat').removeClass('enter').show()
        element.click(openElement);
    }, 500);
}