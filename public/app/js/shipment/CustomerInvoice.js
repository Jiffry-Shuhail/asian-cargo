var CUSTOMER_INVOICE_SHIPMENT;
var CUSTOMER_INVOICE_STATE;
var CUSTOMER_IN_SHIPMNET;
var CUSTOMER_IN_SHIPMNET_NO;

function CustomerInvoice(shipment, classname) {
    CUSTOMER_INVOICE_SHIPMENT = shipment;
    CUSTOMER_INVOICE_STATE = $(`.${classname}`).dropdown("get value");
    CUSTOMER_IN_SHIPMNET = shipments[CUSTOMER_INVOICE_SHIPMENT][CUSTOMER_INVOICE_STATE];

    if (CUSTOMER_IN_SHIPMNET.hasOwnProperty('customerInvoice')) {
        $('.isCustomerInvoicedCheck').show();
        $("#isCustomerInvoiced").prop('checked', true);
        makeCustomerInvoicePDF();
    } else {
        $('.isCustomerInvoicedCheck').hide();
        makeCustomerInvoice();
    }
}

function makeCustomerInvoice() {
    const Original = JSON.parse(JSON.stringify(shipments[CUSTOMER_INVOICE_SHIPMENT]));
    let parentShipment={};
    for(let prop in Original){
        parentShipment[prop] = Original[prop];
    }
    //let parentShipment =  JSON.parse(JSON.stringify(shipments[CUSTOMER_INVOICE_SHIPMENT]));
    var CUSTOMER_IN_SHIPMNET_NO = parentShipment.shipment;
    if (parentShipment.hasOwnProperty('editShipment')) {
        CUSTOMER_IN_SHIPMNET_NO = parentShipment.editShipment;
    }

    $('.customer-invoice-shipment').text(`SHIPMENT ${CUSTOMER_IN_SHIPMNET_NO}`);

    var shipDate = parentShipment.date;
    if (parentShipment.hasOwnProperty('editDate')) {
        shipDate = parentShipment.editDate;
    }
    shipDate = new Date(shipDate._seconds * 1000);

    shipDate = `${shipDate.getDate()}/${(shipDate.getMonth() + 1)}/${shipDate.getFullYear()}`;

    var customerData = {};

    $.each(CUSTOMER_IN_SHIPMNET.cartons, function (index, value) {
        if (customerData.hasOwnProperty(getKey(value.customer))) {
            customerData[getKey(value.customer)].weight += parseFloat(value.weight);
            customerData[getKey(value.customer)].cartons.push(value.carton);
            var cusProducts = customerData[getKey(value.customer)].products;
            //quantityAdjustment(cusProducts, value);
        } else {
            var data = {
                customer: value.customer,
                weight: parseFloat(value.weight),
                products: value.products,
                cartons: [value.carton],
                isUpdate: false,
                weightSet: []
            };

            var cusProducts = [];
            quantityAdjustment(cusProducts, value);
            data.products = cusProducts;
            customerData[getKey(value.customer)] = data;
        }
    });

    $.each(customerData, function (index, value) {
        console.log(value.customer);
        if (customers[getKey(value.customer)].hasOwnProperty('goodsWeight')) {
            var goodsWeight = customers[getKey(value.customer)].goodsWeight;
            $.each(value.products, function (index, value1) {
                var weightofGoods = goodsWeight.find(x => x.goods === value1.product || x.goods === products[getKey(value1.product)].category);
                if (weightofGoods !== undefined) {

                    var productweight = value.weight / value.products.length;
                    var data = {
                        weight: productweight,
                        amount: weightofGoods.price
                    };
                    if (weightofGoods.unit === 'KG') {
                        data['calWeight'] = productweight;
                        data['unit'] = "KG";
                    } else if (value1.unit === weightofGoods.unit) {
                        data['calWeight'] = value1.quantity;
                        data['unit'] = value1.unit;
                    } else {

                        var array = $.map(units, function (value, index) {
                            return [value];
                        });
                        var found = array.find(element => element.scale.find(elemnt1 => elemnt1.quantity === units[getKey(value1.unit)].reverse) && element.unit === weightofGoods.unit);
                        if (found !== undefined) {
                            data['calWeight'] = value1.quantity * units[getKey(value1.unit)].reverse;
                            data['unit'] = weightofGoods.unit;
                        } else {
                            data['calWeight'] = value1.quantity;
                            data['unit'] = value1.unit;
                        }
                    }
                    value.weight -= productweight;
                    value.isUpdate = true;
                    value.weightSet.push(data);
                }
            });
        }
    });

    $('#customerInvoice .table-responsive').html("");
    var topPadding = "";
    var invoiceCount = 0;
    $.each(customerData, function (index, value) {
        var defaultWeight = 225;
        if (customers[getKey(value.customer)].hasOwnProperty('defaultWeight')) {
            defaultWeight = customers[getKey(value.customer)].defaultWeight;
        }
        var defaultPacking = 225;
        if (customers[getKey(value.customer)].hasOwnProperty('defaultPacking')) {
            defaultPacking = customers[getKey(value.customer)].defaultPacking;
        }
        var thisTotal = value.cartons.length * defaultPacking;
        var thisWeight = value.weight;
        var weightDataCustomize = ``;
        if (value.isUpdate) {
            $.each(value.weightSet, function (index, value1) {
                weightDataCustomize += `<tr>
                            <td colspan="2" class="bolt w-20 cu-weight">WEIGHT</td>
                            <td contenteditable="" class="text-right cus-weght-change next-row-column doubletd paste cu-weight-value">${value1.calWeight.toFixed(2)}</td>
                            <td class="w-10 cu-weight-unit">${value1.unit}</td>
                            <td class="w-10">WP</td>
                            <td contenteditable="" class="text-right cus-weght-change next-row-column doubletd paste cu-weight-rate">${value1.amount.toFixed(2)}</td>
                            <td class="w-10">/=</td>
                            <td colspan="2" class="text-right amount">${(value1.calWeight * value1.amount).toFixed(2)}</td>
                            <td class="w-10 p-0">
                                <button class="btn btn-inverse-primary table-btn weight-add-row"><i class="mdi mdi-plus"></i></button>
                            </td>
                        </tr>`;
                thisTotal += value1.calWeight * value1.amount;
                thisWeight -= value1.weight;
            });
        } else {
            thisTotal += value.weight * defaultWeight;
        }
        var weightData = `<tr>
                            <td colspan="2" class="bolt w-20 cu-weight">WEIGHT</td>
                            <td contenteditable="" class="text-right cus-weght-change next-row-column doubletd paste cu-weight-value">${thisWeight.toFixed(2)}</td>
                            <td class="w-10 cu-weight-unit">KG</td>
                            <td class="w-10">WP</td>
                            <td contenteditable="" class="text-right cus-weght-change next-row-column doubletd paste cu-weight-rate">${defaultWeight.toFixed(2)}</td>
                            <td class="w-10">/=</td>
                            <td colspan="2" class="text-right amount">${(thisWeight * defaultWeight).toFixed(2)}</td>
                            <td class="w-10 p-0">
                                <button class="btn btn-inverse-primary table-btn weight-add-row"><i class="mdi mdi-plus"></i></button>
                            </td>
                        </tr>`;
        var table = `<table class="table table-bordered table-striped ${topPadding}">
                        <tr>
                            <th class="text-center" colspan="7" rowspan="2">ASIAN CARGO<br>INVOICE</th>
                            <th class="text-center" colspan="3" rowspan="2">ORIGINAL COPY</th>
                        </tr>
                        <tr></tr>
                        <tr>
                            <th colspan="2" class="w-20">DTAE</th>
                            <td colspan="2" class="cu-date">${shipDate}</td>
                            <td>&nbsp;</td>
                            <th colspan="2">INVOICE NO</th>
                            <td colspan="3" class="cu-invoice-number">SHIP ${CUSTOMER_IN_SHIPMNET_NO} | INV ${++invoiceCount}</td>
                        </tr>
                        <tr>
                            <th colspan="2" class="w-20">PARTY DETAILS</th>
                            <td colspan="8" class="bolt cu-name">${value.customer}</td>
                        </tr>
                        <tr>
                            <th colspan="2" class="w-20">MOBILE NUMBER</th>
                            <td colspan="8" class="bolt cu-contact">${customers[getKey(value.customer)].contact}</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20" >CARTON NO</td>
                            <td colspan="8" class="cu-cartons">${value.cartons.sort((a,b)=>a-b).join('-')}</td>
                        </tr>
                        ${weightData}
                        ${weightDataCustomize}
                        <tr>
                            <td colspan="2" class="bolt w-20 cu-packing">PACKING CHARGES</td>
                            <td colspan="3" class="text-right cus-packing-change integertd next-row-column paste cu-packing-value" contenteditable="">${value.cartons.length}</td>
                            <td contenteditable="" class="text-right cus-packing-change next-row-column doubletd paste cu-packing-rate">${defaultPacking.toFixed(2)}</td>
                            <td class="w-10">/=</td>
                            <td colspan="2" class="text-right amount">${(value.cartons.length * defaultPacking).toFixed(2)}</td>
                            <td class="w-10 p-0">
                                <button class="btn btn-inverse-primary table-btn pc-add-row"><i class="mdi mdi-plus"></i></button>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20 cu-others">WOOD BOX CHARGES</td>
                            <td colspan="5"></td>
                            <td colspan="3" class="text-right amount change-amount doubletd paste next-row-column" contenteditable="">0.00</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20 cu-others">NATAMA CHARGES</td>
                            <td colspan="5"></td>
                            <td colspan="3" class="text-right amount change-amount doubletd paste next-row-column" contenteditable="">0.00</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20 cu-others">TRANSPORT CHARGES</td>
                            <td colspan="5"></td>
                            <td colspan="3" class="text-right amount change-amount doubletd paste next-row-column" contenteditable="">0.00</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20 cu-others">PREVIOUS OUT STANDING</td>
                            <td colspan="5"></td>
                            <td colspan="3" class="text-right amount change-amount doubletd paste next-row-column" contenteditable="">0.00</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20">TOTAL CARTON NO</td>
                            <td colspan="5">${value.cartons.length}</td>
                            <td colspan="3" class="w-10 p-0"><button class="btn btn-inverse-primary fluid table-btn w-100 other-customer-add-row"><i class="mdi mdi-plus"></i></button></td>
                        </tr>
                        <tr>
                            <td colspan="7" class="bolt w-20">GRAND TOTAL</td>
                            <td colspan="3" class="text-right bolt grand-total">${thisTotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20">NOTE</td>
                            <td colspan="8" contenteditable="" class="cu-note"></td>
                        </tr>
                    </table>`;
        $('#customerInvoice .table-responsive').append(table);
        topPadding = "m-t-25";
    });

    $('.total-customer-invoices').text(`: TOTAL INVOICES  ${Object.keys(customerData).length}`);
    $(".doubletd").keypress(isNumberTD);
    $(".integertd").keypress(isIntNumber);
    $('.weight-remove-row').click(removeCutomerInvoiceRow);
    $('.cus-weght-change').keyup(cusWeghtChange);
    $('.pc-remove-row').click(removeCutomerInvoiceRow);
    $('.cus-packing-change').keyup(cusPackingChange);
    $('.pc-remove-row').click(removeCutomerInvoiceRow);
    $('.change-amount').keyup(function () {
        grandTotal($(this).parent().parent());
    });
    $('.weight-add-row').click(weightAddRow);
    $('.pc-add-row').click(packagingAddRow);
    $('.other-customer-add-row').click(otherCustomerAddRow);
    $('.paste').on('paste', false);
    $(".next-row-column").keypress(nextRawColumn);

    $("#pdf-customer-invoice-content").hide('fast');
    $("#edit-customer-invoice-content").show('fast');
    if (!$('#customerInvoice').is(":visible")) {
        $('#customerInvoice').modal({backdrop: 'static',keyboard: false}).modal('show');
    }
}

