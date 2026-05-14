var UPDATE_CLEARING = null;
$(function () {

    $('.dropleft').on('show.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    $('.dropleft').on('hide.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });


    $('#sample-xlsx').click(function () {
        var element = document.createElement('a');
        element.setAttribute('href', '/app/example/example1.xlsx');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    });

    $('#excel').change(function (e) {

        $('#excel-btn').find('i').removeClass('d-none');
        $('#excel-btn').attr('disabled', 'true');
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
        if (regex.test(e.target.files[0].name.toLowerCase())) {
            readXlsxFile(e.target.files[0]).then(excelReadDraw);
        } else {
            $('#excel-btn').find('i').addClass('d-none');
            $('#excel-btn').removeAttr('disabled');
            Lobibox.notify('warning', {position: 'top right', msg: `Please upload a valid Excel file.`});
        }
    });


    $('#excel2').change(function (e) {
        var reader = new FileReader();

        //For Browsers other than IE.
        if (reader.readAsBinaryString) {
            reader.onload = function (e) {
                updateExcel(e.target.result);
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
                updateExcel(data);
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        }
    });

    $('#change-need-weight').click(function () {
        var needWeight = parseFloat($('#need-weight-invoce-input').val());

        var adjustment = needWeight - parseFloat($('#total-net-weight-invoice').text());
        var concat = '';
        if (adjustment > 0) {
            concat = '+';
        }

        if (needWeight === 0) {
            if ((adjustment + "").startsWith("-")) {
                adjustment = adjustment * (-1);
            }
            concat = '';
        }

        numberAnimation('need-weight-invoice', needWeight.toFixed(2));
        numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));

    });

    $('#change-all-pertone').click(function () {
        var grantTotal = 0;
        $('#clearingTable tr').each(function (i, el) {
            $(el).children().eq(3).text($('#valuePerTone').val());
            var netWeight = parseFloat($(el).children().eq(5).text());
            var valuePertone = parseFloat($('#valuePerTone').val());
            var quantity = parseFloat($(el).children().eq(8).text());

            var total = netWeight * valuePertone;
            var unitprice = total / quantity;

            if (parseFloat(unitprice.toFixed(2)) < 0.01) {
                unitprice = 0.01;
            }

            $(el).children().eq(10).text(unitprice.toFixed(2));
            $(el).children().eq(11).text(total.toFixed(2));

            unitprice = parseFloat($(el).children().eq(10).text());
            total = quantity * unitprice;
            $(el).children().eq(11).text(total.toFixed(2));
            grantTotal += parseFloat($(el).children().eq(11).text());
        });
        numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
    });

    $(".double").keypress(isNumber);
    $('.paste').on('paste', false);
    $(".integer").keypress(isIntNumber);

    $('#save-clearing').click(insertClearing);

    $('#change-adjust-weight-percent').click(function () {
        if (!isEmpty($('#adjust-weight-poercent-invoce-input').val())) {
            var grantTotal = 0;
            var grantNetWeight = 0;
            $('#clearingTable tr').each(function (i, el) {
                if (parseFloat($(el).children().eq(5).text()) > 10) {
                    let adjustPercent = (parseFloat($(el).children().eq(5).text()) * (parseFloat($('#adjust-weight-poercent-invoce-input').val()) / 100));
                    if ($('#adjust-weight-invoice').text().startsWith('-')) {
                        let adjustWeight = parseFloat($(el).children().eq(5).text()) - adjustPercent;
                        $(el).children().eq(5).text(adjustWeight.toFixed());
                    } else if ($('#adjust-weight-invoice').text().startsWith('+')) {
                        let adjustWeight = parseFloat($(el).children().eq(5).text()) + adjustPercent;
                        $(el).children().eq(5).text(adjustWeight.toFixed());
                    }

                    let total = parseFloat($(el).children().eq(5).text()) * parseFloat($(el).children().eq(3).text());
                    let unitprice = parseFloat((total / parseFloat($(el).children().eq(8).text())).toFixed(2));

                    if (parseFloat(unitprice.toFixed(2)) < 0.01) {
                        unitprice = 0.01;
                    }

                    $(el).children().eq(10).text(unitprice.toFixed(2));
                    $(el).children().eq(11).text(total.toFixed(2));

                    let netWeight = parseFloat($(el).children().eq(5).text());
                    let quantity = parseFloat($(el).children().eq(8).text());

                    let UNIT = $(el).children().eq(9).text();
                    var perWeight = 0;
                    if (units[getKey(UNIT)] !== undefined && units[getKey(UNIT)].hasOwnProperty('isReverse') && units[getKey(UNIT)].isReverse) {
                        perWeight = netWeight / (quantity * units[getKey(UNIT)].reverse);
                    } else {
                        perWeight = netWeight / quantity;
                    }
                    $(el).children().eq(4).text(perWeight.toFixed(4));
                }
                grantTotal += parseFloat($(el).children().eq(11).text());
                grantNetWeight += parseFloat($(el).children().eq(5).text());
            });

            numberAnimation('total-net-weight-invoice', grantNetWeight.toFixed(2));
            var needWeight = parseFloat($('#need-weight-invoice').text());

            var adjustment = parseFloat(needWeight.toFixed(2)) - parseFloat(grantNetWeight.toFixed(2));
            var concat = '';
            if (adjustment > 0) {
                concat = '+';
            }

            if (needWeight === 0) {
                if ((adjustment + "").startsWith("-")) {
                    adjustment = adjustment * (-1);
                }
                concat = '';
            }

            numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));
            numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
        }
    });

});

