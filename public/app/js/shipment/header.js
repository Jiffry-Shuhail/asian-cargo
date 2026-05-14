$('[data-toggle="popover"]').popover({
    placement: 'top',
    trigger: 'hover'
});

var HEADER_SHIPMENT = null;
var HEADER_STATUS = null;

var NEW_HEADER = null;
var NEW_HEADER_SELECTION = {};
var selectionActive = function (instance, x1, y1, x2, y2, origin) {
    var cellName1 = jexcel.getColumnNameFromId([x1, y1]);
    var cellName2 = jexcel.getColumnNameFromId([x2, y2]);

    var sRows = $("#spreadsheet").jexcel("getSelectedRows", true);
    var sCols = $("#spreadsheet").jexcel("getSelectedColumns", true);

    NEW_HEADER_SELECTION.firstcell = cellName1;
    NEW_HEADER_SELECTION.colspan = sCols.length;
    NEW_HEADER_SELECTION.rowspan = sRows.length;
    var cell = NEW_HEADER.getStyle(cellName1);

    if (cell.includes('text-align: center')) {
        $('#center-text-header').addClass('active');
    } else {
        $('#center-text-header').removeClass('active');
    }

    if (cell.includes('text-align: right')) {
        $('#right-text-header').addClass('active');
    } else {
        $('#right-text-header').removeClass('active');
    }

    if (cell.includes('text-align: left')) {
        $('#left-text-header').addClass('active');
    } else {
        $('#left-text-header').removeClass('active');
    }

    if (cell.includes('font-weight: bold')) {
        $('#bold-text-header').addClass('active');
    } else {
        $('#bold-text-header').removeClass('active');
    }
};



function header(shipment, classname) {
    HEADER_SHIPMENT = shipment;
    HEADER_STATUS = $(`.${classname}`).dropdown("get value");
    var headerSip = shipments[HEADER_SHIPMENT];
    var headerState = "Default";
    if (headerSip.hasOwnProperty('headerState')) {
        headerState = headerSip.headerState;
    }
    if (headerState === 'Default') {
        setDefault();
    } else if (headerState === 'Edit') {
        setEdited();
    } else {
        setNewTableHead();
    }
    $('#header').modal('show');
}

function setDefault() {
    $('.default-edit').removeClass('d-none');
    $('.new-header-button').addClass('d-none');
    $('.new-header-tab').addClass('d-none');

    $('#default-header').addClass('active');
    $('#edit-header').removeClass('active');
    $('#new-header').removeClass('active');
    var headerSip = shipments[HEADER_SHIPMENT];
    var headerExporter = exporters[headerSip.exporter];
    $('#header-exporter').html(`Exporter :- ${headerExporter.exName}<br>${headerExporter.exAddress.split(',').join(',<br>')}<br><br>TEL : ${headerExporter.exContactNumber}`);
    $('#header-expoter-ref').html(`Exporters&CloseCurlyQuote;s Ref <br>IEC No: ${headerSip.exporter}`);
    $('#header-consignee').html(`CONSIGNEE :- ${headerExporter.conName}<br>${headerExporter.conAddress}`);
    $('#header-buyer').html(`BUYER:-  ${headerExporter.buyer}`);
    $('#header-country-of-orgine').html(`Country Of Origin Goods<br>${headerExporter.countryOfOriginGoods}`);
    $('#header-country-of-destination').html(`Country Of Final Destination<br>${headerExporter.countryOfFinalDestination}`);
    $('#header-port-of-loading').html(`Port of Loading<br>${headerExporter.portofLoading}`);
    $('#header-port-of-discharge').html(`Port of Discharge<br>${headerExporter.portofDischarge}`);
    $('#header-terms').html(`Terms of Delivery And Payments<br>${headerExporter.TermsofDeliveryAndPayments}`);

    $('#header-exporter').removeAttr('contenteditable');
    $('#header-expoter-ref').removeAttr('contenteditable');
    $('#header-consignee').removeAttr('contenteditable');
    $('#header-buyer').removeAttr('contenteditable');
    $('#header-country-of-orgine').removeAttr('contenteditable');
    $('#header-country-of-destination').removeAttr('contenteditable');
    $('#header-port-of-loading').removeAttr('contenteditable');
    $('#header-port-of-discharge').removeAttr('contenteditable');
    $('#header-terms').removeAttr('contenteditable');
}

