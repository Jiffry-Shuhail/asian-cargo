$(function () {
    $('#customer-switch').click(function () {
        if (this.checked) {
            $("#weight-switch").prop("checked", true);
            $('.attachement-table thead tr:first-child th:nth-child(8)').show();
            $('.attachement-table thead tr:first-child th:nth-child(1)').show();
            $('.attachement-table thead tr:first-child th:nth-child(2)').show();
        } else {
            $("#weight-switch").prop("checked", false);
            $('.attachement-table thead tr:first-child th:nth-child(8)').hide();
            $('.attachement-table thead tr:first-child th:nth-child(1)').hide();
            $('.attachement-table thead tr:first-child th:nth-child(2)').hide();
        }
    });

    $('#weight-switch').click(function () {
        if (this.checked) {
            $('.attachement-table thead tr:first-child th:nth-child(8)').show();
        } else {
            $('.attachement-table thead tr:first-child th:nth-child(8)').hide();
        }
    });

    $('#excel').change(function (e) {
        $('#excel-btn').find('i').removeClass('d-none');
        $('#excel-btn').attr('disabled', 'true');
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
        if (regex.test(e.target.files[0].name.toLowerCase())) {
            var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    processExcel(e.target.result);
                };
                reader.readAsBinaryString(e.target.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    processExcel(data);
                };
                reader.readAsArrayBuffer(e.target.files[0]);
            }
        } else {
            $('#excel-btn').find('i').addClass('d-none');
            $('#excel-btn').removeAttr('disabled');
            Lobibox.notify('warning', {position: 'top right', msg: `Please upload a valid Excel file.`});
        }
    });

    $('#sample-xlsx').click(function () {
        var element = document.createElement('a');
        element.setAttribute('href', '/app/example/example.xlsx');
//        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    });

});

