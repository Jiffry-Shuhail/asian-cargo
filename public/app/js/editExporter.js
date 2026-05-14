$(function () {
    $.getScript('/app/js/others/validation.js');
    $(".fitstCapitalLetter").keyup(fitstCapitalLetter);
    $(".double").keypress(isNumber);
    $(".integer").keypress(isIntNumber);
    $('.paste').on('paste', false);
    var isAddNewExporter = false;

    var fieldsTree = {
        field: "reference-no",
        msg: "Reference No",
        validation: true,
        next: {
            field: "exporter-name",
            msg: "Exporter Name",
            validation: true,
            next: {
                field: "contact-number",
                msg: "Contact Number",
                validation: true,
                next: {
                    field: "address",
                    msg: "Address",
                    validation: true,
                    next: {
                        field: "buyer",
                        msg: "Buyer",
                        validation: true,
                        next: {
                            field: "consignee",
                            msg: "Consignee",
                            validation: true,
                            next: {
                                field: "consignee-address",
                                msg: "Consignee Address",
                                validation: true,
                                next: {
                                    field: "country-of-final-destination",
                                    msg: "Country of final destination",
                                    validation: true,
                                    next: {
                                        field: "country-of-origin-goods",
                                        msg: "Country of origin Goods",
                                        validation: true,
                                        next: {
                                            field: "port-of-discharge",
                                            msg: "Port of discharge",
                                            validation: true,
                                            next: {
                                                field: "port-of-loading",
                                                msg: "Port of loading",
                                                validation: true,
                                                next: {
                                                    field: "terms-of-delivery-and-payments",
                                                    msg: "Terms of delivery and payments",
                                                    validation: true,
                                                    next: {
                                                        field: "packing-charges",
                                                        msg: "Packing charges",
                                                        validation: false,
                                                        next: {
                                                            field: "weight-charges",
                                                            msg: "Weight charges",
                                                            validation: false,
                                                            next: null
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    $('#save-exporter').click(function () {
        if (isValid(fieldsTree)) {
            isAddNewExporter = true;

            var weightCharges = $('#weight-charges').val().trim().toUpperCase();
            if (isEmpty(weightCharges)) {
                weightCharges = "140";
            }

            var packingCharges = $('#packing-charges').val().trim().toUpperCase();
            if (isEmpty(packingCharges)) {
                packingCharges = "225";
            }

            var exporterDetails = {
                exRef: $('#reference-no').val().trim().toUpperCase(),
                exName: $('#exporter-name').val().trim().toUpperCase(),
                exAddress: $('#address').val().trim().toUpperCase(),
                exContactNumber: $('#contact-number').val().trim().toUpperCase(),
                conName: $('#consignee').val().trim().toUpperCase(),
                conAddress: $('#consignee-address').val().trim().toUpperCase(),
                buyer: $('#buyer').val().trim().toUpperCase(),
                countryOfOriginGoods: $('#country-of-origin-goods').val().trim().toUpperCase(),
                countryOfFinalDestination: $('#country-of-final-destination').val().trim().toUpperCase(),
                portofLoading: $('#port-of-loading').val().trim().toUpperCase(),
                portofDischarge: $('#port-of-discharge').val().trim().toUpperCase(),
                weightCharges: weightCharges,
                packingCharges: packingCharges,
                TermsofDeliveryAndPayments: $('#terms-of-delivery-and-payments').val().trim().toUpperCase(),
                shipment: parseInt($('#shipment-count-number').val().trim().toUpperCase())
            };
            
            $.ajax({
                url: "/addExporter",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({key:getKey(exporterDetails.exRef),data:exporterDetails}),
                headers: {
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN')
                },
                cache: false,
                success: function (data) {
                    if (data.status === "error") {
                        Lobibox.notify('warning', {position: 'top right', msg: data.error});
                    } else {
                        exporter[getKey(exporterDetails.exRef)]=exporterDetails;
                        $('#exporter > .menu').append(`<div class="item" data-value="${$('#reference-no').val().trim().toUpperCase()}">${$('#exporter-name').val().trim().toUpperCase()}</div>`);
                        $('#exporter').dropdown('refresh');
                        $("#exporter").dropdown("set selected", getKey(exporterDetails.exRef));
                        $('#editExporter').modal('hide');
                        getShipmentCount(exporterDetails.exRef);
                    }
                },
                error: function (xhr, status, error) {
                    var err = eval("(" + xhr.responseText + ")");
                    Lobibox.notify('warning', {position: 'top right', msg: err.Message});
                }
            });
        }
    });

//Model On Close
    $("#editExporter").on('hidden.bs.modal', function () {
        if (!isAddNewExporter) {
            $("#exporter").dropdown("set selected", 'ABEPE2529H');
        }
        isAddNewExporter = false;
    });

//Field Focus
    focusFormFields(fieldsTree);

});