function editCustomerInvoice() {
    var parentShipment = shipments[CUSTOMER_INVOICE_SHIPMENT];
    var CUSTOMER_IN_SHIPMNET_NO = parentShipment.shipment;
    if (parentShipment.hasOwnProperty('editShipment')) {
        CUSTOMER_IN_SHIPMNET_NO = parentShipment.editShipment;
    }

    $('.customer-invoice-shipment').text(`SHIPMENT ${CUSTOMER_IN_SHIPMNET_NO}`);

    var shipDate = parentShipment.date;
    if (parentShipment.hasOwnProperty('editDate')) {
        shipDate = parentShipment.editDate;
    }
    shipDate = new Date(shipDate._seconds * 1000);

    shipDate = `${shipDate.getDate()}/${(shipDate.getMonth() + 1)}/${shipDate.getFullYear()}`;

    $('#customerInvoice .table-responsive').html("");
    var topPadding = "";
    $.each(CUSTOMER_IN_SHIPMNET.customerInvoice, function (index, value) {
        var thisTotal = 0;
        var weightDataCustomize = ``;
        $.each(value.weight, function (index1, value1) {
            var addOrRemove = `<button class="btn btn-inverse-primary table-btn weight-add-row"><i class="mdi mdi-plus"></i></button>`;
            if (index1 !== 0) {
                addOrRemove = `<button class="btn btn-inverse-danger table-btn weight-remove-row"><i class="mdi mdi-close"></i></button>`;
            }
            weightDataCustomize += `<tr>
                            <td colspan="2" class="bolt w-20 cu-weight">${value1.name}</td>
                            <td contenteditable="" class="text-right cus-weght-change next-row-column doubletd paste cu-weight-value">${value1.weight}</td>
                            <td class="w-10 cu-weight-unit">${value1.unit}</td>
                            <td class="w-10">WP</td>
                            <td contenteditable="" class="text-right cus-weght-change next-row-column doubletd paste cu-weight-rate">${value1.rate.toFixed(2)}</td>
                            <td class="w-10">/=</td>
                            <td colspan="2" class="text-right amount">${(value1.weight * value1.rate).toFixed(2)}</td>
                            <td class="w-10 p-0">${addOrRemove}</td>
                        </tr>`;
            thisTotal += value1.weight * value1.rate;
        });

        var totalCount = 0;
        var packagingData = ``;
        $.each(value.packing, function (index1, value1) {
            var addOrRemove = `<button class="btn btn-inverse-primary table-btn pc-add-row"><i class="mdi mdi-plus"></i></button>`;
            if (index1 !== 0) {
                addOrRemove = `<button class="btn btn-inverse-danger table-btn pc-remove-row"><i class="mdi mdi-close"></i></button>`;
            }
            totalCount += value1.count;
            packagingData += `<tr>
                            <td colspan="2" class="bolt w-20 cu-packing">${value1.name}</td>
                            <td colspan="3" class="text-right cus-packing-change integertd next-row-column paste cu-packing-value" contenteditable="">${value1.count}</td>
                            <td contenteditable="" class="text-right cus-packing-change next-row-column doubletd paste cu-packing-rate">${value1.rate.toFixed(2)}</td>
                            <td class="w-10">/=</td>
                            <td colspan="2" class="text-right amount">${(value1.count * value1.rate).toFixed(2)}</td>
                            <td class="w-10 p-0">${addOrRemove}</td>
                        </tr>`;
            thisTotal += value1.count * value1.rate;
        });
        var othersData = ``;
        $.each(value.others, function (index1, value1) {
            var remove = ``;
            var cols = `3`;
            if (index1 > 3) {
                cols = `2`;
                remove = `<td class="w-10 p-0">
                                <button class="btn btn-inverse-danger table-btn pc-remove-row"><i class="mdi mdi-close"></i></button>
                            </td>`;
            }
            othersData += `<tr>
                            <td colspan="2" class="bolt w-20 cu-others">${value1.name}</td>
                            <td colspan="5"></td>
                            <td colspan="${cols}" class="text-right amount change-amount doubletd paste next-row-column" contenteditable="">${value1.rate.toFixed(2)}</td>
                            ${remove}
                        </tr>`;
            thisTotal += value1.rate;
        });
        var table = `<table class="table table-bordered table-striped ${topPadding}">
                        <tr>
                            <th class="text-center" colspan="7" rowspan="2">ASIAN CARGO<br>INVOICE</th>
                            <th class="text-center" colspan="3" rowspan="2">ORIGINAL COPY</th>
                        </tr>
                        <tr></tr>
                        <tr>
                            <th colspan="2" class="w-20">DTAE</th>
                            <td colspan="2" class="cu-date">${value.date}</td>
                            <td>&nbsp;</td>
                            <th colspan="2">INVOICE NO</th>
                            <td colspan="3" class="cu-invoice-number">${value.invNo}</td>
                        </tr>
                        <tr>
                            <th colspan="2" class="w-20">PARTY DETAILS</th>
                            <td colspan="8" class="bolt cu-name">${value.name}</td>
                        </tr>
                        <tr>
                            <th colspan="2" class="w-20">MOBILE NUMBER</th>
                            <td colspan="8" class="bolt cu-contact">${value.contact}</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20" >CARTON NO</td>
                            <td colspan="8" class="cu-cartons">${value.cartons}</td>
                        </tr>
                        ${weightDataCustomize}
                        ${packagingData}
                        ${othersData}
                        <tr>
                            <td colspan="2" class="bolt w-20">TOTAL CARTON NO</td>
                            <td colspan="5">${totalCount}</td>
                            <td colspan="3" class="w-10 p-0"><button class="btn btn-inverse-primary fluid table-btn w-100 other-customer-add-row"><i class="mdi mdi-plus"></i></button></td>
                        </tr>
                        <tr>
                            <td colspan="7" class="bolt w-20">GRAND TOTAL</td>
                            <td colspan="3" class="text-right bolt grand-total">${thisTotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="bolt w-20">NOTE</td>
                            <td colspan="8" contenteditable="" class="cu-note"></td>
                        </tr>
                    </table>`;
        $('#customerInvoice .table-responsive').append(table);
        topPadding = "m-t-25";
    });

    $('.total-customer-invoices').text(`: TOTAL INVOICES  ${CUSTOMER_IN_SHIPMNET.customerInvoice.length}`);
    $(".doubletd").keypress(isNumberTD);
    $(".integertd").keypress(isIntNumber);
    $('.weight-remove-row').click(removeCutomerInvoiceRow);
    $('.cus-weght-change').keyup(cusWeghtChange);
    $('.pc-remove-row').click(removeCutomerInvoiceRow);
    $('.cus-packing-change').keyup(cusPackingChange);
    $('.change-amount').keyup(function () {
        grandTotal($(this).parent().parent());
    });
    $('.weight-add-row').click(weightAddRow);
    $('.pc-add-row').click(packagingAddRow);
    $('.other-customer-add-row').click(otherCustomerAddRow);
    $('.paste').on('paste', false);
    $(".next-row-column").keypress(nextRawColumn);

    if ($('#pdf-customer-invoice-content').is(":visible")) {
        $("#pdf-customer-invoice-content").hide('fast');
        $("#edit-customer-invoice-content").show('fast');
    }
    if (!$('#customerInvoice').is(":visible")) {
        $('#customerInvoice').modal({backdrop: 'static',keyboard: false}).modal('show');
    }
}