function excelReadDraw(rows) {
    var check = propertyArray(rows);
    if (check.isValid) {

        let  excelData = [];
        $.each(rows, function (index, value) {
            if (index !== 0) {
                let datas = {};
                $.each(rows[0], function (index1, value1) {
//                    console.log(value1);
                    datas[value1] = value[index1];
                });
                excelData.push(datas);
            }
        });

        var weight = 0;
        var total = 0;
        let grossWeight = 0;
        $.each(excelData, function (index, value) {
//            console.log(value);
            value.NetWeight = parseFloat(value.NetWeight).toFixed(2);
//            value.UnitPrice = parseFloat(value.UnitPrice).toFixed(2);
//
//            if (parseFloat(value.UnitPrice) < 0.01) {
//                value.UnitPrice = 0.01;
//            }
            $('#clearingTable').append(`
                <tr>
                    <td class="p-2" contenteditable="true">${(value.hasOwnProperty('ItemNumber') && !isEmpty(value.ItemNumber)) ? value.ItemNumber : index + 1}</td>
                    <td class="p-2" contenteditable="true">${(value.hasOwnProperty('Carton') && !isEmpty(value.Carton)) ? value.Carton : index + 1}</td>
                    <td class="text-center p-2" contenteditable="true">${value.Description}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${((parseFloat(value.UnitPrice) * parseFloat(value.TotalQuantity)) / parseFloat(value.NetWeight)).toFixed(3)}</td>
                    <td class="text-center p-2">${(parseFloat(value.NetWeight) / parseFloat(value.TotalQuantity)).toFixed(4)}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${value.NetWeight}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${(value.hasOwnProperty('GrossWeight') && !isEmpty(value.GrossWeight)) ? parseFloat(value.GrossWeight).toFixed(2) : "0.00"}</td>
                    <td class="text-center p-2">${(value.hasOwnProperty('Quantity') && !isEmpty(value.Quantity)) ? value.Quantity : value.TotalQuantity}</td>
                    <td class="text-right p-2">${value.TotalQuantity}</td>
                    <td class="text-center p-2">${value.Unit}</td>
                    <td class="text-right p-2 doubletd paste next-row-column change-value" contenteditable="true">${value.UnitPrice}</td>
                    <td class="text-right p-2">${(parseFloat(value.UnitPrice) * parseFloat(value.TotalQuantity)).toFixed(2)}</td>
                    <td class="text-center p-2"><button class="btn btn-inverse-danger btn-rounded p-10 remove-row"><i class="mdi mdi-delete-variant"></i></button></td>
                </tr>`);
            grossWeight += parseFloat((value.hasOwnProperty('GrossWeight') && !isEmpty(value.GrossWeight)) ? parseFloat(value.GrossWeight).toFixed(2) : "0.00");
            weight += parseFloat(value.NetWeight);
            total += parseFloat(value.UnitPrice) * parseFloat(value.TotalQuantity);
        });
        $('#excel').val("");
        $('#excel-btn').find('i').addClass('d-none');
        $('#excel-btn').removeAttr('disabled');

        $(".doubletd").keypress(isNumberTD);
        $('.paste').on('paste', false);
        $(".next-row-column").keypress(nextRawColumn);
        $('.change-value').keyup(changeValue);
        $('.remove-row').click(removeProdctRow);

        $('#need-weight-invoce-input').val(weight.toFixed(2));
        numberAnimation('total-net-weight-invoice', weight.toFixed(2));
        numberAnimation('gross-weight-invoice', grossWeight.toFixed(2));
        numberAnimation('need-weight-invoice', weight.toFixed(2));
        numberAnimation('adjust-weight-invoice', 0.00);
        numberAnimation('total-amount-invoice', total.toFixed(2));

    } else {
        $('#excel').val("");
        $('#excel-btn').find('i').addClass('d-none');
        $('#excel-btn').removeAttr('disabled');
        Lobibox.notify('warning', {position: 'top right', msg: check.msg});
    }
}

