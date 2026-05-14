function addCustomerRow(evt) {
    if (isAddCustomerRow()) {
        addCustomer(evt);
        addEmptyCustomerRow();
    }
}

function addEmptyCustomerRow() {
    var Table = document.getElementById('customerTable');
    var lastNumber = 1;
    if (!isEmpty(Table.innerHTML)) {
        lastNumber = parseInt(Table.rows[Table.rows.length - 1].cells[0].innerHTML) + 1;
    }

    var tr = Table.insertRow();

    var numberTd = tr.insertCell(0);
    numberTd.setAttribute('style', 'width: 5%');
    numberTd.setAttribute('class', 'table-padding-0');
    numberTd.innerHTML = lastNumber;

    var customerNameTd = tr.insertCell(1);
    customerNameTd.setAttribute('style', 'width: 25%;');
    customerNameTd.setAttribute('class', 'table-padding-0 uppecase autocomplete');
    customerNameTd.setAttribute('contenteditable', 'true');

    var numberTd = tr.insertCell(2);
    numberTd.setAttribute('style', 'width: 20%');
    numberTd.setAttribute('contenteditable', 'true');
    numberTd.setAttribute('class', 'table-padding-0 uppecase contact next-column');

    var cartoonsTd = tr.insertCell(3);
    cartoonsTd.setAttribute('style', 'width: 50%;');
    cartoonsTd.setAttribute('contenteditable', 'true');
    cartoonsTd.setAttribute('class', 'table-padding-0 uppecase carton-numbers');
    cartoonsTd.setAttribute('onkeypress', 'isNumberAndDash(event);');

    var removeTd = tr.insertCell(4);
    removeTd.setAttribute('style', 'width: 1%; padding: 0');
    removeTd.setAttribute('class', 'table-padding-0 text-center');

    var removeButton = document.createElement('button');
    removeButton.setAttribute('onclick', 'removeCustomer(this)');
    removeButton.setAttribute('class', 'btn btn-inverse-danger btn-rounded p-10');

    var removeI = document.createElement('i');
    removeI.setAttribute('class', 'mdi mdi-delete-variant');
    removeButton.appendChild(removeI);
    removeTd.appendChild(removeButton);

    autocomplete(Table.rows[Table.rows.length - 1].cells[1], customerName, "2");
    Table.rows[Table.rows.length - 1].cells[1].focus();
    $(".next-column").keypress(nextColumn);
    $('.total-customer').html(Table.rows.length - 1);
    $(".contact").keydown(enforceFormat);
    $(".contact").keyup(formatToPhone);
}

function getCustomerCount() {

    if (isAddCustomerRow()) {
        var Table = document.getElementById('customerTable');
        if (!isEmpty(Table.rows[Table.rows.length - 1].cells[1].innerHTML) && !isEmpty(Table.rows[Table.rows.length - 1].cells[2].innerHTML)) {
            $('.total-customer').html(Table.rows.length);
        } else {
            $('.total-customer').html(Table.rows.length - 1);
        }
    }
}

