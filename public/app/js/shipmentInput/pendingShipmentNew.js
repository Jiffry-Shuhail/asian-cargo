var pendingShipmentKey = null;
function drawPendingSipmentNotifaction() {
    $('#notification-count').removeClass('d-none');
    $('#notifications').html("");
    $('#notifications').append(`<p class="mb-0 font-weight-normal float-left dropdown-header">Notifications</p>`);
    var index = 0;
    for (var ps in pendingShipments) {
        $('#notifications').append(`<div class='dropdown-item', id='notification-${index}'>
            <div class='item-thumbnail'>
                <button class='btn btn-inverse-danger item-icon btn-circle btn-sm' onclick='removeNotification('notification-${index}','${ps}');'>
                    <i class='mdi mdi-delete-variant mx-0'></i>
                </button>
                <div class='item-content' onclick='drawPendingShipment('notification-${index}','${ps}');'>
                    <h6 class='font-weight-normal'>${ps}</h6>
                    <p class='font-weight-light small-text mb-0 text-muted' style='font-size: 10px;'>
                        ${exporter[pendingShipments[ps].expotrer].exName}
                    </p>
                </div>
            </div>
        </div>`);
        index++;
    }
}

function removeNotification(id, shipmentID) {

    $.get(`/removePendingShipment?key=${shipmentID}`, function (data, status) { });

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
    pendingShipmentKey = shipmentID;

    if (pendingShipments[shipmentID].isEdit) {
        editShipment = pendingShipments[shipmentID].editShipment;
        editShipmentStatus = pendingShipments[shipmentID].editStatus;
    }

    CURRENTSHIPMENT = pendingShipments[shipmentID].currentShip;

    $('#shipment-status').dropdown("set selected", CURRENTSHIPMENT.activeStatus);
    DEFAULTSTATUSVALUE = CURRENTSHIPMENT.activeStatus;

    $('#shipment-number').html(CURRENTSHIPMENT.editShipment ? CURRENTSHIPMENT.editShipment : CURRENTSHIPMENT.shipment);
    $(`#shipment-no`).val(CURRENTSHIPMENT.editShipment ? CURRENTSHIPMENT.editShipment : CURRENTSHIPMENT.shipment);

    $(`#View-ExporterName`).html(exporter[getKey(CURRENTSHIPMENT.exporter)].exName.trim());
    $("#exporter").dropdown("set selected", CURRENTSHIPMENT.exporter);

    $(`#View-MarksNumber`).html(CURRENTSHIPMENT.marks);
    $(`#marks-numbers`).val(CURRENTSHIPMENT.marks);

    $(`#View-ContainerFeet`).html(`0 CBM Completed <small> of ${SYSTEMCONTAINER[$(`#container`).dropdown('get value')].cbm} CBM | ${SYSTEMCONTAINER[$(`#container`).dropdown('get value')].name}</small>`);
    $('#example5').progress({
        duration: 1000,
        total: SYSTEMCONTAINER[$(`#container`).dropdown('get value')].cbm
    });

    insertStartCartonNumber();
    updateOverview();

    $('.content-wrapper').removeClass('d-none');
    $('#loader').addClass('d-none');
}