function getReadableJSON(file) {
    let form = new FormData();
    form.append('excel', file);
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "/readExcel",
        data: form,
        processData: false,
        contentType: false,
        headers: {
            'CSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        cache: false,
        success: function (data) {
            console.log(data);
//                if (data.status === "success") {
//                    CLEARING_DATA = data.data;
//                    UPDATE_CLEARING = null;
//                    $('#clearingAttchment').modal('hide');
//                    drawClearingTable();
//
//                    $('#save-clearing').find('i').addClass('d-none');
//                    $('#save-clearing').removeAttr('disabled');
//
//                } else if (data.status === "error") {
//                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
//                }
        },
        error: function (xhr, status, status) {
            console.log(xhr, status, status);
            Lobibox.notify('warning', {position: 'top right', msg: error});
        }
    });
}

function insertClearing() {
    if (isValidHeader()) {
        var data = {
            exporterName: $('#exporter').val().trim().toUpperCase(),
            exporterAddress: $('#exporter-address').val().trim().toUpperCase(),
            exporterContact: $('#exporter-contact').val().trim().toUpperCase(),
            exporterEmail: $('#exporter-email').val(),
            consignee: $('#consignee').val().trim(),
            clearingDate: $('#exporter-date').val().trim().toUpperCase(),
            clearingNo: $('#exporter-invoiceno').val().trim().toUpperCase(),
            packingListTerm: $('#exporter-extrapk').val(),
            invoiceTerm: $('#exporter-extrain').val(),
            freight: $('#freight').val(),
            date: new Date(),
            grantTotal: 0,
            totalCartons: $('#totalCartons').val(),
            details: []
        };
        var grantTotal = 0;
        $('#clearingTable tr').each(function (i, el) {
            data.details.push({
                itemNo: $(el).children().eq(0).text(),
                carton: $(el).children().eq(1).text(),
                description: $(el).children().eq(2).text().toUpperCase(),
                valuePerTone: $(el).children().eq(3).text(),
                perWeight: $(el).children().eq(4).text(),
                netWeight: $(el).children().eq(5).text(),
                grossWeight: $(el).children().eq(6).text(),
                perQuanity: $(el).children().eq(7).text(),
                totalQuanity: $(el).children().eq(8).text(),
                unit: $(el).children().eq(9).text(),
                unitPrice: $(el).children().eq(10).text(),
                total: $(el).children().eq(11).text()
            });
            grantTotal += parseFloat($(el).children().eq(11).text());
        });
        data.grantTotal = grantTotal;
        $.ajax({
            url: "/addOrUpdateClearing",
            type: "POST",
            data: JSON.stringify({key: UPDATE_CLEARING, data: data}),
            dataType: 'json',
            beforeSend: function (xhr) {
                $('#save-clearing').find('i').removeClass('d-none');
                $('#save-clearing').attr('disabled', 'true');
            },
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                UPDATE_CLEARING = null;
                if (data.status === "success") {
                    CLEARING_DATA = data.data;
                    UPDATE_CLEARING = null;
                    $('#clearingAttchment').modal('hide');
                    drawClearingTable();

                    $('#save-clearing').find('i').addClass('d-none');
                    $('#save-clearing').removeAttr('disabled');

                } else if (data.status === "error") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
                }
            },
            error: function (xhr, status, error) {
                Lobibox.notify('warning', {position: 'top right', msg: error});
                UPDATE_CLEARING = null;
            }
        });
    }
}

