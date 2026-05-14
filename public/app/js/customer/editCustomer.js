var isDestroy = false;
var uploadCrop = $('.customer-profile-edit');
var formData = new FormData();
var contactInput = document.querySelector('#customer-no');

var InputContact = window.intlTelInput(contactInput, {
    autoPlaceholder: 'polite',
    formatAsYouType: true,
    formatOnDisplay: true,
    nationalMode: true,
    separateDialCode: true,
    strictMode: true,
    initialCountry: "lk",
    preferredCountries: ['lk', 'in'],
    utilsScript: `${location.origin}/app/js/intl-utils.js`,
});


$(function () {
    $('#cutomer-profile').change(function () {
        var file = $(this).get(0).files[0];
        if (file) {
            var reader = new FileReader();

            reader.onload = function () {
                $(".customer-profile-edit").attr("src", reader.result);
                $('.cropped-ok').removeClass('d-none');
                $('.remove-profile').addClass('d-none');
                $("#customer-prfile-id").removeAttr('for');
                isDestroy = false;
                uploadCrop.croppie({
                    enableExif: true,
                    showZoomer: false,
                    viewport: {
                        width: 150,
                        height: 150,
                        type: 'circle'
                    },
                    boundary: {
                        width: 150,
                        height: 150
                    }
                });
            };

            reader.readAsDataURL(file);
        }
    });

    $('.cropped-ok').click(function () {

        uploadCrop.croppie('result', {
            type: 'rawcanvas',
            circle: true,
            size: { width: 300, height: 300 },
            format: 'png'
        }).then(function (canvas) {
            $('.cropped-ok').addClass('d-none');
            $(".customer-profile-edit").attr("src", canvas.toDataURL());
            $('.remove-profile').removeClass('d-none');
            $("#customer-prfile-id").attr('for', 'cutomer-profile');
            uploadCrop.croppie('result', { type: 'blob', format: 'png' }).then(function (blob) {
                formData = new FormData();
                formData.append('image', blob);
                uploadCrop.croppie('destroy');
                isDestroy = true;
            });
        });
    });

    $('.remove-profile').click(function () {
        formData = null;
        $('#cutomer-profile').val('');
        $(".customer-profile-edit").attr("src", '/images/useravtar.svg');
        $('.remove-profile').addClass('d-none');
    });
});

$('#save-customer').click(function () {
    if (selectCustomer !== null) {

        if (InputContact.isValidNumber()) {
            var NICNo = $('#customer-nic').val();
            if (NICNo && !((NICNo.length == 12 && $.isNumeric(NICNo)) || (NICNo.length == 10 && NICNo.toUpperCase().endsWith('V') && $.isNumeric(NICNo.substr(0, 9))))) {
                Lobibox.notify('warning', { position: 'top right', msg: 'Invalid NIC' });
                $('#customer-nic').focus();
                return;
            }

            if (formData === null) {
                formData = new FormData();
            }
            if ($(".customer-profile-edit").attr("src") === "/images/useravtar.svg") {
                formData.append('remove', "1");
            } else {
                formData.append('remove', "2");
            }

            formData.append('key', getKey(selectCustomer.name));
            formData.append('contact', InputContact.getNumber(window.intlTelInput.utils.numberFormat.E164));
            formData.append('showcontact', `+${InputContact.getSelectedCountryData().dialCode} ${$('#customer-no').val()}`);
            formData.append('aname', $('#customer-aname').val().toUpperCase());
            formData.append('address', $('#address').val().toUpperCase());
            formData.append('nic', $('#customer-nic').val().toUpperCase());
            formData.append('dob', $('#customer-dob').val().toUpperCase());
            formData.append('oaddress', $('#cutomer-other-address').val().toUpperCase());
            formData.append('company', $('#customer-company-name').val().toUpperCase());
            formData.append('coaddress', $('#customer-company-address').val().toUpperCase());


            $.ajax({
                url: "/editCustomer",
                type: "POST",
                data: formData,
                dataType: 'json',
                processData: false,
                contentType: false,
                beforeSend: function (xhr) {
                    $('#save-customer').find('i').removeClass('d-none');
                    $('#save-customer').attr('disabled', 'true');
                },
                headers: {
                    'CSRF-Token': Cookies.get('XSRF-TOKEN')
                },
                cache: false,
                success: function (data) {
                    if (data.status === "success") {
                        customerData[getKey(selectCustomer.name)] = data.data;
                        drawCustomerTable(customerData);

                        $('#editCustomer').modal('hide');

                        $('#save-customer').find('i').addClass('d-none');
                        $('#save-customer').removeAttr('disabled');

                        $('#cutomer-profile').val('');
                        $(".customer-profile-edit").attr("src", '/images/useravtar.svg');
                        $('.remove-profile').addClass('d-none');
                        formData = null;
                    } else if (data.status === "error") {
                        Lobibox.notify('warning', { position: 'top right', msg: data.error });
                    }
                },
                error: function (xhr, status, error) {
                    Lobibox.notify('warning', { position: 'top right', msg: error });
                }
            });
        } else {
            $('#customer-no').focus();
            Lobibox.notify('warning', { position: 'top right', msg: `Invalid Number` });
        }
    }
});

$(`#customer-no`).keydown((e) => {
    if (e.keyCode === 13 || e.keyCode === 9) {
        if (InputContact.isValidNumber()) {
            $('#customer-aname').focus();
        } else {
            Lobibox.notify('warning', { position: 'top right', msg: `Invalid Number` });
        }
    }
});

$(`#customer-aname`).keydown((e) => (e.keyCode === 13 || e.keyCode === 9) ? $('#address').focus() : true);
$(`#address`).keydown((e) => (e.keyCode === 13 || e.keyCode === 9) ? $('#customer-nic').focus() : true);
$(`#customer-nic`).keydown((e) => (e.keyCode === 13 || e.keyCode === 9) ? $('#cutomer-other-address').focus() : true);
$(`#cutomer-other-address`).keydown((e) => (e.keyCode === 13 || e.keyCode === 9) ? $('#customer-company-name').focus() : true);
$(`#customer-company-name`).keydown((e) => (e.keyCode === 13 || e.keyCode === 9) ? $('#customer-company-address').focus() : true);

