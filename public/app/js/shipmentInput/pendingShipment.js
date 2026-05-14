var pendingShipmentKey=null;
function drawPendingSipmentNotifaction() {
    $('#notification-count').removeClass('d-none');
    $('#notifications').html("");
    $('#notifications').append(`<p class="mb-0 font-weight-normal float-left dropdown-header">Notifications</p>`);
    var index = 0;
    for (var ps in pendingShipments) {
        var a = document.createElement('div');
        a.setAttribute('class', 'dropdown-item');
        a.setAttribute('id', `notification-${index}`);


        var itemThumbnail = document.createElement('div');
        itemThumbnail.setAttribute('class', 'item-thumbnail');

        var itemIconGgSuccess = document.createElement('btn');
        itemIconGgSuccess.setAttribute('class', 'btn btn-inverse-danger item-icon btn-circle btn-sm');
        itemIconGgSuccess.setAttribute('onclick', `removeNotification('notification-${index}','${ps}');`);

        var i = document.createElement('i');
        i.setAttribute('class', 'mdi mdi-delete-variant mx-0');
        itemIconGgSuccess.appendChild(i);
        itemThumbnail.appendChild(itemIconGgSuccess);
        a.appendChild(itemThumbnail);

        var itemContent = document.createElement('div');
        itemContent.setAttribute('class', 'item-content');
        itemContent.setAttribute('onclick', `drawPendingShipment('notification-${index}','${ps}');`);

        var h6 = document.createElement('h6');
        h6.setAttribute('class', 'font-weight-normal');
        h6.innerHTML = ps;
        itemContent.appendChild(h6);

        var p = document.createElement('p');
        p.setAttribute('class', 'font-weight-light small-text mb-0 text-muted');
        p.setAttribute('style', 'font-size: 10px;');
        p.innerHTML = exporter[pendingShipments[ps].expotrer].exName;
        itemContent.appendChild(p);

        a.appendChild(itemContent);
        $('#notifications').append(a.outerHTML);
        index++;
    }
}

function removeNotification(id, shipmentID) {

    $.get(`/removePendingShipment?key=${shipmentID}`, function (data, status) {});

    $(`#${id}`).slideUp("slow", function () {
        if ($(`#${id}`).parent().children().length === 2) {
            $('#notification-count').addClass('d-none');
            $('#notifications').html("");
            $('#notifications').append(`<p class="mb-0 font-weight-normal float-left dropdown-header">Empty Notifications</p>`);
        } else {
            $(`#${id}`).remove();
        }
    });
}

function drawPendingShipment(id, shipmentID) {
    if ($(`#${id}`).parent().children().length === 2) {
        $('#notification-count').addClass('d-none');
        $('#notifications').html("");
        $('#notifications').append(`<p class="mb-0 font-weight-normal float-left dropdown-header">Empty Notifications</p>`);
    } else {
        $(`#${id}`).remove();
    }
    pendingShipmentKey=shipmentID;
    $("#exporter").dropdown("set selected", pendingShipments[shipmentID].expotrer);
    shipmentStatus = pendingShipments[shipmentID].status;
    autocompleteForStatus(document.getElementById('shipment-status'), document.getElementById('toggle-status'), shipmentStatus);
    $('#shipment-status').val(pendingShipments[shipmentID].activeStatus);
    $('#shipment-number').html(`00${pendingShipmentKey.split(' SHIPMENT ')[1]}`);
    drawCustomerTable(pendingShipments[shipmentID].customerSide);
    drawProductTable(pendingShipments[shipmentID].productSide);
    drawWeightTable(pendingShipments[shipmentID].weightSide);
}

function drawCustomerTable(editCustomers) {
    if (Object.keys(editCustomers).length > 0) {
        var Table = document.getElementById('customerTable');
        Table.innerHTML = "";

        for (var c in editCustomers) {
            var tr = Table.insertRow();

            var numberTd = tr.insertCell(0);
            numberTd.setAttribute('style', 'width: 5%');
            numberTd.setAttribute('class', 'table-padding-0');
            numberTd.innerHTML = editCustomers[c][0];

            var customerNameTd = tr.insertCell(1);
            customerNameTd.setAttribute('style', 'width: 25%;');
            customerNameTd.setAttribute('class', 'table-padding-0 uppecase autocomplete');
            customerNameTd.setAttribute('contenteditable', 'true');
            customerNameTd.innerHTML = editCustomers[c][1];

            var numberTd = tr.insertCell(2);
            numberTd.setAttribute('style', 'width: 20%');
            numberTd.setAttribute('contenteditable', 'true');
            numberTd.setAttribute('class', 'table-padding-0 uppecase contact next-column');
            numberTd.innerHTML = editCustomers[c][2];

            var cartoonsTd = tr.insertCell(3);
            cartoonsTd.setAttribute('style', 'width: 50%;');
            cartoonsTd.setAttribute('contenteditable', 'true');
            cartoonsTd.setAttribute('class', 'table-padding-0 uppecase carton-numbers');
            cartoonsTd.setAttribute('onkeypress', 'isNumberAndDash(event);');
            cartoonsTd.innerHTML = editCustomers[c][3];

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
        }
        autocomplete(Table.rows[Table.rows.length - 1].cells[1], customerName, "2");
        Table.rows[Table.rows.length - 1].cells[1].focus();
        $(".next-column").keypress(nextColumn);
        $(".contact").keydown(enforceFormat);
        $(".contact").keyup(formatToPhone);
        $('.total-customer').html(Table.rows.length);
    }
}