function quantityAdjustment(cusProducts, value) {
    $.each(value.products, function (index, value1) {
        var pro = cusProducts.find(x => x.product === value1.product);
        if (pro !== undefined) {
            if (value1.unit === pro.unit) {
                pro.quantity += parseFloat(value1.quantity);
            } else if (units[getKey(pro.unit)].isReverse) {


                var array = $.map(units, function (value, index) {
                    return [value];
                });

//                console.log(array);
                var found = array.find(element => element.hasOwnProperty('scale') && element.scale.find(elemnt1 => elemnt1.quantity === units[getKey(pro.unit)].reverse) && element.unit === value1.unit);

                if (found !== undefined) {
                    var valQuantity = pro.quantity * units[getKey(pro.unit)].reverse;

                    var unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= parseFloat(found.quantity));

                    if (unit != undefined) {
                        pro.quantity = (valQuantity + parseFloat(value1.quantity)) / unit.quantity;
                    }

                    //again get unit possible merge
                    unit = units[getKey(value1.unit)].scale.find(x => x.quantity <= pro.quantity);
                    if (unit !== undefined) {
                        pro.quantity = pro.quantity / unit.quantity;
                        pro.unit = unit.unit;
                    }

                } else {
                    //Something Missing
                    pro.quantity += parseFloat(value1.quantity);
                }


            } else {
                pro.quantity += parseFloat(value1.quantity);
            }

        } else {
            value1.quantity = parseFloat(value1.quantity);
            cusProducts.push(value1);
        }
    });
}

