function compressedEdited(cartons) {
    var editCustomers = {};
    var editProducts = {};
    var editWeights = {};
    var asenKeys = Object.keys(cartons).sort(numbersAlphAscending);
    $.each(asenKeys, function (index, value) {
        let c=value;
        if (!isEmpty(editCustomers[cartons[c].customer])) {
            editCustomers[cartons[c].customer].cartons.push(cartons[c].carton);
        } else {
            console.log(cartons[c].customer);
            console.log(customer[cartons[c].customer]);
            editCustomers[cartons[c].customer] = {
                contact: customer[cartons[c].customer].contact,
                cartons: [cartons[c].carton]
            };
        }
        editProducts[cartons[c].carton] = cartons[c].products;
        editWeights[cartons[c].carton] = {
            weight: cartons[c].weight,
            customer: cartons[c].customer,
            products: cartons[c].products
        };
    });
    updateCuomerTable(editCustomers);
    updateProductTable(editProducts);
    updateWeightTable(editWeights);
}

function updateCuomerTable(editCustomers) {
    if (Object.keys(editCustomers).length > 0) {
        var Table = document.getElementById('customerTable');
        Table.innerHTML = "";
        var lastNumber = 1;

        for (var c in editCustomers) {
            var tr = Table.insertRow();

            var numberTd = tr.insertCell(0);
            numberTd.setAttribute('style', 'width: 5%');
            numberTd.setAttribute('class', 'table-padding-0');
            numberTd.innerHTML = lastNumber;

            var customerNameTd = tr.insertCell(1);
            customerNameTd.setAttribute('style', 'width: 25%;');
            customerNameTd.setAttribute('class', 'table-padding-0 uppecase autocomplete');
            customerNameTd.setAttribute('contenteditable', 'true');
            customerNameTd.innerHTML = c;

            var numberTd = tr.insertCell(2);
            numberTd.setAttribute('style', 'width: 20%');
            numberTd.setAttribute('contenteditable', 'true');
            numberTd.setAttribute('class', 'table-padding-0 uppecase contact next-column');
            numberTd.innerHTML = editCustomers[c].contact;

            var connectCartoons = editCustomers[c].cartons[0];
            var cartonsArray = editCustomers[c].cartons;
            for (var i = 1; i < cartonsArray.length; i++) {
                connectCartoons += "-" + cartonsArray[i];
            }

            var cartoonsTd = tr.insertCell(3);
            cartoonsTd.setAttribute('style', 'width: 50%;');
            cartoonsTd.setAttribute('contenteditable', 'true');
            cartoonsTd.setAttribute('class', 'table-padding-0 uppecase carton-numbers');
            cartoonsTd.setAttribute('onkeypress', 'isNumberAndDash(event);');
            cartoonsTd.innerHTML = connectCartoons;

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
            lastNumber++;
        }
        autocomplete(Table.rows[Table.rows.length - 1].cells[1], customerName, "2");
        Table.rows[Table.rows.length - 1].cells[1].focus();
        $(".next-column").keypress(nextColumn);
        $(".contact").keydown(enforceFormat);
        $(".contact").keyup(formatToPhone);
        $('.total-customer').html(Table.rows.length);
    }
}

function updateProductTable(editProducts) {
    if (Object.keys(editProducts).length > 0) {
        var Table = document.getElementById('productTable');
        Table.innerHTML = "";

        var asenKeys = Object.keys(editProducts).sort(numbersAlphAscending);
        $.each(asenKeys, function (index, value) {
            let p = value;

            var productArray = editProducts[p];
            for (var i = 0; i < productArray.length; i++) {
                var tr = Table.insertRow();

                var numberTD = tr.insertCell(0);
                numberTD.setAttribute('style', 'width: 7%;');
                numberTD.setAttribute('class', 'table-padding-0 uppecase dash-validate next-column carton-number');
                numberTD.setAttribute('contenteditable', 'true');
                if (i === 0) {
                    numberTD.innerHTML = p;
                }

                var nameTD = tr.insertCell(1);
                nameTD.setAttribute('style', 'width: 48%;');
                nameTD.setAttribute('class', 'table-padding-0 autocomplete uppecase');
                nameTD.setAttribute('contenteditable', 'true');
                nameTD.innerHTML = productArray[i].product;
                autocomplete(nameTD, productsName, "1");

                var categoryTD = tr.insertCell(2);
                categoryTD.setAttribute('style', 'width: 20%;');
                categoryTD.setAttribute('class', 'table-padding-0 autocomplete uppecase');
                categoryTD.setAttribute('contenteditable', 'true');
                console.log(productArray[i].product);
                console.log(products[getKey(productArray[i].product)]);
                categoryTD.innerHTML = products[getKey(productArray[i].product)].category;
                autocomplete(categoryTD, categoryName, "3");

                var quantityTD = tr.insertCell(3);
                quantityTD.setAttribute('style', 'width: 10%;');
                quantityTD.setAttribute('class', 'table-padding-0 next-column text-right doubletd');
                quantityTD.setAttribute('contenteditable', 'true');
                quantityTD.innerHTML = productArray[i].quantity;

                var unitTD = tr.insertCell(4);
                unitTD.setAttribute('style', 'width: 10%;');
                unitTD.setAttribute('class', 'table-padding-0 text-center autocomplete uppecase');
                unitTD.setAttribute('contenteditable', 'true');
                unitTD.innerHTML = productArray[i].unit;
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
        });
        assignProductsCount(Table);
    }
}

function updateWeightTable(editWeights) {
    if (Object.keys(editWeights).length > 0) {
        var weightTable = document.getElementById('weightTable');
        weightTable.innerHTML = "";
        var totalWeight = 0;
        var asenKeys = Object.keys(editWeights).sort(numbersAlphAscending);
        $.each(asenKeys, function (index, value) {
            let w = value;
            var tr = weightTable.insertRow();

            var cartonTd = tr.insertCell(0);
            cartonTd.setAttribute('class', 'table-padding-0');
            cartonTd.setAttribute('style', 'width: 5%;');
            cartonTd.innerHTML = w;

            var nameTd = tr.insertCell(1);
            nameTd.setAttribute('class', 'table-padding-0');
            nameTd.setAttribute('style', 'width: 75%;');
            nameTd.innerHTML = editWeights[w].customer;

            var productsTd = tr.insertCell(2);
            productsTd.setAttribute('class', 'table-padding-0 text-center');
            productsTd.setAttribute('style', 'width: 10%;');
            productsTd.innerHTML = editWeights[w].products.length;

            var weightTd = tr.insertCell(3);
            weightTd.setAttribute('class', 'table-padding-0 text-right doubletd next-row-column paste calculate-total-weight');
            weightTd.setAttribute('style', 'width: 10%;');
            weightTd.setAttribute('contenteditable', 'true');
            weightTd.innerHTML = editWeights[w].weight;
            totalWeight += parseFloat(editWeights[w].weight);
        });
        $('.total-weight').html(formatMoney(totalWeight));
        $(".doubletd").keypress(isNumberTD);
        $(".next-row-column").keypress(nextRawColumn);
        $(".calculate-total-weight").keypress(getTotalWeight);
        $('.paste').on('paste', false);
    }
}