function processExcel(data) {
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    var check = property(excelRows);
    if (check.isValid) {
        var index = 1;
        var isRange = false;
        var lastCarton = "";
        var cartonsrange = null;
        var customerSide = {};
        var productSide = {};
        var productSide1 = {};
        var weightSide = {};
        var cartonProductCount = {};
        for (var x in excelRows) {
            index++;
            var Carton = "";
            if (excelRows[x].hasOwnProperty('Carton')) {
                Carton = excelRows[x].Carton+"";
            }
            console.log(Carton);
            if (Carton.includes("-")) {

                var cartons = getValidCarton(Carton.split("-"));
                if (cartons.isValid) {

                    cartonsrange = cartons.data;
                    isRange = true;
                    lastCarton = "";
                    for (var i = cartonsrange.start; i <= cartonsrange.end; i++) {
                        var cartonIndex = cartonsrange.text + i;
                        if (!cartonsrange.isFront) {
                            cartonIndex = i + cartonsrange.text;
                        }
                        cartonIndex = cartonIndex.toUpperCase();

                        var cartonData = getCarton(excelRows[x]);
                        if (cartonData.isValid) {

                            //Customer
                            if (cartonData.data.hasOwnProperty('customer')) {
                                var keyofCutomer = getKey(cartonData.data.customer.trim().toUpperCase());
                                if (customerSide.hasOwnProperty(keyofCutomer)) {
                                    customerSide[keyofCutomer][3] += "-" + cartonIndex;
                                } else {
                                    customerSide[keyofCutomer] = [Object.keys(customerSide).length + 1, cartonData.data.customer.trim().toUpperCase(), cartonData.data.contact, cartonIndex];
                                }
                            }

                            //Product
                            if (productSide1.hasOwnProperty(cartonIndex)) {
                                productSide1[cartonIndex].products.push([cartonIndex, cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]);
                            } else {
                                productSide1[cartonIndex] = {
                                    products: [[cartonIndex, cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]]
                                };
                            }

                            //Product Count
                            if (cartonProductCount.hasOwnProperty(cartonIndex)) {
                                cartonProductCount[cartonIndex] = 1;
                            } else {
                                cartonProductCount[cartonIndex] += 1;
                            }

                            //Weight
                            if (cartonData.data.hasOwnProperty('weight')) {
                                weightSide[cartonIndex] = [cartonIndex, cartonData.data.customer, 0, cartonData.data.weight];
                            }

                        } else {
                            $('#excel').val("");
                            $('#excel-btn').find('i').addClass('d-none');
                            $('#excel-btn').removeAttr('disabled');
                            Lobibox.notify('warning', {position: 'top right', msg: `${cartonData.msg} please check row at ${index}`});
                            break;
                        }
                    }

                } else {
                    $('#excel').val("");
                    $('#excel-btn').find('i').addClass('d-none');
                    $('#excel-btn').removeAttr('disabled');
                    Lobibox.notify('warning', {position: 'top right', msg: cartons.msg});
                    return;
                }

            } else if (/^[a-zA-Z0-9]+$/.test(Carton)) {

                var cartonData = getCarton(excelRows[x]);
                isRange = false;
                cartonsrange = null;
                if (cartonData.isValid) {
                    lastCarton = Carton;

                    //Customer
                    if (cartonData.data.hasOwnProperty('customer')) {
                        var keyofCutomer = getKey(cartonData.data.customer.trim().toUpperCase());
                        if (customerSide.hasOwnProperty(keyofCutomer)) {
                            customerSide[keyofCutomer][3] += "-" + Carton;
                        } else {
                            customerSide[keyofCutomer] = [Object.keys(customerSide).length + 1, cartonData.data.customer.trim().toUpperCase(), cartonData.data.contact, Carton];
                        }
                    }

                    //Product
                    if (productSide1.hasOwnProperty(Carton)) {
                        productSide1[Carton].products.push([Carton, cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]);
                    } else {
                        productSide1[Carton] = {
                            products: [[Carton, cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]]
                        };
                    }

                    //Product Count
                    if (cartonProductCount.hasOwnProperty(Carton)) {
                        cartonProductCount[Carton] = 1;
                    } else {
                        cartonProductCount[Carton] += 1;
                    }

                    //Weight
                    if (cartonData.data.hasOwnProperty('weight')) {
                        weightSide[Carton] = [Carton, cartonData.data.customer, 0, cartonData.data.weight];
                    }

                } else {
                    $('#excel').val("");
                    $('#excel-btn').find('i').addClass('d-none');
                    $('#excel-btn').removeAttr('disabled');
                    Lobibox.notify('warning', {position: 'top right', msg: `${cartonData.msg} please check row at ${index}`});
                    break;
                }

            } else if (isEmpty(Carton)) {

                var cartonData = getCarton(excelRows[x]);
                if (cartonData.isValid) {
                    if (isRange) {

                        for (var i = cartonsrange.start; i <= cartonsrange.end; i++) {
                            var cartonIndex = cartonsrange.text + i;
                            if (!cartonsrange.isFront) {
                                cartonIndex = i + cartonsrange.text;
                            }
                            cartonIndex = cartonIndex.toUpperCase();

                            //Customer
                            if (cartonData.data.hasOwnProperty('customer')) {
                                var keyofCutomer = getKey(cartonData.data.customer.trim().toUpperCase());
                                if (customerSide.hasOwnProperty(keyofCutomer)) {
                                    customerSide[keyofCutomer][3] += "-" + cartonIndex;
                                } else {
                                    customerSide[keyofCutomer] = [Object.keys(customerSide).length + 1, cartonData.data.customer.trim().toUpperCase(), cartonData.data.contact, cartonIndex];
                                }
                            }

                            //Product
                            if (productSide1.hasOwnProperty(cartonIndex)) {
                                productSide1[cartonIndex].products.push(['', cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]);
                            } else {
                                productSide1[cartonIndex] = {
                                    products: [['', cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]]
                                };
                            }

                            //Product Count
                            if (cartonProductCount.hasOwnProperty(cartonIndex)) {
                                cartonProductCount[cartonIndex] = 1;
                            } else {
                                cartonProductCount[cartonIndex] += 1;
                            }

                            //Weight
                            if (cartonData.data.hasOwnProperty('weight')) {
                                weightSide[cartonIndex] = [cartonIndex, cartonData.data.customer, 0, cartonData.data.weight];
                            }

                        }

                    } else {
                        //Customer
                        if (cartonData.data.hasOwnProperty('customer')) {
                            var keyofCutomer = getKey(cartonData.data.customer.trim().toUpperCase());
                            if (customerSide.hasOwnProperty(keyofCutomer)) {
                                customerSide[keyofCutomer][3] += "-" + lastCarton;
                            } else {
                                customerSide[keyofCutomer] = [Object.keys(customerSide).length + 1, cartonData.data.customer.trim().toUpperCase(), cartonData.data.contact, lastCarton];
                            }
                        }

                        //Product
                        if (productSide1.hasOwnProperty(lastCarton)) {
                            productSide1[lastCarton].products.push(['', cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]);
                        } else {
                            productSide1[lastCarton] = {
                                products: [['', cartonData.data.product, cartonData.data.category, cartonData.data.quantity, cartonData.data.unit]]
                            };
                        }

                        //Product Count
                        if (cartonProductCount.hasOwnProperty(lastCarton)) {
                            cartonProductCount[lastCarton] = 1;
                        } else {
                            cartonProductCount[lastCarton] += 1;
                        }

                        //Weight
                        if (cartonData.data.hasOwnProperty('weight')) {
                            weightSide[lastCarton] = [lastCarton, cartonData.data.customer, 0, cartonData.data.weight];
                        }
                    }

                } else {
                    $('#excel').val("");
                    $('#excel-btn').find('i').addClass('d-none');
                    $('#excel-btn').removeAttr('disabled');
                    Lobibox.notify('warning', {position: 'top right', msg: `${cartonData.msg} please check row at ${index}`});
                    break;
                }

            } else {
                $('#excel').val("");
                $('#excel-btn').find('i').addClass('d-none');
                $('#excel-btn').removeAttr('disabled');
                Lobibox.notify('warning', {position: 'top right', msg: `Invalid Carton Number please check row at ${index}`});
                return;
            }
        }

        for (var w in weightSide) {
            weightSide[w][2] = cartonProductCount[w];
        }

        for (var p in productSide1) {
            var products = productSide1[p].products;
            for (var i = 0; i < products.length; i++) {
                productSide[Object.keys(productSide).length] = products[i];
            }
        }

        drawCustomerTable(customerSide);
        drawProductTable(productSide);
        drawWeightTable(weightSide);
        $('#excel').val("");
        $('#excel-btn').find('i').addClass('d-none');
        $('#excel-btn').removeAttr('disabled');
        $('#shipmetnattachement').modal('hide');
    } else {
        $('#excel').val("");
        $('#excel-btn').find('i').addClass('d-none');
        $('#excel-btn').removeAttr('disabled');
        Lobibox.notify('warning', {position: 'top right', msg: check.msg});
    }
}