function weightAddRow() {
    var rows = $(`<tr>
                            <td colspan="2" contenteditable="" class="bolt w-20 cu-weight">WEIGHT</td>
                            <td contenteditable="" class="text-right cus-weght-change doubletd paste cu-weight-value">0</td>
                            <td class="w-10 cu-weight-unit" contenteditable="">KG</td>
                            <td class="w-10">WP</td>
                            <td contenteditable="" class="text-right cus-weght-change doubletd paste cu-weight-rate">0</td>
                            <td class="w-10">/=</td>
                            <td colspan="2" class="text-right amount">0</td>
                            <td class="w-10 p-0">
                                <button class="btn btn-inverse-danger table-btn weight-remove-row"><i class="mdi mdi-close"></i></button>
                            </td>
                        </tr>`);
    rows.hide();
    $($(this).parent().parent()).after(rows);
    rows.fadeIn("slow");
    $(".doubletd").keypress(isNumberTD);
    $('.weight-remove-row').click(removeCutomerInvoiceRow);
    $('.paste').on('paste', false);
    $('.cus-weght-change').keyup(cusWeghtChange);
}

function packagingAddRow() {
    var rows = $(`<tr>
                            <td colspan="2" contenteditable="" class="bolt w-20 cu-packing">PACKING CHARGES</td>
                            <td colspan="3" class="text-right cus-packing-change integertd paste cu-packing-value" contenteditable="">0</td>
                            <td contenteditable="" class="text-right cus-packing-change doubletd paste cu-packing-rate">0</td>
                            <td class="w-10">/=</td>
                            <td colspan="2" class="text-right amount">0</td>
                            <td class="w-10 p-0">
                                <button class="btn btn-inverse-danger table-btn pc-remove-row"><i class="mdi mdi-close"></i></button>
                            </td>
                        </tr>`);
    rows.hide();
    $($(this).parent().parent()).after(rows);
    rows.fadeIn("slow");
    $(".integertd").keypress(isIntNumber);
    $(".doubletd").keypress(isNumberTD);
    $('.paste').on('paste', false);
    $('.pc-remove-row').click(removeCutomerInvoiceRow);
    $('.cus-packing-change').keyup(cusPackingChange);
}

