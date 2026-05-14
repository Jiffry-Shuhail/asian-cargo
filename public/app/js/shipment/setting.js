$.getScript('/javascripts/Numbers.js');

$(function () {
    $(".double").keypress(isNumber);
    $(".integer").keypress(isIntNumber);
    $('.paste').on('paste', false);
});

var currentSetting = {shipment: null, status: null};

function setting(id, classname) {
    currentSetting.shipment = id;
    currentSetting.status = $(`.${classname}`).dropdown("get value");
    var stateSip = shipments[id][currentSetting.status];
    if (stateSip.hasOwnProperty('needWeight')) {
        $('#need-weight').val(stateSip.needWeight);
    } else {
        var cartons = stateSip.cartons;
        var totalNeedWeight = 0;
        for (var c in cartons) {
            totalNeedWeight += parseFloat(cartons[c].weight).round(2);
        }
        $('#need-weight').val(totalNeedWeight);
    }
    if (shipments[id].hasOwnProperty('editShipment')) {
        $('#shipment-no').val(shipments[id].editShipment);
    } else {
        $('#shipment-no').val(shipments[id].shipment);
    }

    if (shipments[id].hasOwnProperty('marks')) {
        $('#marks-numbers').val(shipments[id].marks);
    } else {
        $('#marks-numbers').val("ASC/CMB");
    }

    var date = null;
    if (shipments[id].hasOwnProperty('editDate')) {
        date = shipments[id].editDate;
    } else {
        date = shipments[id].date;
    }
    date = new Date(date._seconds * 1000);
    document.getElementById('shipment-date').valueAsDate = date;
    $('#save-setting').click(updateShipmentHeader);
    $('#setting').modal('show');
}

function updateShipmentHeader() {
    $.ajax({
        url: "/updateShipment",
        type: "POST",
        dataType: 'json',
        data: JSON.stringify({key: currentSetting, data: {
                needWeight: $('#need-weight').val(),
                editShipment: $('#shipment-no').val(),
                marks: $('#marks-numbers').val(),
                editDate: document.getElementById('shipment-date').valueAsDate
            }}),
        beforeSend: function (xhr) {
            $('#save-setting').find('i').removeClass('d-none');
            $('#save-setting').attr('disabled', 'true');
        },
        headers: {
            Accept: "application/json",
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        cache: false,
        success: function (data) {
            if (data.status === "success") {
                $('#save-setting').find('i').addClass('d-none');
                $('#save-setting').removeAttr('disabled');
                $('#setting').modal('hide');
                if (data.isUpdate) {
                    shipments[currentSetting.shipment] = data.data;
                    SHIPMENTTABLE.page(CURRENT_INDEX-1).draw('page');
                }
                Lobibox.notify('success', {position: 'top right', msg: 'Successfully Executed Task'});
            } else if (data.status === "error") {
                console.log(JSON.stringify(data.error));
                Lobibox.notify('warning', {position: 'top right', msg: data.error});
            }
        }
    }).done(function (msg) {
    });
}