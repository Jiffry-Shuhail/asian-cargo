var USER_INDEX = 1;

$(function () {

    var USER_ROW_COUNT = 6;

    $('.content-wrapper').addClass('d-none');
    $('#loader').removeClass('d-none');
    $('#usersSearchInput').removeClass('d-none');
    $(".nav li:nth-child(8)").find('img').removeClass('activenac');

    var usersTable = $('#usersTable').DataTable({
        lengthMenu: [[2, USER_ROW_COUNT, 8, -1], [2, 4, 8, "All"]],
        iDisplayLength: USER_ROW_COUNT,
        columnDefs: [{
                targets: '_all',
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('padding-top', '8px');
                    $(td).css('padding-bottom', '8px');
                    if (col === 3) {
                        $(td).css('padding', '0');
                    }
                    if (col === 0) {
                        $(td).css('width', '5%');
                        $(td).css('text-align', 'center');
                    }
                }
            }],
        drawCallback: function (settings) {
            $(`.ui.fluid.dropdown.dropdown-center`).dropdown({selectOnKeydown: false});
            $(`.ui.fluid.dropdown.dropdown-center.table-light`).dropdown({selectOnKeydown: false});
        },
        initComplete: function (settings, json) {
            $('#usersTable_info').hide();
            $('#usersTable_filter').hide();
            $('#usersTable_length').hide();
            $('#usersTable_paginate').hide();
        }
    });

//    usersTable.column(1).visible(false);


    $.get(`/getAllUsers`, function (data, status) {
        var response = JSON.parse(data);
        var idIndex = 0;
        $.each(response.data, function (index, value) {
            var classname = '';
            var classnames = '';
            if (idIndex % 2 === 0) {
                classname = 'table-light';
                classnames = '.table-light';
            }
            usersTable.row.add([`<img src='${value.photoURL}' class='customer-profile'/>`, value.displayName, value.email,
                `<select class="ui fluid dropdown dropdown-center table-transparent">
                        <option value=''>SELECT ACTION</option>
                        <option value='PRIVILEGES'>PRIVILEGES</option>
                        <option value='ACTIVE'>ACTIVE</option>
                    </select>`]).draw();
            $(`.ui.fluid.dropdown.dropdown-center.table-transparent`).dropdown({selectOnKeydown: false});
            idIndex++;
        });
        $('.content-wrapper').removeClass('d-none');
        $('#loader').addClass('d-none');
        var info = usersTable.page.info();
        $('.total-record').text(info.recordsTotal);
        $('.show-records').text(info.end);
        $('#previous-record').attr('disabled', 'true');
        if (USER_INDEX >= info.pages) {
            $('#next-record').attr('disabled', 'true');
        }
    });

    $('#next-record').click(function () {
        var info = usersTable.page.info();
        if (USER_INDEX < info.pages) {
            usersTable.page('next').draw('page');
            USER_INDEX++;

            var totalRows = USER_INDEX * USER_ROW_COUNT;
            if (totalRows > usersTable.rows().count()) {
                totalRows = usersTable.rows().count();
            }
            $('.show-records').text(totalRows);
        }

        if (USER_INDEX >= info.pages) {
            $('#next-record').attr('disabled', 'true');
        } else {
            $('#next-record').removeAttr('disabled');
        }

        if (USER_INDEX > 1) {
            $('#previous-record').removeAttr('disabled');
        } else {
            $('#previous-record').attr('disabled', 'true');
        }
    });

    $('#previous-record').click(function () {
        var info = usersTable.page.info();
        if (USER_INDEX > 1) {
            usersTable.page('previous').draw('page');
            USER_INDEX--;

            var totalRows = USER_INDEX * USER_ROW_COUNT;
            if (totalRows > usersTable.rows().count()) {
                totalRows = usersTable.rows().count();
            }
            $('.show-records').text(totalRows);
        }

        if (USER_INDEX >= info.pages) {
            $('#next-record').attr('disabled', 'true');
        } else {
            $('#next-record').removeAttr('disabled');
        }

        if (USER_INDEX > 1) {
            $('#previous-record').removeAttr('disabled');
        } else {
            $('#previous-record').attr('disabled', 'true');
        }
    });

    $('#usersSearchInput').find('input').keyup(function () {
        usersTable.search(this.value).draw();
        USER_INDEX = 1;
        var info = usersTable.page.info();
        $('#previous-record').attr('disabled', 'true');
        if (USER_INDEX >= info.pages) {
            $('#next-record').attr('disabled', 'true');
        }
    });
});

destroy = function () {
    $(".nav li:nth-child(8)").find('img').addClass('activenac');
    $('#usersSearchInput').addClass('d-none');
};