function getCarton(list) {

    var addCat = addCetegory(list.Category);

    if (!addCat.isValid) {
        return addCat;
    }

    var addPro = addAttchedProduct(list.Description, list.Category);
    if (!addPro.isValid) {
        return addPro;
    }

    var cartonObject = {
        product: list.Description,
        quantity: list.Quantity,
        unit: list.Unit,
        category: list.Category
    };

    if ($('#customer-switch').is(":checked")) {
        if (list.hasOwnProperty('Customer')) {
            if (list.hasOwnProperty('Contact')) {
                var isOkCustomer = addCutomer(list.Customer, list.Contact);
                if (isOkCustomer.isValid) {
                    cartonObject['customer'] = list.Customer;
                    cartonObject['contact'] = isOkCustomer.contact;
                } else {
                    return isOkCustomer;
                }
            } else {
                return {isValid: false, msg: 'Contact Property Not exist'};
            }
        }
    }

    if ($('#weight-switch').is(":checked")) {
        if (list.hasOwnProperty('Weight')) {
            if (!isEmpty(list.Weight)) {
                if ($.isNumeric(list.Weight)) {
                    cartonObject['weight'] = list.Weight;
                } else {
                    return {isValid: false, msg: 'Invalid Weight'};
                }
            } else {
                return {isValid: false, msg: 'Empty Weight'};
            }
        }
    }

    return {isValid: true, data: cartonObject};
}

