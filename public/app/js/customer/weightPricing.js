$(function () {

    $('.paste').on('paste', false);
    $(".double").keypress(isNumber);
    $.get("/getUnits", function (data, status) {
        var response = JSON.parse(data);
        var unitsData = response.data;
        var datas = [];
        for (var key in unitsData) {
            var values = {
                name: unitsData[key].unit.trim(),
                value: unitsData[key].unit.trim()
            };
            if (unitsData[key].unit.trim() === "KG") {
                values["selected"] = true;
            }
            datas.push(values);
        }
        $('#weight-pricing-select-unit').dropdown({
            selectOnKeydown: false,
            values: datas,
            onChange: function (value, text, $selectedItem) {}
        });

        $('#weight-pricing-select-unit input.search').keyup(function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                $('#weight-pricing-price').focus();
            }
        });

        $('#weight-pricing-select-unit .item').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $('#weight-pricing-select-unit').dropdown('set selected', $(this).text());
            $('#weight-pricing-select-unit').dropdown('hide');
            $('#weight-pricing-price').focus();
        });
    });

    $('#weight-pricing-select-goods').dropdown({
        apiSettings: {
            url: '/getSerchedProductNCategoru?search={query}'
        },
        filterRemoteData: true,
        selectOnKeydown: false,
        onChange: function (value, text, $selectedItem) {
        },
        onShow: function () {
            $('#weight-pricing-select-goods .item').click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                $('#weight-pricing-select-goods').dropdown('set selected', $(this).text());
                $('#weight-pricing-select-goods').dropdown('hide');
                $('#weight-pricing-select-unit input.search').focus();
            });
            return true;
        }
    });

    $('#weight-pricing-select-goods input.search').keyup(function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            $('#weight-pricing-select-unit input.search').focus();
        }
    });

    $('#weight-pricing-price').keyup(function (e) {
        if (e.keyCode === 13) {
            var goods = $('#weight-pricing-select-goods').dropdown("get value");
            var unit = $('#weight-pricing-select-unit').dropdown("get value");
            var price = $('#weight-pricing-price').val();
            if (!isEmpty(goods)) {
                if (!isEmpty(unit)) {
                    if (!isEmpty(price)) {
                        if ($.isNumeric(price)) {

                            var isAvailable = false;
                            $('#weight-pricing-table tr').each(function (i, el) {
                                if ($(el).children().eq(1).text() === goods) {
                                    isAvailable = true;
                                    $(el).children().eq(2).text(unit);
                                    $(el).children().eq(3).text(price);
                                    return;
                                }
                            });

                            if (!isAvailable) {
                                $('#weight-pricing-table').append(`
                                    <tr>
                                        <td style="width: 1%">${$('#weight-pricing-table tr').length + 1}</td>
                                        <td style="width: 64%">${goods}</td>
                                        <td class="text-center" style="width: 10%">${unit}</td>
                                        <td class="text-right" style="width: 20%">${price}</td>
                                        <td class="text-center" style="width: 5%; padding: 0"><div class="btn btn-inverse-danger btn-rounded p-10 tab-pointer" onclick="removeWeightPriceRow(this)"><i class="mdi mdi-delete-variant"></i></div></td>
                                    </tr>
                                `);
                            }

                            $('#weight-pricing-select-goods').dropdown("restore defaults");
                            $('#weight-pricing-select-unit').dropdown("restore defaults");
                            $('#weight-pricing-price').val("");
                            $('#weight-pricing-select-goods input.search').focus();
                        } else {
                            Lobibox.notify('warning', {position: 'top right', msg: `Please enter valid Price`});
                            $('#weight-pricing-price').focus();
                        }
                    } else {
                        Lobibox.notify('warning', {position: 'top right', msg: `Please enter Price`});
                        $('#weight-pricing-price').focus();
                    }
                } else {
                    Lobibox.notify('warning', {position: 'top right', msg: `Please select the Unit`});
                    $('#weight-pricing-select-unit input.search').focus();
                }
            } else {
                Lobibox.notify('warning', {position: 'top right', msg: `Please select the Goods`});
                $('#weight-pricing-select-goods input.search').focus();
            }
        }
    });
    
    $('#weight-pricing-default-price').keyup(function (e){
        if (e.keyCode === 13) {
            e.preventDefault();
            $('#weight-pricing-select-goods input.search').focus();
        }
    });

    $('#save-weight-price').click(function () {
        if (!isEmpty($('#weight-pricing-default-price').val())) {

            var data = {
                defaultWeight: parseFloat($('#weight-pricing-default-price').val())
            };

            if ($('#weight-pricing-table tr').length > 0) {
                var goodsWeight = [];
                $('#weight-pricing-table tr').each(function (i, el) {
                    goodsWeight.push({
                        goods: $(el).children().eq(1).text(),
                        unit: $(el).children().eq(2).text(),
                        price: parseFloat($(el).children().eq(3).text())
                    });
                });
                data['goodsWeight'] = goodsWeight;
            }

            $.ajax({
                url: "/updateCustomerPriceList",
                type: "POST",
                data: JSON.stringify({key:getKey(selectCustomer.name), data:data}),
                dataType: 'json',
                beforeSend: function (xhr) {
                    $('#save-weight-price').find('i').removeClass('d-none');
                    $('#save-weight-price').attr('disabled', 'true');
                },
                headers: {
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN')
                },
                cache: false,
                success: function (data) {
                    if (data.status === "success") {
                        customerData[getKey(selectCustomer.name)] = data.data;
                        
                        $('#weightPricing').modal('hide');
                        
                        $('#weight-pricing-table').html("");
                        $('#weight-pricing-price').val("");
                        $('#weight-pricing-default-price').val("");
                        
                        $('#weight-pricing-select-goods').dropdown("restore defaults");
                        $('weight-pricing-select-unit').dropdown("restore defaults");

                        $('#save-weight-price').find('i').addClass('d-none');
                        $('#save-weight-price').removeAttr('disabled');
                    } else if (data.status === "error") {
                        Lobibox.notify('warning', {position: 'top right', msg: data.error});
                    }
                },
                error: function (xhr, status, error) {
                    Lobibox.notify('warning', {position: 'top right', msg: error});
                }
            });

        } else {
            Lobibox.notify('warning', {position: 'top right', msg: `Please enter default Price`});
            $('#weight-pricing-default-price').focus();
        }
    });

});

function removeWeightPriceRow(element) {
    $(element).closest('tr')
            .children('td')
            .animate({padding: 0})
            .wrapInner('<div />')
            .children()
            .slideUp(function () {
                $(this).closest('tr').remove();
                $('#weight-pricing-table tr').each(function (i, el) {
                    $(el).children().eq(0).text(i + 1);
                });
            });
    return false;
}