function isValidHeader() {
    if (!isEmpty($('#exporter').val())) {
        if (!isEmpty($('#exporter-address').val())) {
            if (!isEmpty($('#exporter-contact').val())) {
                if (!isEmpty($('#consignee').val())) {
                    if (!isEmpty($('#exporter-date').val())) {
                        if (!isEmpty($('#exporter-invoiceno').val())) {
                            if (!isEmpty($('#totalCartons').val())) {
                                if ($('#clearingTable tr').length > 0) {
                                    return true;
                                } else {
                                    Lobibox.notify('warning', {position: 'top right', msg: "Please add value in table"});
                                    return false;
                                }
                            } else {
                                Lobibox.notify('warning', {position: 'top right', msg: "Please enter Total Cartons"});
                                return false;
                            }
                        } else {
                            Lobibox.notify('warning', {position: 'top right', msg: "Please enter Invoice No"});
                            return false;
                        }
                    } else {
                        Lobibox.notify('warning', {position: 'top right', msg: "Please enter Date"});
                        return false;
                    }
                } else {
                    Lobibox.notify('warning', {position: 'top right', msg: "Please enter Consignee"});
                    return false;
                }
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: "Please enter Exporter Contact"});
                return false;
            }
        } else {
            Lobibox.notify('warning', {position: 'top right', msg: "Please enter Exporter Address"});
            return false;
        }
    } else {
        Lobibox.notify('warning', {position: 'top right', msg: "Please enter Exporter Name"});
        return false;
    }
}

function updateExcel(data) {
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    var il = 0;
    $('#clearingTable tr').each(function (i, el) {
        $(el).children().eq(0).text(excelRows[il].ItemNumber);
        $(el).children().eq(2).text(excelRows[il].Description);
        il++;
    });
}

function processExcel(data) {
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    var check = property(excelRows);
    if (check.isValid) {
        var weight = 0;
        var total = 0;
        let grossWeight = 0;
        $.each(excelRows, function (index, value) {
            value.NetWeight = parseFloat(value.NetWeight).toFixed(2);
            value.UnitPrice = parseFloat(value.UnitPrice).toFixed(2);

            if (parseFloat(value.UnitPrice.toFixed(2)) < 0.01) {
                value.UnitPrice = 0.01;
            }

            $('#clearingTable').append(`
                <tr>
                    <td class="p-2" contenteditable="true">${(value.hasOwnProperty('ItemNumber') && !isEmpty(value.ItemNumber)) ? value.ItemNumber : index + 1}</td>
                    <td class="p-2" contenteditable="true">${(value.hasOwnProperty('Carton') && !isEmpty(value.Carton)) ? value.Carton : index + 1}</td>
                    <td class="text-center p-2" contenteditable="true">${value.Description}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${((parseFloat(value.UnitPrice) * parseFloat(value.TotalQuantity)) / parseFloat(value.NetWeight)).toFixed(3)}</td>
                    <td class="text-center p-2">${(parseFloat(value.NetWeight) / parseFloat(value.TotalQuantity)).toFixed(4)}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${value.NetWeight}</td>
                    <td class="text-center p-2 doubletd paste next-row-column change-value" contenteditable="true">${(value.hasOwnProperty('GrossWeight') && !isEmpty(value.GrossWeight)) ? parseFloat(value.GrossWeight).toFixed(2) : "0.00"}</td>
                    <td class="text-center p-2">${(value.hasOwnProperty('Quantity') && !isEmpty(value.Quantity)) ? value.Quantity : value.TotalQuantity}</td>
                    <td class="text-right p-2">${value.TotalQuantity}</td>
                    <td class="text-center p-2">${value.Unit}</td>
                    <td class="text-right p-2 doubletd paste next-row-column change-value" contenteditable="true">${value.UnitPrice}</td>
                    <td class="text-right p-2">${(parseFloat(value.UnitPrice) * parseFloat(value.TotalQuantity)).toFixed(2)}</td>
                    <td class="text-center p-2"><button class="btn btn-inverse-danger btn-rounded p-10 remove-row"><i class="mdi mdi-delete-variant"></i></button></td>
                </tr>`);
            weight += parseFloat(value.NetWeight);
            grossWeight += parseFloat((value.hasOwnProperty('GrossWeight') && !isEmpty(value.GrossWeight)) ? parseFloat(value.GrossWeight).toFixed(2) : "0.00");
            total += parseFloat(value.UnitPrice) * parseFloat(value.TotalQuantity);
        });
        $('#excel').val("");
        $('#excel-btn').find('i').addClass('d-none');
        $('#excel-btn').removeAttr('disabled');

        $(".doubletd").keypress(isNumberTD);
        $('.paste').on('paste', false);
        $(".next-row-column").keypress(nextRawColumn);
        $('.change-value').keyup(changeValue);
        $('.remove-row').click(removeProdctRow);

        $('#need-weight-invoce-input').val(weight.toFixed(2));
        numberAnimation('total-net-weight-invoice', weight.toFixed(2));
        numberAnimation('gross-weight-invoice', grossWeight.toFixed(2));
        numberAnimation('need-weight-invoice', weight.toFixed(2));
        numberAnimation('adjust-weight-invoice', 0.00);
        numberAnimation('total-amount-invoice', total.toFixed(2));

    } else {
        $('#excel').val("");
        $('#excel-btn').find('i').addClass('d-none');
        $('#excel-btn').removeAttr('disabled');
        Lobibox.notify('warning', {position: 'top right', msg: check.msg});
    }
}

