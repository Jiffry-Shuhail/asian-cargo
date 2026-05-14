var VMONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var numbersAlphAscendingJSON = (a, b) => {

    // if item is a number
    if (Number(a.carton) && Number(b.carton)) {
        return a.cartoons - b.cartoons;
    }

    // if item is a string
    if (!Number(a.carton) && !Number(b.carton)) {
        return a.carton.toLowerCase() > b.carton.toLowerCase();
    }

    // numbers before strings
    return Number(a.carton) ? -1 : 1;

};

function dateFormatForTimeStamp(date) {
    date = new Date(date._seconds * 1000);
    return VMONTHS[date.getMonth()] + " " + ((date.getDate() < 10) ? ("0" + date.getDate()) : date.getDate()) + ", " + date.getFullYear();
}

var accendingInDate = (a, b) => {

    let dateA = new Date(a.date._seconds * 1000);
    let dateB = new Date(b.date._seconds * 1000);
    // numbers before strings
    return  dateB - dateA;

};

var reA = /[^a-zA-Z]/g;
var reN = /[^0-9]/g;

var numbersAlphAscending = (a, b) => {
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if (aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
};

function isNumber(evnt) {
    if (evnt.keyCode === 13) {
        evnt.preventDefault();
    }
    var charC = (evnt.which) ? evnt.which : evnt.keyCode;
    if (charC === 46) {
        if (evnt.target.value.indexOf('.') === -1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (charC > 31 && (charC < 48 || charC > 57))
            return false;
    }

    return true;
}

function isNumberTD(evnt) {
    if (evnt.keyCode === 13) {
        evnt.preventDefault();
    }
    var charC = (evnt.which) ? evnt.which : evnt.keyCode;
    if (charC === 46) {
        if (evnt.target.innerHTML.indexOf('.') === -1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (charC > 31 && (charC < 48 || charC > 57))
            return false;
    }

    return true;
}

function isIntNumber(evnt) {
    if (evnt.keyCode === 13) {
        evnt.preventDefault();
    }
    var charC = (evnt.which) ? evnt.which : evnt.keyCode;
    if (charC > 31 && (charC < 48 || charC > 57))
        return false;

    return true;
}

function isEmpty(val) {

    // test results
    //---------------
    // []        true, empty array
    // {}        true, empty object
    // null      true
    // undefined true
    // ""        true, empty string
    // ''        true, empty string
    // 0         false, number
    // true      false, boolean
    // false     false, boolean
    // Date      false
    // function  false

    if (val === undefined)
        return true;

    if (typeof (val) == 'function' || typeof (val) == 'number' || typeof (val) == 'boolean' || Object.prototype.toString.call(val) === '[object Date]')
        return false;

    if (val == null || val.length === 0)        // null or 0 length array
        return true;

    if (typeof (val) == "object") {
        // empty object

        var r = true;

        for (var f in val)
            r = false;

        return r;
    }

    return false;
}

function isValidateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function fitstCapitalLetter(e) {
    if (!isEmpty(e.target.value)) {

        var str = e.target.value.split(" ");
        for (var i = 0, x = str.length; i < x; i++) {
            if (!isEmpty(str[i])) {
                str[i] = str[i][0].toUpperCase() + str[i].substr(1).toLowerCase();
            }
        }

        e.target.value = str.join(" ");
    }
}

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.log(e);
}
}

function round(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

function isHTML(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
}

function isValid(fields) {
    if (fields.validation) {
        if (!isEmpty($(`#${fields.field}`).val().trim())) {
            if (!isEmpty(fields.next)) {
                return isValid(fields.next);
            } else {
                return true;
            }
        } else {
            Lobibox.notify('warning', {position: 'top right', msg: `You cant save without <b>${fields.msg}</b>`});
            $(`#${fields.field}`).focus();
            return false;
        }
    } else if (!isEmpty(fields.next)) {
        return isValid(fields.next);
    } else {
        return true;
    }
}

function focusFormFields(fields) {
    $(`#${fields.field}`).keypress(function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (fields.validation) {
                if (!isEmpty($(`#${fields.field}`).val().trim())) {
                    if (!isEmpty(fields.next)) {
                        $(`#${fields.next.field}`).focus();
                    }
                } else {
                    Lobibox.notify('warning', {position: 'top right', msg: `You cant move next step without <b>${fields.msg}</b>`});
                    $(`#${fields.field}`).focus();
                    return false;
                }
            } else {
                if (!isEmpty(fields.next)) {
                    $(`#${fields.next.field}`).focus();
                }
            }
        }
    });
    if (!isEmpty(fields.next)) {
        focusFormFields(fields.next);
    }
}