function otherCustomerAddRow() {
    var rows = $(`<tr>
                            <td colspan="2" contenteditable="" class="bolt w-20 cu-others">OTHER</td>
                            <td colspan="5"></td>
                            <td colspan="2" class="text-right amount change-amount doubletd paste next-row-column" contenteditable="">0</td>
                            <td class="w-10 p-0">
                                <button class="btn btn-inverse-danger table-btn pc-remove-row"><i class="mdi mdi-close"></i></button>
                            </td>
                        </tr>`);
    $($(this).parent().parent()).before(rows);
    rows.fadeIn("slow");
    $(".doubletd").keypress(isNumberTD);
    $('.paste').on('paste', false);
    $(".next-row-column").keypress(nextRawColumn);
    $('.pc-remove-row').click(removeCutomerInvoiceRow);
    $('.change-amount').keyup(function () {
        grandTotal($(this).parent().parent());
    });
}

function removeCutomerInvoiceRow() {
    var table = $(this).parent().parent().parent();
    $(this).closest('tr')
            .children('td')
            .animate({padding: 0})
            .wrapInner('<div />')
            .children()
            .slideUp(function () {
                $(this).closest('tr').remove();
                grandTotal(table);
            });
    return false;
}

function cusWeghtChange() {
    var table = $(this).parent().parent();
    var rowIndex = $(this).parent().index();
    var weight = 0;
    var rate = 0;
    if (!isEmpty(table.find(`tr:eq(${rowIndex})`).find(`td:eq(1)`).text())) {
        weight = parseFloat(table.find(`tr:eq(${rowIndex})`).find(`td:eq(1)`).text());
    }
    if (!isEmpty(table.find(`tr:eq(${rowIndex})`).find(`td:eq(4)`).text())) {
        rate = parseFloat(table.find(`tr:eq(${rowIndex})`).find(`td:eq(4)`).text());
    }
    table.find(`tr:eq(${rowIndex})`).find(`td:eq(6)`).text((weight * rate).toFixed(2));
    grandTotal(table);
}