function setEdited() {
    var headerSip = shipments[HEADER_SHIPMENT];

    if (headerSip.hasOwnProperty('edit')) {
        var headerExporter = headerSip.edit;

        $('#header-exporter').html(headerExporter.exporter);
        $('#header-expoter-ref').html(headerExporter.expoterref);
        $('#header-consignee').html(headerExporter.consignee);
        $('#header-buyer').html(headerExporter.buyer);
        $('#header-country-of-orgine').html(headerExporter.countryOfOriginGoods);
        $('#header-country-of-destination').html(headerExporter.countryOfFinalDestination);
        $('#header-port-of-loading').html(headerExporter.portofLoading);
        $('#header-port-of-discharge').html(headerExporter.portofDischarge);
        $('#header-terms').html(headerExporter.TermsofDeliveryAndPayments);
    }


    $('.default-edit').removeClass('d-none');
    $('.new-header-button').addClass('d-none');
    $('.new-header-tab').addClass('d-none');

    $('#edit-header').addClass('active');
    $('#default-header').removeClass('active');
    $('#new-header').removeClass('active');

    $('#header-exporter').attr('contenteditable', 'true');
    $('#header-expoter-ref').attr('contenteditable', 'true');
    $('#header-consignee').attr('contenteditable', 'true');
    $('#header-buyer').attr('contenteditable', 'true');
    $('#header-country-of-orgine').attr('contenteditable', 'true');
    $('#header-country-of-destination').attr('contenteditable', 'true');
    $('#header-port-of-loading').attr('contenteditable', 'true');
    $('#header-port-of-discharge').attr('contenteditable', 'true');
    $('#header-terms').attr('contenteditable', 'true');
}

function setNewTableHead() {
    $('.default-edit').addClass('d-none');
    $('.new-header-button').removeClass('d-none');
    $('.new-header-tab').removeClass('d-none');

    $('#new-header').addClass('active');
    $('#default-header').removeClass('active');
    $('#edit-header').removeClass('active');

    if (!isEmpty($('#spreadsheet').html())) {
        $('#spreadsheet').jexcel('destroy');
    }

    var headerSip = shipments[HEADER_SHIPMENT];
    if (headerSip.hasOwnProperty('new')) {
        var cols = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

        var data = headerSip.new;

        var dataTable = [];
        var style = {};
        var merged = {};
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            var dataTableRow = [];
            for (var j in row) {
                if (row[j].hasOwnProperty('text')) {
                    dataTableRow.push(row[j].text);
                } else {
                    dataTableRow.push('');
                }

                var styles = "";
                if (row[j].hasOwnProperty('alignment')) {
                    styles += "text-align: " + row[j].alignment + "; ";
                }

                if (row[j].hasOwnProperty('style')) {
                    styles += "font-weight: bold";
                }

                if (styles !== "") {
                    style[cols[j] + "" + (i + 1)] = styles;
                }

                if (row[j].hasOwnProperty('colSpan')) {
                    merged[cols[j] + "" + (i + 1)] = [row[j].colSpan, row[j].rowSpan];
                }
            }
            dataTable.push(dataTableRow);
        }

        var options = {
            data: dataTable,
            mergeCells: merged,
            defaultColAlign: 'left',
            tableOverflow: true,
            style: style,
            onselection: selectionActive,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteColumn: false,
            allowRenameColumn: false
        };
        NEW_HEADER = $('#spreadsheet').jexcel(options);
        $('#spreadsheet table').find('colgroup col').first().width("1em").attr("width", "1em");
    } else {
        newTableHeadCreate();
    }
}

function newTableHeadCreate() {
    var options = {
        minDimensions: [9, 9],
        tableOverflow: true,
        defaultColAlign: 'left',
        onselection: selectionActive,
        allowInsertColumn: false,
        allowManualInsertColumn: false,
        allowDeleteColumn: false,
        allowRenameColumn: false
    };

    NEW_HEADER = $('#spreadsheet').jexcel(options);
    $('#spreadsheet table').find('colgroup col').first().width("1em").attr("width", "1em");
}

