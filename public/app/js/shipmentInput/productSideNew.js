var countOfProducts = {};
var cartonNumerindex = 0;
var element = $('.floating-chat');
var isReplace = true;

function addProductRow(row) {
    if (isValidProductRow(row)) {
        addProduct(row);
        var Table = row.parentNode;
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
    numberTD.setAttribute('class', 'table-padding-0');
    numberTD.innerHTML = `${(row.rowIndex + 1)}`;

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
    $(".special").keypress(ignoreSimble);

    nameTD.focus();
}

function removeProductOLD(row) {
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
    } else {
        Table = Table.parentNode;
        if (isEmpty(Table.rows[correctRow.rowIndex].cells[0].cinnerHTML)) {
            Table = correctRow.parentNode;
            Table.removeChild(correctRow);
        } else {
            correctRow.parentNode.removeChild(correctRow);
        }
    }
}


//FLOATING BUTTION FIND AND REPLACE
element.click(openElement);

$('#replace').click(() => {
    if (findedIndex.length > 0 && !isEmpty($('#replaceProduct').val().trim().toUpperCase())) {
        if (!isEmpty(products[getKey($('#replaceProduct').val().trim().toUpperCase())])) {
            $('#overviewTableMain > tbody').find(`tr:eq(${findedIndex[selctindex]})`).find('td:eq(2)').text($('#replaceProduct').val().trim().toUpperCase());
            findedIndex.splice(findedIndex.indexOf(findedIndex[selctindex]), 1);
            if (selctindex >= findedIndex.length) {
                selctindex = 0;
            }
            if (findedIndex.length === 0) {
                $('#findCount').html("0/0");
            } else {
                $(`#findCount`).html(`${selctindex + 1}/${findedIndex.length}`);
            }
            ;
            $('#overviewTableMain > tbody').find(`tr:eq(${findedIndex[selctindex]})`).find('td:eq(2)').focus();
            selectText($('#overviewTableMain > tbody').find(`tr:eq(${findedIndex[selctindex]})`).find('td:eq(2)')[0]);
        } else {
            isReplace = true;
            $('#productname').val($('#replaceProduct').val().trim().toUpperCase());
            $('#addProductReplaced').modal('show');
            $('#category').focus();
        }
    }
});

$('#replaceAll').click(() => {
    if (findedIndex.length > 0 && !isEmpty($('#replaceProduct').val().toUpperCase())) {
        if (!isEmpty(products[getKey($('#replaceProduct').val().trim().toUpperCase())])) {
            $.each(findedIndex, (i, value) => $('#overviewTableMain > tbody').find(`tr:eq(${value})`).find('td:eq(2)').text($('#replaceProduct').val().trim().toUpperCase()));
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

$('#findNext').click(() => {
    selctindex++;
    if (selctindex >= findedIndex.length) {
        selctindex = 0;
    }
    if (findedIndex.length > 0) {
        $(`#findCount`).html(`${selctindex + 1}/${findedIndex.length}`);
        $('#overviewTableMain > tbody').find(`tr:eq(${findedIndex[selctindex]})`).find('td:eq(2)').focus();
        selectText($('#overviewTableMain > tbody').find(`tr:eq(${findedIndex[selctindex]})`).find('td:eq(2)')[0]);
    }
});

$('#saveProduct').click(() => {
    if (!isEmpty($('#productname').val().trim())) {
        if (!isEmpty($('#category').val().trim())) {
            var cetagoryNameKey = getKey($('#category').val().trim().toUpperCase());
            if (isEmpty(category[cetagoryNameKey])) {
                var categoryData = {
                    isActive: true,
                    name: $('#category').val().trim().toUpperCase()
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
                    success: (data) => console.log(data.status)
                });
            }
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
                    } else if (data.status === "success") {
                        products[product] = ProductData;
                        productsName.push($('#productname').val().trim().toUpperCase());
                        $('#category').val("");
                        $('#productname').val("");
                        $('#addProductReplaced').modal('hide');
                        if (isReplace) {
                            $('#replace').click();
                        } else {
                            $('#replaceAll').click();
                        }
                    }
                },
                error: function (xhr, status, error) {
                    var err = eval("(" + xhr.responseText + ")");
                    Lobibox.notify('warning', {position: 'top right', msg: err.Message});
                }
            });
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
    var findProductName = $(`#findProduct`).val().trim().toUpperCase();
    if (findProductName) {
        $(`#overviewTableMain > tbody > tr`).each((row, tr) => {
            if ($(tr).find('td:eq(2)').text().trim().toUpperCase() === findProductName) {
                findedIndex.push($(tr).index());
            }
        });

        if (findedIndex.length > 0) {
            $(`#findCount`).html(`1/${findedIndex.length}`);
            if (selctindex > findedIndex[findedIndex.length - 1]) {
                selctindex = 0;
            }
            $('#overviewTableMain > tbody').find(`tr:eq(${findedIndex[selctindex]})`).find('td:eq(2)').focus();
            selectText($('#overviewTableMain > tbody').find(`tr:eq(${findedIndex[selctindex]})`).find('td:eq(2)')[0]);
        }
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
    $(`#findProduct`).val("");
    $(`#replaceProduct`).val("");
    $(`#findProduct`).focus();
}

function closeElement() {
    element.find('.chat').removeClass('enter').hide();
    element.find('>i').show();
    element.removeClass('expand');
    element.find('.header button').off('click', closeElement);
    setTimeout(function () {
        element.find('.chat').removeClass('enter').show();
        element.click(openElement);
    }, 500);
}