function addCustomerOld(evt) {
    var Table = document.getElementById('customerTable');
    var rowIndex = evt.target.parentNode.rowIndex - 1;
    alert($('#customerTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(1)`).text().toUpperCase());
    var isAvailable = customer[getKey(Table.rows[rowIndex].cells[1].innerText.trim().toUpperCase())];
    if (isEmpty(isAvailable) || isAvailable.contact !== Table.rows[rowIndex].cells[2].innerText.trim().toUpperCase()) {
        var CustomerData = {
            address: "",
            city: "",
            contact: Table.rows[rowIndex].cells[2].innerText.trim().toUpperCase() || Table.rows[rowIndex].cells[2].innerHTML.trim().toUpperCase(),
            country: "",
            email: "",
            image: "",
            isActive: true,
            name: Table.rows[rowIndex].cells[1].innerText.trim().toUpperCase() || Table.rows[rowIndex].cells[1].innerHTML.trim().toUpperCase()
        };
//        $.ajax({
//            url: "/addCustomer",
//            type: "POST",
//            dataType: 'json',
//            data: JSON.stringify({key: getKey(Table.rows[rowIndex].cells[1].innerHTML.trim().toUpperCase()), data: CustomerData}),
//            headers: {
//                Accept: "application/json",
//                'Content-Type': 'application/json',
//                'CSRF-Token': Cookies.get('XSRF-TOKEN')
//            },
//            cache: false,
//            success: function (data) {
//                if (data.status === "error") {
//                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
//                }
//            },
//            error: function (xhr, status, error) {
//                var err = eval("(" + xhr.responseText + ")");
//                Lobibox.notify('warning', {position: 'top right', msg: err.Message});
//            }
//        });
//        customer[getKey(Table.rows[rowIndex].cells[1].innerHTML.trim().toUpperCase())] = CustomerData;
//        customerName.push(Table.rows[rowIndex].cells[1].innerHTML.trim().toUpperCase());
    }
}

function addCustomer(evt) {
    let name=$('#customerTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(1)`).text().toUpperCase();
    var isAvailable = customer[getKey(name)];
    if (isEmpty(isAvailable) || isAvailable.contact !== $('#customerTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(2)`).text().toUpperCase()) {
        var CustomerData = {
            address: "",
            city: "",
            contact: $('#customerTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(2)`).text().toUpperCase(),
            country: "",
            email: "",
            image: "",
            isActive: true,
            name: name
        };
        $.ajax({
            url: "/addCustomer",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({key: getKey(name), data: CustomerData}),
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
        customer[getKey(name)] = CustomerData;
        customerName.push(name);
    }
}

function isAddCustomerRow() {
    var Table = document.getElementById('customerTable');
    var cartons = new Array();
    var isAvailable = false;
    var isCartonnsAvailable = false;
    var CartonnsNoMain = 0;
    var isEmptys = false;
    var errorMessage = "Empty Value in";
    for (var i = 0; i < Table.rows.length; i++) {

        if (i !== Table.rows.length - 1 && isEmpty(Table.rows[i].cells[1].innerHTML)) {
            isEmptys = true;
            errorMessage += " Customer name at " + (i + 1);
            Table.rows[i].cells[1].focus();
            break;
        }

        if (i !== Table.rows.length - 1 && isEmpty(Table.rows[i].cells[3].innerHTML)) {
            isEmptys = true;
            errorMessage += " Cartons at " + (i + 1);
            Table.rows[i].cells[3].focus();
            break;
        }

        var cartonsLine = Table.rows[i].cells[3].innerHTML;
        if (cartonsLine.includes("-")) {
            var cartonsLineArray = cartonsLine.split("-");
            for (var cla in cartonsLineArray) {
                var isA = false;
                for (var ctns in cartons) {
                    if (cartons[ctns] === cartonsLineArray[cla]) {
                        isA = true;
                        break;
                    }
                }
                isCartonnsAvailable = isA;
                CartonnsNoMain = cartonsLineArray[cla].trim();
                if (!isA) {
                    cartons.push(cartonsLineArray[cla].trim());
                } else {
                    break;
                }
            }
        } else {
            for (ctns in cartons) {
                if (cartons[ctns] === cartonsLine.trim()) {
                    isCartonnsAvailable = true;
                    break;
                }
            }
            CartonnsNoMain = cartonsLine.trim();
            if (!isCartonnsAvailable) {
                cartons.push(cartonsLine.trim());
            }
        }
    }

    var customer = "";
    for (var i = 0; i < (Table.rows.length - 1); i++) {
        if (Table.rows[Table.rows.length - 1].cells[1].innerHTML.toString().toUpperCase() === Table.rows[i].cells[1].innerHTML.toString().toUpperCase()) {
            customer = Table.rows[Table.rows.length - 1].cells[1].innerHTML;
            Table.rows[Table.rows.length - 1].cells[1].focus();
            isAvailable = true;
            break;
        }
    }

    if (!isEmptys) {
        if (!isAvailable) {
            if (isValidatePhone(Table.rows[Table.rows.length - 1].cells[2].innerHTML)) {
                if (!isCartonnsAvailable) {

                    var str = Table.rows[Table.rows.length - 1].cells[3].innerHTML;
                    var notDuplicate = false;
                    var cartoonNo = 0;
                    if (str.includes("-")) {
                        var valuesArray = str.split("-");
                        var alreadySeen = new Array();
                        for (var va in valuesArray) {
                            var isA = false;
                            for (var al in alreadySeen) {
                                if (alreadySeen[al] === valuesArray[va]) {
                                    isA = true;
                                    break;
                                }
                            }
                            cartoonNo = valuesArray[va].trim();
                            notDuplicate = isA;
                            if (!isA) {
                                alreadySeen.push(valuesArray[va].trim());
                            } else {
                                break;
                            }
                        }
                    }

                    if (!notDuplicate) {
                        return true;
                    } else {
                        Lobibox.notify('warning', {position: 'top right', msg: `${cartoonNo} Carton Duplicate in This Line`});
                        return false;
                    }
                } else {
                    Lobibox.notify('warning', {position: 'top right', msg: `${CartonnsNoMain} Carton Duplicate`});
                    return false;
                }
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: `Invalid Conatct Number`});
                return false;
            }
        } else {
            Lobibox.notify('warning', {position: 'top right', msg: `${customer} already exist`});
            return false;
        }
    } else {
        Lobibox.notify('warning', {position: 'top right', msg: errorMessage});
        return false;
    }
}

function removeCustomer(row) {
    var correctRow = row.parentNode.parentNode;
    var Table = correctRow.parentNode;
    if (correctRow.rowIndex !== 1) {
        Table.removeChild(correctRow);
        Table = document.getElementById('customerTable');
        for (var i = 1; i < Table.rows.length; i++) {
            Table.rows[i].cells[0].innerHTML = i + 1;
        }
        $('.total-customer').html(Table.rows.length);
    } else {
        Table = Table.parentNode;
        Table.rows[1].cells[1].innerHTML = "";
        Table.rows[1].cells[2].innerHTML = "";
        Table.rows[1].cells[3].innerHTML = "";
        Table.rows[1].cells[1].focus();
        $('.total-customer').html("0");
    }
}

function isNumberAndDash(evt) {
    var Table = evt.target.parentNode.parentNode.parentNode;
    if (evt.keyCode === 13) {
        evt.preventDefault();
        evt.preventDefault();
        if (evt.target.innerHTML.includes(":")) {
            var validData = getCartonNumberSequence(evt.target.innerHTML.split(":"));
            if (validData.isValid) {
                var start = validData.data.start;
                var end = validData.data.end;
                var cartonIndex = evt.target.innerHTML.split(":")[0];
                var cartons = cartonIndex;
                start++;
                for (var i = start; i <= end; i++) {
                    if (validData.data.isFront) {
                        cartonIndex=`${validData.data.text} ${i}`;
                    } else {
                        cartonIndex=`${i} ${validData.data.text}`;
                    }
                    cartons += "-" + cartonIndex;
                }
                evt.target.innerHTML = cartons;
                positionCursor(evt.target, evt.target.innerHTML.length);
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: validData.msg});
            }
        } else {
            if (!isEmpty(Table.rows[evt.target.parentNode.rowIndex].cells[1].innerHTML)) {
                if (!isEmpty(Table.rows[evt.target.parentNode.rowIndex].cells[3].innerHTML)) {
                    addCustomerRow(evt);
                } else {
                    Lobibox.notify('warning', {position: 'top right', msg: "Empty cartons"});
                    Table.rows[evt.target.parentNode.rowIndex].cells[3].focus();
                }
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: "Empty Customer"});
                Table.rows[evt.target.parentNode.rowIndex].cells[1].focus();
            }
        }
    }

    if (isEmpty(evt.target.innerHTML) && (evt.keyCode === 58 || evt.keyCode === 45)) {
        evt.preventDefault();
    }

    if (evt.target.innerHTML.includes(":") && (evt.keyCode === 58 || evt.keyCode === 45)) {
        evt.preventDefault();
    }

    var str = evt.target.innerHTML;
    if (evt.keyCode === 45 && str.charAt(str.length - 1) === '-') {
        evt.preventDefault();
        return false;
    }
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode !== 58 && charCode !== 45 && charCode > 31 && (charCode < 48 || charCode > 57) && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
        evt.preventDefault();
        return false;
    }

    return true;
}

function getCartonNumberSequence(arr) {
    if (arr.length === 2) {
        if (!arr[1].includes("-")) {
            if (arr[0].includes("-")) {
                var numbers = arr[0].split("-");
                arr[0] = numbers[numbers.length - 1];
            }
            return getValidCarton(arr);
        } else {
            return {isValid: false, msg: "Invalid Carton Number! Please check carton numbers"};
        }
    } else {
        return {isValid: false, msg: "Invalid Carton Number"};
    }
}