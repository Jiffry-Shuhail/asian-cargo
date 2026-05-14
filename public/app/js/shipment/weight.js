var WEIGHT_SHIPMENT = null;
var WEIGHT_STATUS = null;
function weight(shipment, classname) {
    WEIGHT_SHIPMENT = shipment;
    WEIGHT_STATUS = $(`.${classname}`).dropdown("get value");
    console.log(WEIGHT_SHIPMENT);
    console.log(WEIGHT_STATUS);
    var stateSip = shipments[WEIGHT_SHIPMENT][WEIGHT_STATUS];
    var cartons = stateSip.cartons;
    $('#weight-table').html("");
    var totalWeight = 0;

    var asenKeys = Object.keys(cartons).sort(numbersAlphAscending);
    $.each(asenKeys, function (index, value) {
        let c = value;
        $('#weight-table').append(`<tr>
                                <td>${cartons[c].carton}</td>
                                <td>${cartons[c].customer}</td>
                                <td>${cartons[c].products.length}</td>
                                <td class="text-right doubletd paste next-row-column calculate-total-weight" contenteditable="true">${cartons[c].weight}</td>
                            </tr>`);
        totalWeight += parseFloat(cartons[c].weight);
    });
    $('.weight-shipment').html(`Shipment ${shipments[WEIGHT_SHIPMENT].shipment}`);
    $('.total-weight').html(formatMoney(totalWeight));
    $(".doubletd").keypress(isNumberTD);
    $('.paste').on('paste', false);
    $(".next-row-column").keypress(nextRawColumn);
    $(".calculate-total-weight").keypress(getTotalWeight);
    $('#weight').modal({backdrop: 'static',keyboard: false}).modal('show');
}

$('#weight').on('shown.bs.modal', function () {
    $('#weight-table tr').eq(0).find('td').eq(3).focus();
});

function getTotalWeight(evnt) {
    if (evnt.keyCode === 13) {
        evnt.preventDefault();
        $(evnt.target).html(parseFloat($(evnt.target).html()).toFixed(2));
        var totalWeight = 0;
        $('#weight-table tr').each(function () {
            totalWeight += parseFloat($(this).find('td').eq(3).text().trim());
        });
        $('.total-weight').html(formatMoney(totalWeight));
    }
}

$('#weight-update').click(function (e) {
    var cartons = {};
    $('#weight-table tr').each(function () {
        if (cartons.hasOwnProperty($(this).find('td').eq(0).text().trim())) {
            cartons[$(this).find('td').eq(0).text().trim()].weight = $(this).find('td').eq(3).text().trim();
        } else {
            cartons[$(this).find('td').eq(0).text().trim()] = {weight: $(this).find('td').eq(3).text().trim()};
        }
    });
    if (Object.keys(cartons).length > 0) {
        $.ajax({
            url: "/weightUpdate",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({key: {shipment: WEIGHT_SHIPMENT, status: WEIGHT_STATUS}, data: cartons}),
            beforeSend: function (xhr) {
                $(e.target).find('i').removeClass('d-none');
                $(e.target).attr('disabled', 'true');
            },
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                if (data.status === "success") {
                    $(e.target).find('i').addClass('d-none');
                    $(e.target).removeAttr('disabled');
                    $('#weight').modal('hide');
                    if (data.isUpdate) {
                        shipments[WEIGHT_SHIPMENT] = data.data;
                    }
                    Lobibox.notify('success', {position: 'top right', msg: 'Successfully Executed Task'});
                } else if (data.status === "error") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.error});
                }
            }
        }).done(function (msg) {
        });
    }
});