function property(excel) {
    excel = excel[0];
    if (excel.hasOwnProperty('Description')) {
        if (excel.hasOwnProperty('TotalQuantity')) {
            if (excel.hasOwnProperty('UnitPrice')) {
                if (excel.hasOwnProperty('Unit')) {
                    if (excel.hasOwnProperty('NetWeight')) {
                        return {isValid: true};
                    } else {
                        return {isValid: false, msg: 'Weight Property is dose not exist'};
                    }
                } else {
                    return {isValid: false, msg: 'Unit Property is dose not exist'};
                }
            } else {
                return {isValid: false, msg: 'Unit Price Property is dose not exist'};
            }
        } else {
            return {isValid: false, msg: 'Quantity Property is dose not exist'};
        }
    } else {
        return {isValid: false, msg: 'Description Property is dose not exist'};
    }
}

function propertyArray(excel) {
    excel = excel[0];
    if (excel.includes('Description')) {
        if (excel.includes('TotalQuantity')) {
            if (excel.includes('UnitPrice')) {
                if (excel.includes('Unit')) {
                    if (excel.includes('NetWeight')) {
                        return {isValid: true};
                    } else {
                        return {isValid: false, msg: 'Weight Property is dose not exist'};
                    }
                } else {
                    return {isValid: false, msg: 'Unit Property is dose not exist'};
                }
            } else {
                return {isValid: false, msg: 'Unit Price Property is dose not exist'};
            }
        } else {
            return {isValid: false, msg: 'Quantity Property is dose not exist'};
        }
    } else {
        return {isValid: false, msg: 'Description Property is dose not exist'};
    }
}

function numberAnimation(id, newnum) {
    jQuery({someValue: parseFloat($(`#${id}`).text())}).animate({someValue: parseFloat(newnum)}, {
        duration: 1000,
        easing: 'swing',
        step: function () {
            $(`#${id}`).text(Math.ceil(this.someValue).toFixed(2));
        },
        complete: function () {
            $(`#${id}`).text(newnum);
        }
    });
}

function changeValue(event) {
    var valuePertone = parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(3)`).text());
    var netWeight = parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(5)`).text());
    var quantity = parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text());
    var unitprice = parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(10)`).text());
    var total = parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(11)`).text());
    if ($(this).index() === 3) {

        total = netWeight * valuePertone;
        unitprice = parseFloat((total / parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text())).toFixed(2));

        if (parseFloat(unitprice.toFixed(2)) < 0.01) {
            unitprice = 0.01;
        }