$(function () {
    newTableHeadCreate();
    $('#merge-header').click(function () {
        NEW_HEADER.setMerge(NEW_HEADER_SELECTION.firstcell, NEW_HEADER_SELECTION.colspan, NEW_HEADER_SELECTION.rowspan);
    });

    $('#unmerge-header').click(function () {
        NEW_HEADER.removeMerge(NEW_HEADER_SELECTION.firstcell);
    });

    $('#center-text-header').click(function () {
        var cell = NEW_HEADER.getStyle(NEW_HEADER_SELECTION.firstcell);
        if (cell.includes('text-align: center')) {
            NEW_HEADER.setStyle(NEW_HEADER_SELECTION.firstcell, 'text-align', 'left');
            $('#center-text-header').removeClass('active');
        } else {
            NEW_HEADER.setStyle(NEW_HEADER_SELECTION.firstcell, 'text-align', 'center');
            $('#center-text-header').addClass('active');
        }
    });

    $('#left-text-header').click(function () {
        var cell = NEW_HEADER.getStyle(NEW_HEADER_SELECTION.firstcell);
        if (!cell.includes('text-align: left')) {
            NEW_HEADER.setStyle(NEW_HEADER_SELECTION.firstcell, 'text-align', 'left');
            $('#left-text-header').addClass('active');
        }
    });

    $('#right-text-header').click(function () {
        var cell = NEW_HEADER.getStyle(NEW_HEADER_SELECTION.firstcell);
        if (cell.includes('text-align: right')) {
            NEW_HEADER.setStyle(NEW_HEADER_SELECTION.firstcell, 'text-align', 'left');
            $('#right-text-header').removeClass('active');
        } else {
            NEW_HEADER.setStyle(NEW_HEADER_SELECTION.firstcell, 'text-align', 'right');
            $('#right-text-header').addClass('active');
        }
    });

    $('#bold-text-header').click(function () {
        var cell = NEW_HEADER.getStyle(NEW_HEADER_SELECTION.firstcell);
        if (cell.includes('font-weight: bold')) {
            NEW_HEADER.setStyle(NEW_HEADER_SELECTION.firstcell, 'font-weight', 'normal');
            $('#bold-text-header').removeClass('active');
        } else {
            NEW_HEADER.setStyle(NEW_HEADER_SELECTION.firstcell, 'font-weight', 'bold');
            $('#bold-text-header').addClass('active');
        }
    });

    $('#create-new-header').click(function () {
        if (!isEmpty($('#spreadsheet').html())) {
            $('#spreadsheet').jexcel('destroy');
        }
        newTableHeadCreate();
    });

    $('#default-header').click(setDefault);

    $('#edit-header').click(setEdited);

    $('#new-header').click(setNewTableHead);

    $('#header-save').click(function () {
        var headerState = "";
        var key = "edit";
        if ($('#edit-header').hasClass('active')) {
            key = "edit";
            headerState = {edit: {
                    exporter: $('#header-exporter').html(),
                    expoterref: $('#header-expoter-ref').html(),
                    consignee: $('#header-consignee').html(),
                    buyer: $('#header-buyer').html(),
                    countryOfOriginGoods: $('#header-country-of-orgine').html(),
                    countryOfFinalDestination: $('#header-country-of-destination').html(),
                    portofLoading: $('#header-port-of-loading').html(),
                    portofDischarge: $('#header-port-of-discharge').html(),
                    TermsofDeliveryAndPayments: $('#header-terms').html()
                }};
        } else if ($('#new-header').hasClass('active')) {
            key = "new";
            var data = NEW_HEADER.getData();
            var dataMerge = NEW_HEADER.getMerge();
            headerState = [];
            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                var headerRow = {};
                for (var j = 0; j < row.length; j++) {
                    if (!isEmpty(row[j])) {
                        var cell = {text: row[j]};
                        var cellName1 = jexcel.getColumnNameFromId([j, i]);
                        var styles = NEW_HEADER.getStyle(cellName1);
                        if (dataMerge.hasOwnProperty(cellName1)) {
                            var merged = dataMerge[cellName1];
                            if (merged[0] > 0) {
                                cell.colSpan = merged[0];
                            }

                            if (merged[1] > 0) {
                                cell.rowSpan = merged[1];
                            }

                            if (styles.includes('center')) {
                                cell.alignment = 'center';
                            }

                            if (styles.includes('right')) {
                                cell.alignment = 'right';
                            }

                            if (styles.includes('bold')) {
                                cell.style = 'Bold';
                            }
                        }
                        headerRow[j] = cell;
                    } else {
                        headerRow[j] = {};
                    }
                }
                headerState.push(headerRow);
            }
        } else {
            key = "Default";
        }
        $.ajax({
            url: "/updateShipmentHeader",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({key: HEADER_SHIPMENT, data: headerState, headerState: key}),
            beforeSend: function (xhr) {
                $('#header-save').find('i').removeClass('d-none');
                $('#header-save').attr('disabled', 'true');
            },
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            cache: false,
            success: function (data) {
                if (data.status === "success") {
                    $('#header-save').find('i').addClass('d-none');
                    $('#header-save').removeAttr('disabled');
                    $('#header').modal('hide');
                    if (data.isUpdate) {
                        shipments[HEADER_SHIPMENT] = data.data;
                    }
                    Lobibox.notify('success', {position: 'top right', msg: 'Successfully Executed Task'});
                } else if (data.status === "empty") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.msg});
                } else if (data.status === "error") {
                    Lobibox.notify('warning', {position: 'top right', msg: data.error.details});
                }
            }
        }).done(function (msg) {
        });

    });

});