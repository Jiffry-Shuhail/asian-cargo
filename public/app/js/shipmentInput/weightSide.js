function setWeightTable() {
    var Table = document.getElementById('customerTable');
    var weightSet = {};
    for (var i = 0; i < Table.rows.length; i++) {
        if (!isEmpty(Table.rows[i].cells[3].innerHTML)) {
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
                weightSet[tempCarton].products.push(productTable.rows[i].cells[1].innerHTML);
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: `<b>${tempCarton}</b> this cartoon number miss in Customer side`});
                $('#customerTab').click();
                return false;
            }
        }
    }

    for (var ws in weightSet) {
        if (weightSet[ws].products.length === 0) {
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
    weightTable.innerHTML = "";
    var totalWeight = 0;
    for (var ws in weightSet) {

        if (weightSet[ws].products.length === 0) {
            Lobibox.notify('warning', {position: 'top right', msg: `<b>${ws}</b> this cartoon number miss in Product side`});
            $('#productTab').click();
            productTable.rows[productTable.rows.length - 1].cells[0].focus();
            return false;
        }

        var tr = weightTable.insertRow();

        var cartonTd = tr.insertCell(0);
        cartonTd.setAttribute('class', 'table-padding-0');
        cartonTd.setAttribute('style', 'width: 5%;');
        cartonTd.innerHTML = ws;

        var nameTd = tr.insertCell(1);
        nameTd.setAttribute('class', 'table-padding-0');
        nameTd.setAttribute('style', 'width: 75%;');
        nameTd.innerHTML = weightSet[ws].customer;

        var productsTd = tr.insertCell(2);
        productsTd.setAttribute('class', 'table-padding-0 text-center');
        productsTd.setAttribute('style', 'width: 10%;');
        productsTd.innerHTML = weightSet[ws].products.length;

        var weightTd = tr.insertCell(3);
        weightTd.setAttribute('class', 'table-padding-0 text-right doubletd next-row-column paste calculate-total-weight');
        weightTd.setAttribute('style', 'width: 10%;');
        weightTd.setAttribute('contenteditable', 'true');
        weightTd.innerHTML = weightSet[ws].weight;
        totalWeight+=parseFloat(weightSet[ws].weight);
    }
    $('.total-weight').html(formatMoney(totalWeight));
    $(".doubletd").keypress(isNumberTD);
    $(".next-row-column").keypress(nextRawColumn);
    $(".calculate-total-weight").keypress(getTotalWeight);
    $('.paste').on('paste', false);
}

function getTotalWeight(evnt) {
    if (evnt.keyCode === 13) {
        evnt.preventDefault();
        $(evnt.target).html(parseFloat($(evnt.target).html()).toFixed(2));
        var totalWeight = 0;
         $('#weightTable tr').each(function() {
            totalWeight +=parseFloat($(this).find('td').eq(3).text().trim());
        });
        $('.total-weight').html(formatMoney(totalWeight));
    }
}