function addAttchedProduct(product, category) {
    if (!isEmpty(product)) {

        var key = getKey(product.trim().toUpperCase());
        if (isEmpty(products[key])) {
            var ProductData = {
                name: product.trim().toUpperCase(),
                hscode: "",
                weight: 0,
                unit: "g",
                description: "",
                isActive: true,
                date: new Date().toString(),
                rate: "0.01",
                image: "",
                category: category.trim().toUpperCase()
            };
            $.ajax({
                url: "/addProduct",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({key: key, data: ProductData}),
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
            products[key] = ProductData;
            productsName.push(product.trim().toUpperCase());
            return {isValid: true};
        } else {
            return {isValid: true};
        }
    } else {
        return {isValid: false, msg: "Description is Empty"};
    }
}

function addCetegory(categoryNameA) {
    if (!isEmpty(categoryNameA)) {
        var cetagoryNameKey = getKey(categoryNameA.trim().toUpperCase());
        if (isEmpty(category[cetagoryNameKey])) {
            var categoryData = {
                isActive: true,
                name: categoryNameA.trim().toUpperCase()
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
            categoryName.push(categoryNameA.trim().toUpperCase());
            return {isValid: true};
        } else {
            return {isValid: true};
        }
    } else {
        return {isValid: false, msg: "Category is Empty"};
    }
}

function addCutomer(name, contact) {
    if (!isEmpty(name)) {
        if (!isEmpty(contact) && $.isNumeric(contact)) {
            contact = contact.replaceAll(/ /gi, '');
            if (!contact.startsWith("0") && contact.length === 9) {
                contact = '0' + contact;
            }

            if (contact.startsWith("+94") && contact.includes('+94')) {
                contact = contact.replace('+94', '0');
            }

            if (contact.startsWith("0094") && contact.includes('0094')) {
                contact = contact.replace('0094', '0');
            }

            if (contact.startsWith("94") && contact.includes('94')) {
                contact = contact.replace('94', '0');
            }

            if (contact.length === 10) {
                var input = contact.replace(/\D/g, '').substring(0, 10); // First ten digits of input only
                contact = `${input.substring(0, 3)} ${input.substring(3, 6)}  ${input.substring(6, 10)}`;
            } else {
                return {isValid: false, msg: "Invalid Contact"};
            }
        }
        var isAvailable = customer[getKey(name.trim().toUpperCase())];
        if (isEmpty(isAvailable) || isAvailable.contact !== contact.trim().toUpperCase()) {
            var CustomerData = {
                address: "",
                city: "",
                contact: contact.trim().toUpperCase(),
                country: "",
                email: "",
                image: "",
                isActive: true,
                name: name.toUpperCase()
            };
            $.ajax({
                url: "/addCustomer",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({key: getKey(name.trim().toUpperCase()), data: CustomerData}),
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
            return {isValid: true, contact: contact};
            customer[getKey(name.trim().toUpperCase())] = CustomerData;
            customerName.push(name.innerHTML.trim().toUpperCase());
        } else {
            return {isValid: true, contact: contact};
        }
    } else {
        return {isValid: false, msg: "Customer is Empty"};
    }
}

function property(excel) {
    excel = excel[0];
    if (excel.hasOwnProperty('Description')) {
        if (excel.hasOwnProperty('Quantity')) {
            if (excel.hasOwnProperty('Unit')) {
                return {isValid: true};
            } else {
                return {isValid: false, msg: 'Unit Property is dose not exist'};
            }
        } else {
            return {isValid: false, msg: 'Quantity Property is dose not exist'};
        }
    } else {
        return {isValid: false, msg: 'Description Property is dose not exist'};
    }
}