//        unitprice = parseFloat((total / parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text())));
//
//        console.log(unitprice);
//        console.log(formatMoney(unitprice));
//        console.log(Math.round(unitprice));

//        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(10)`).text(unitprice);
        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(10)`).text(unitprice.toFixed(2));
        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(11)`).text(total.toFixed(2));

    } else if ($(this).index() === 5) {
        total = netWeight * valuePertone;
        unitprice = parseFloat((total / quantity).toFixed(2));

        if (parseFloat(unitprice.toFixed(2)) < 0.01) {
            unitprice = 0.01;
        }

        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(10)`).text(unitprice.toFixed(2));
        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(11)`).text(total.toFixed(2));

        var UNIT = $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(9)`).text();
        var perWeight = 0;
        if (units[getKey(UNIT)].isReverse) {
            perWeight = netWeight / (quantity * units[getKey(UNIT)].reverse);
        } else {
            perWeight = netWeight / quantity;
        }
        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(4)`).text(perWeight.toFixed(4));
    } else if ($(this).index() === 10) {

        total = quantity * unitprice;
        valuePertone = total / netWeight;

        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(3)`).text(valuePertone.toFixed(3));
        $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(11)`).text(total.toFixed(2));
    }

    var quantity = parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(8)`).text());
    var unitprice = parseFloat($('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(10)`).text());

    total = quantity * unitprice;
    $('#clearingTable').find(`tr:eq(${$(this).parent().index()})`).find(`td:eq(11)`).text(total.toFixed(2));

    var grantTotal = 0;
    var grantNetWeight = 0;
    let grossWeight = 0;
    $('#clearingTable tr').each(function (i, el) {
        grantTotal += parseFloat($(el).children().eq(11).text());
        grantNetWeight += parseFloat($(el).children().eq(5).text());
        grossWeight += parseFloat($(el).children().eq(6).text());
    });

    numberAnimation('total-net-weight-invoice', grantNetWeight.toFixed(2));
    numberAnimation('gross-weight-invoice', grossWeight.toFixed(2));
    var needWeight = parseFloat($('#need-weight-invoice').text());

    var adjustment = parseFloat(needWeight.toFixed(2)) - parseFloat(grantNetWeight.toFixed(2));
    var concat = '';
    if (adjustment > 0) {
        concat = '+';
    }

    if (needWeight === 0) {
        if ((adjustment + "").startsWith("-")) {
            adjustment = adjustment * (-1);
        }
        concat = '';
    }

    numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));
    numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
}

function grandTotal() {
    var grantTotal = 0;
    $('#clearingTable tr').each(function (i, el) {
        grantTotal += parseFloat($(el).children().eq(11).text());
    });

    numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
}

function netWeightTotal() {
    var grantTotal = 0;
    var grantNetWeight = 0;
    let grossWeight = 0;
    $('#clearingTable tr').each(function (i, el) {
        grantTotal += parseFloat($(el).children().eq(11).text());
        grantNetWeight += parseFloat($(el).children().eq(5).text());
        grossWeight += parseFloat($(el).children().eq(6).text());
    });

    numberAnimation('total-net-weight-invoice', grantNetWeight.toFixed(2));
    numberAnimation('gross-weight-invoice', grossWeight.toFixed(2));
    var needWeight = parseFloat($('#need-weight-invoice').text());

    var adjustment = parseFloat(needWeight.toFixed(2)) - parseFloat(grantNetWeight.toFixed(2));
    var concat = '';
    if (adjustment > 0) {
        concat = '+';
    }

    if (needWeight === 0) {
        if ((adjustment + "").startsWith("-")) {
            adjustment = adjustment * (-1);
        }
        concat = '';
    }

    numberAnimation('adjust-weight-invoice', concat + adjustment.toFixed(2));
    numberAnimation('total-amount-invoice', grantTotal.toFixed(2));
}

function removeProdctRow() {
    $(this).closest('tr')
            .children('td')
            .animate({padding: 0})
            .wrapInner('<div />')
            .children()
            .slideUp(function () {
                $(this).closest('tr').remove();
                netWeightTotal();
            });
    return false;
}