function cusPackingChange() {
    var table = $(this).parent().parent();
    var rowIndex = $(this).parent().index();
    var packs = 0;
    var rate = 0;
    if (!isEmpty(table.find(`tr:eq(${rowIndex})`).find(`td:eq(1)`).text())) {
        packs = parseFloat(table.find(`tr:eq(${rowIndex})`).find(`td:eq(1)`).text());
    }
    if (!isEmpty(table.find(`tr:eq(${rowIndex})`).find(`td:eq(2)`).text())) {
        rate = parseFloat(table.find(`tr:eq(${rowIndex})`).find(`td:eq(2)`).text());
    }
    table.find(`tr:eq(${rowIndex})`).find(`td:eq(4)`).text((packs * rate).toFixed(2));
    grandTotal(table);
}

function grandTotal(table) {
    var grandTotal = 0;
    table.find("tr").each(function (i, el) {
        if (!isEmpty($(this).find('td.amount').text())) {
            grandTotal += parseFloat($(this).find('td.amount').text());
        }
    });
    table.find(`td.grand-total`).text(grandTotal.toFixed(2));
}

$(function () {

    $(".double").keypress(isNumber);
    $('.paste').on('paste', false);

    $('#edit-customer-invoiced').click(editCustomerInvoice);

    $('#customer-invoice-update').click(function () {
        var data = [];
        $('#customerInvoice .table-responsive > table').each(function (index, table) {
            var cusData = {
                name: "",
                contact: "",
                date: "",
                invNo: "",
                cartons: "",
                weight: [],
                packing: [],
                others: [],
                total: 0,
                note: ""
            };
            $(table).find("tr").each(function (i, el) {
                if (!isEmpty($(this).find('td.cu-date').text())) {
                    cusData.date = $(this).find('td.cu-date').text();
                }

                if (!isEmpty($(this).find('td.cu-invoice-number').text())) {
                    cusData.invNo = $(this).find('td.cu-invoice-number').text();
                }

                if (!isEmpty($(this).find('td.cu-name').text())) {
                    cusData.name = $(this).find('td.cu-name').text();
                }

                if (!isEmpty($(this).find('td.cu-contact').text())) {
                    cusData.contact = $(this).find('td.cu-contact').text();
                }

                if (!isEmpty($(this).find('td.cu-cartons').text())) {
                    cusData.cartons = $(this).find('td.cu-cartons').text();
                }

                if (!isEmpty($(this).find('td.cu-weight').text())) {
                    var weight = $(this).find('td.cu-weight-value').text();
                    if (isEmpty($(this).find('td.cu-weight-value').text())) {
                        weight = "0";
                    }

                    var rate = $(this).find('td.cu-weight-rate').text();
                    if (isEmpty($(this).find('td.cu-weight-rate').text())) {
                        rate = "0";
                    }
                    cusData.weight.push({
                        name: $(this).find('td.cu-weight').text(),
                        unit: $(this).find('td.cu-weight-unit').text(),
                        weight: parseFloat(weight),
                        rate: parseFloat(rate)
                    });
                }

                if (!isEmpty($(this).find('td.cu-packing').text())) {
                    var count = $(this).find('td.cu-packing-value').text();
                    if (isEmpty($(this).find('td.cu-packing-value').text())) {
                        count = "0";
                    }
                    var rate = $(this).find('td.cu-packing-rate').text();
                    if (isEmpty($(this).find('td.cu-packing-rate').text())) {
                        rate = "0";
                    }
                    cusData.packing.push({
                        name: $(this).find('td.cu-packing').text(),
                        count: parseInt(count),
                        rate: parseFloat(rate)
                    });
                }

                if (!isEmpty($(this).find('td.cu-others').text())) {
                    var rate = $(this).find('td.amount').text();
                    if (isEmpty($(this).find('td.amount').text())) {
                        rate = "0";
                    }
                    cusData.others.push({
                        name: $(this).find('td.cu-others').text(),
                        rate: parseFloat(rate)
                    });
                }

                if (!isEmpty($(this).find('td.grand-total').text())) {
                    cusData.total = parseFloat($(this).find('td.grand-total').text());
                }

                if (!isEmpty($(this).find('td.cu-note').text())) {
                    cusData.note = $(this).find('td.cu-note').text();
                }

            });
            data.push(cusData);
        });

        var sendData = {};
        sendData[CUSTOMER_INVOICE_STATE] = {customerInvoice: data};
        $.ajax({
            url: "/createCustomerInvoice",
            type: "POST",
            data: JSON.stringify({key: CUSTOMER_INVOICE_SHIPMENT, data: sendData}),
            dataType: 'json',
            beforeSend: function (xhr) {
                $('#customer-invoice-update').find('i').removeClass('d-none');
                $('#customer-invoice-update').attr('disabled', 'true');
            },
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                if (data.status === "success") {
                    CUSTOMER_IN_SHIPMNET = data.data[CUSTOMER_INVOICE_STATE];
                    shipments[CUSTOMER_INVOICE_SHIPMENT] = data.data;

                    $('#customer-invoice-update').find('i').addClass('d-none');
                    $('#customer-invoice-update').removeAttr('disabled');

                    makeCustomerInvoicePDF();

                } else if (data.status === "error") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
                }
            },
            error: function (xhr, status, error) {
                Lobibox.notify('warning', {position: 'top right', msg: error});
            }
        });

    });

    $('#change-all-per-weight').click(function () {
        var value = 0;
        if (!isEmpty($('#valuePerWeight').val())) {
            value = parseFloat($('#valuePerWeight').val());
        }
        if (value > 0) {
            $('#customerInvoice .table-responsive > table').each(function (index, table) {
                $(table).find("tr").each(function (i, el) {
                    if (!isEmpty($(this).find('td.cu-weight').text())) {
                        var weight = $(this).find('td.cu-weight-value').text();
                        if (isEmpty($(this).find('td.cu-weight-value').text())) {
                            weight = "0";
                        }
                        $(this).find('td.cu-weight-rate').text(value);
                        $(this).find('td.amount').text((parseFloat(value) * parseFloat(weight)).toFixed(2));
                        grandTotal($(table));
                    }
                });
            });
        }
    });

    $('#change-per-packaging').click(function () {
        var value = 0;
        if (!isEmpty($('#valuePerPackaging').val())) {
            value = parseFloat($('#valuePerPackaging').val());
        }
        if (value > 0) {
            $('#customerInvoice .table-responsive > table').each(function (index, table) {
                $(table).find("tr").each(function (i, el) {
                    if (!isEmpty($(this).find('td.cu-packing').text())) {
                        var packs = $(this).find('td.cu-packing-value').text();
                        if (isEmpty($(this).find('td.cu-packing-value').text())) {
                            packs = "0";
                        }
                        $(this).find('td.cu-packing-rate').text(value);
                        $(this).find('td.amount').text((parseFloat(value) * parseFloat(packs)).toFixed(2));
                        grandTotal($(table));
                    }
                });
            });
        }
    });

    $('#isCustomerInvoiced').click(function () {
        if ($('#isCustomerInvoiced').is(":checked")) {
            editCustomerInvoice();
        } else {
            makeCustomerInvoice();
        }
    });

});

