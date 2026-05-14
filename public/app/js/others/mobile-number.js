var isNumericInput = (event) => {
    var key = event.keyCode;
    return ((key >= 48 && key <= 57) || // Allow number line
            (key >= 96 && key <= 105) // Allow number pad
            );
};

var isModifierKey = (event) => {
    var key = event.keyCode;
    return (event.shiftKey === true || key === 35 || key === 36) || // Allow Shift, Home, End
            (key === 8 || key === 9 || key === 13 || key === 46) || // Allow Backspace, Tab, Enter, Delete
            (key > 36 && key < 41) || // Allow left, up, right, down
            (
                    // Allow Ctrl/Command + A,C,V,X,Z
                            (event.ctrlKey === true || event.metaKey === true) &&
                            (key === 65 || key === 67 || key === 86 || key === 88 || key === 90)
                            );
        };

        var enforceFormat = (event) => {
            // Input must be of a valid number format or a modifier key, and not longer than ten digits
            if (!isNumericInput(event) && !isModifierKey(event)) {
                event.preventDefault();
            }
        };

        var formatToPhone = (event) => {
            if (isModifierKey(event)) {
                return;
            }

            // I am lazy and don't like to type things more than once
            var target = event.target;
            var value = "";
            if (target.tagName !== 'INPUT') {
                value = target.innerHTML;
            } else {
                value = target.value;
            }
            if (!isEmpty(value)) {
                var input = value.replace(/\D/g, '').substring(0, 10); // First ten digits of input only
                var zip = input.substring(0, 3);
                var middle = input.substring(3, 6);
                var last = input.substring(6, 10);

                if (input.length > 6) {
                    if (target.tagName !== 'INPUT') {
                        target.innerHTML = `${zip} ${middle}  ${last}`;
                    } else {
                        target.value = `${zip} ${middle}  ${last}`;
                    }
                } else if (input.length > 3) {
                    if (target.tagName !== 'INPUT') {
                        target.innerHTML = `${zip} ${middle}`;
                    } else {
                        target.value = `${zip} ${middle}`;
                    }
                } else if (input.length > 0) {
                    if (target.tagName !== 'INPUT') {
                        target.innerHTML = `${zip}`;
                    } else {
                        target.value = `${zip}`;
                    }
                }

                if (target.tagName !== 'INPUT') {
                     positionCursor(target, target.innerHTML.length);
                }
               
            }
        };