function drawProductTable(editProducts) {
    if (Object.keys(editProducts).length > 0) {
        var Table = document.getElementById('productTable');
        Table.innerHTML = "";

        for (var p in editProducts) {
            var tr = Table.insertRow();

            var numberTD = tr.insertCell(0);
            numberTD.setAttribute('style', 'width: 7%;');
            numberTD.setAttribute('class', 'table-padding-0 uppecase dash-validate next-column carton-number');
            numberTD.setAttribute('contenteditable', 'true');
            numberTD.innerHTML = editProducts[p][0];

            var nameTD = tr.insertCell(1);
            nameTD.setAttribute('style', 'width: 48%;');
            nameTD.setAttribute('class', 'table-padding-0 autocomplete uppecase');
            nameTD.setAttribute('contenteditable', 'true');
            nameTD.innerHTML = editProducts[p][1];
            autocomplete(nameTD, productsName, "1");

            var categoryTD = tr.insertCell(2);
            categoryTD.setAttribute('style', 'width: 20%;');
            categoryTD.setAttribute('class', 'table-padding-0 autocomplete uppecase');
            categoryTD.setAttribute('contenteditable', 'true');
            categoryTD.innerHTML = editProducts[p][2];
            autocomplete(categoryTD, categoryName, "3");

            var quantityTD = tr.insertCell(3);
            quantityTD.setAttribute('style', 'width: 10%;');
            quantityTD.setAttribute('class', 'table-padding-0 next-column text-right doubletd');
            quantityTD.setAttribute('contenteditable', 'true');
            quantityTD.innerHTML = editProducts[p][3];

            var unitTD = tr.insertCell(4);
            unitTD.setAttribute('style', 'width: 10%;');
            unitTD.setAttribute('class', 'table-padding-0 text-center autocomplete uppecase');
            unitTD.setAttribute('contenteditable', 'true');
            unitTD.innerHTML = editProducts[p][4];
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
        assignProductsCount(Table);
    }
}

function drawWeightTable(editWeights) {
    if (Object.keys(editWeights).length > 0) {
        var weightTable = document.getElementById('weightTable');
        weightTable.innerHTML = "";
        var totalWeight = 0;
        for (var w in editWeights) {
            var tr = weightTable.insertRow();

            var cartonTd = tr.insertCell(0);
            cartonTd.setAttribute('class', 'table-padding-0');
            cartonTd.setAttribute('style', 'width: 5%;');
            cartonTd.innerHTML = editWeights[w][0];

            var nameTd = tr.insertCell(1);
            nameTd.setAttribute('class', 'table-padding-0');
            nameTd.setAttribute('style', 'width: 75%;');
            nameTd.innerHTML = editWeights[w][1];

            var productsTd = tr.insertCell(2);
            productsTd.setAttribute('class', 'table-padding-0 text-center');
            productsTd.setAttribute('style', 'width: 10%;');
            productsTd.innerHTML = editWeights[w][2];

            var weightTd = tr.insertCell(3);
            weightTd.setAttribute('class', 'table-padding-0 text-right doubletd next-row-column paste calculate-total-weight');
            weightTd.setAttribute('style', 'width: 10%;');
            weightTd.setAttribute('contenteditable', 'true');
            weightTd.innerHTML = editWeights[w][3];
            totalWeight += parseFloat(editWeights[w][3]);
        }
        $('.total-weight').html(formatMoney(totalWeight));
        $(".doubletd").keypress(isNumberTD);
        $(".next-row-column").keypress(nextRawColumn);
        $(".calculate-total-weight").keypress(getTotalWeight);
        $('.paste').on('paste', false);
    }
}