function makeCustomerInvoicePDF() {

    var parentShipment = shipments[CUSTOMER_INVOICE_SHIPMENT];
    var CUSTOMER_IN_SHIPMNET_NO = parentShipment.shipment;
    if (parentShipment.hasOwnProperty('editShipment')) {
        CUSTOMER_IN_SHIPMNET_NO = parentShipment.editShipment;
    }

    $('.customer-invoice-shipment').text(`SHIPMENT ${CUSTOMER_IN_SHIPMNET_NO}`);

    var docDefinition = {
        info: {
            title: `CUSTOMER INOVICE ${CUSTOMER_IN_SHIPMNET_NO}`,
            author: 'Asian Cargo',
            subject: 'Customer Invoice',
            keywords: 'Pupose of Shipment Customer Invoices'
        },
        pageSize: 'A5',
        content: [],
        pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
            return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
        },
        styles: styles
    };

    $.each(CUSTOMER_IN_SHIPMNET.customerInvoice, function (index, value) {
        var data = {
            table: {
                widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*'],
                body: [
                    [{text: 'ASIAN CARGO\nINVOICE', style: 'TabelHeader', rowSpan: 2, colSpan: 7, alignment: 'center'}, {}, {}, {}, {}, {}, {}, {text: 'ORIGINAL COPY', style: 'header', rowSpan: 2, colSpan: 2, alignment: 'center'}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{text: 'DATED', style: 'header', colSpan: 2}, {}, {text: value.date, style: 'normal', colSpan: 3}, {}, {}, {text: 'INVOICE NO', style: 'header', colSpan: 2}, {}, {text: value.invNo, style: 'normal', colSpan: 2}, {}],
                    [{text: 'PARTY DETAILS', style: 'header', colSpan: 2}, {}, {text: value.name, style: 'normal', colSpan: 7}, {}, {}, {}, {}, {}, {}],
                    [{text: 'MOBILE NUMBER', style: 'header', colSpan: 2}, {}, {text: customers[getKey(value.name)].contact, style: 'normal', colSpan: 7}, {}, {}, {}, {}, {}, {}],
                    [{text: 'CARTON NO', style: 'header', rowSpan: 3, colSpan: 2}, {}, {text: value.cartons.split("-").join(" - "), style: 'normal', rowSpan: 3, colSpan: 7}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                ]
            }
        };
        $.each(value.weight, function (index1, value1) {
            var total = value1.weight * value1.rate;
            if (total !== 0) {
                data.table.body.push([{text: value1.name, style: 'header', colSpan: 2}, {}, {text: value1.weight, style: 'normal', alignment: 'right'}, {text: value1.unit, style: 'header'}, {text: 'WP', style: 'header'}, {text: value1.rate.toFixed(2), style: 'normal', alignment: 'right'}, {text: '/=', style: 'header'}, {text: (value1.weight * value1.rate).toFixed(2), style: 'normal', alignment: 'right', colSpan: 2}, {}]);
            }
        });
        var totalCount = 0;
        $.each(value.packing, function (index1, value1) {
            totalCount += value1.count;
            var total = value1.count * value1.rate;
            if (total !== 0) {
                data.table.body.push([{text: value1.name, style: 'header', colSpan: 2}, {}, {text: value1.count, style: 'normal', colSpan: 3, alignment: 'right'}, {}, {}, {text: value1.rate.toFixed(2), style: 'normal', alignment: 'right'}, {text: '/=', style: 'header'}, {text: (value1.count * value1.rate).toFixed(2), style: 'normal', alignment: 'right', colSpan: 2}, {}]);
            }
        });
        $.each(value.others, function (index1, value1) {
            if (value1.rate !== 0) {
                data.table.body.push([{text: value1.name, style: 'header', colSpan: 2}, {}, {text: '   ', style: 'normal', colSpan: 5}, {}, {}, {}, {}, {text: value1.rate.toFixed(2), style: 'normal', alignment: 'right', colSpan: 2}, {}]);
            }
        });
        data.table.body.push([{text: 'TOTAL CARTON NO', style: 'header', colSpan: 2}, {}, {text: totalCount, style: 'normal', colSpan: 7}, {}, {}, {}, {}, {}, {}]);
        data.table.body.push([{text: 'GRAND TOTAL', style: 'TabelHeader', colSpan: 7}, {}, {}, {}, {}, {}, {}, {text: value.total.toFixed(2), style: 'TabelHeader', alignment: 'right', colSpan: 2}, {}]);
        data.table.body.push([{text: 'NOTE', style: 'header', colSpan: 2}, {}, {text: value.note, style: 'normal', colSpan: 7}, {}, {}, {}, {}, {}, {}]);
        docDefinition.content.push(data);
        docDefinition.content.push({text: '         ', fontSize: 15});
    });

    pdfMake.createPdf(docDefinition).getDataUrl().then(function (result) {
        $('.customer-invoice-pdf').attr('src', result);
        if (!$('#pdf-customer-invoice-content').is(":visible")) {
            $("#edit-customer-invoice-content").hide('fast');
            $("#pdf-customer-invoice-content").show('fast');
        }
        if (!$('#customerInvoice').is(":visible")) {
            $('#customerInvoice').modal('show');
        }
    });
}