function ignoreSimble(evnt) {
    if (evnt.keyCode === 13) {
        evnt.preventDefault();
    }

    if (!evnt.key.match(/^[~`!@#$%\^&*()+=\-\[\]\\';.,/{}|\\":<>\?]$/i))
        return true;

    return false;
}

function getKey(name) {
    if (name.includes("/")) {
        name = name.replaceAll(/\//g, '-');
    }

    if (name.includes(".")) {
        name = name.replaceAll(/\./g, '-');
    }

    if (name.includes("+")) {
        name = name.replaceAll(/\+/g, '-');
    }

    if (name.includes("*")) {
        name = name.replaceAll(/\*/g, '-');
    }

    if (name.includes("&")) {
        name = name.replaceAll(/\&/g, 'AND');
    }

    if (name.includes("&NBSP;")) {
        name = name.replaceAll(/\&NBSP;/g, '');
    }

    if (name.includes("#")) {
        name = name.replaceAll(/\#/g, '-');
    }

    if (name.includes("$")) {
        name = name.replaceAll(/\$/g, '-');
    }

    return name;
}

function selectText(node) {
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

function nextColumn(event) {
    var Table = event.target.parentNode.parentNode.parentNode;
    if (event.keyCode === 13) {
        event.preventDefault();
        Table.rows[event.target.parentNode.rowIndex].cells[event.target.cellIndex + 1].focus();
        selectText(Table.rows[event.target.parentNode.rowIndex].cells[event.target.cellIndex + 1]);
    }
}

function nextRawColumn(event) {
    var Table = event.target.parentNode.parentNode.parentNode;
    if (event.keyCode === 13) {
        event.preventDefault();
        if (Table.rows.length !== (event.target.parentNode.rowIndex + 1)) {
            Table.rows[event.target.parentNode.rowIndex + 1].cells[event.target.cellIndex].focus();
            selectText(Table.rows[event.target.parentNode.rowIndex + 1].cells[event.target.cellIndex]);
        }
    }
}

function onlyOneDashForTD(evnt) {
    if (evnt.keyCode === 13) {
        evnt.preventDefault();
    }
    var charC = (evnt.which) ? evnt.which : evnt.keyCode;
    if (charC === 58) {
        if (evnt.target.innerHTML.indexOf(':') === -1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (charC > 31 && (charC < 48 || charC > 57) && (charC < 65 || charC > 90) && (charC < 97 || charC > 123) && charC !== 32) {
            return false;
        }
    }

    return true;
}

function positionCursor(tag, index) {

    // Creates range object 
    var setpos = document.createRange();

    // Creates object for selection 
    var set = window.getSelection();

    // Set start position of range 
    setpos.setStart(tag.childNodes[0], index);

    // Collapse range within its boundary points 
    // Returns boolean 
    setpos.collapse(true);

    // Remove all ranges set 
    set.removeAllRanges();

    // Add range with respect to range object. 
    set.addRange(setpos);

    // Set cursor on focus 
    tag.focus();
}

function isValidatePhone(txtPhone) {
    var filter = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
    if (filter.test(txtPhone)) {
        return true;
    } else {
        return false;
    }
}

function sortJSON(arr, key, way) {
    return arr.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        if (way === '123') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        if (way === '321') {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}