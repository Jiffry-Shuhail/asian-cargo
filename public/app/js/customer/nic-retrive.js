$(function () {
    $("#customer-nic").keyup(nicRetrive);
    $("#customer-nic").keydown(nicValidate);
});


var nicValidate = (e)=>{
    var charCode = e.keyCode;

    if ([46, 8, 9, 27, 13, 190].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl/cmd+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl/cmd+C
                (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl/cmd+X
                (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl/cmd+V
                (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl/cmd+Z
                (e.keyCode === 90 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // Let it happen, don't do anything
                return;
            }

    if(/^\d{9}[vV]$/.test($(e.target).val().trim()) || /^\d{12}$/.test($(e.target).val().trim())){
        e.preventDefault();
        return false;
    }else if ((/^\d{9}$/.test($(e.target).val().trim()) && charCode===86)){
        return;
    }else if((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
    (e.keyCode < 96 || e.keyCode > 105)){
        e.preventDefault();
        return false;
    }
};

var nicRetrive = () => {
    var NICNo = $("#customer-nic").val();
    var dayText = 0;
    var year = "";
    var month = "";
    var day = "";
    var gender = "";
    if (NICNo.length == 12 || (NICNo.length == 10 && NICNo.toUpperCase().endsWith('V') && $.isNumeric(NICNo.substr(0, 9)))) {
        // Year
        if (NICNo.length == 10) {
            year = "19" + NICNo.substr(0, 2);
            dayText = parseInt(NICNo.substr(2, 3));
        } else {
            year = NICNo.substr(0, 4);
            dayText = parseInt(NICNo.substr(4, 3));
        }

        // Gender
        if (dayText > 500) {
            gender = "Female";
            dayText = dayText - 500;
        } else {
            gender = "Male";
        }

        // Day Digit Validation
        if (dayText < 1 && dayText > 366) {
            $("#error").html("Invalid NIC NO");
        } else {

            //Month
            if (dayText > 335) {
                day = dayText - 335;
                //                month = "December";
                month = "12";
            } else if (dayText > 305) {
                day = dayText - 305;
                month = "11";
            } else if (dayText > 274) {
                day = dayText - 274;
                month = "10";
            } else if (dayText > 244) {
                day = dayText - 244;
                month = "09";
            } else if (dayText > 213) {
                day = dayText - 213;
                month = "08";
            } else if (dayText > 182) {
                day = dayText - 182;
                month = "07";
            } else if (dayText > 152) {
                day = dayText - 152;
                month = "06";
            } else if (dayText > 121) {
                day = dayText - 121;
                month = "05";
            } else if (dayText > 91) {
                day = dayText - 91;
                month = "04";
            } else if (dayText > 60) {
                day = dayText - 60;
                month = "03";
            } else if (dayText < 32) {
                month = "01";
                day = dayText;
            } else if (dayText > 31) {
                day = dayText - 31;
                month = "02";
            }



            var dob = `${year}-${month}-${day.toString().padStart(2, '0')}`;
            $('#customer-dob').val(dob);
            $(`#customer-nic-text`).html(`<b>${gender === "Female" ? 'She' : 'He'}</b> <small>is</small> <b>${getAge(dob)}</b> <small> years old and Date of Birth is</small> <b>${dob}</b>`);
        }
    }else{
        $('#customer-dob').val('');
        $(`#customer-nic-text`).html('');
    }
};

function getAge(DOB) {
    var today = new Date();
    var birthDate = new Date(DOB);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m === 0 && today.getDate() < birthDate.getDate()) {
        age = age - 1;
    }

    return age;
}