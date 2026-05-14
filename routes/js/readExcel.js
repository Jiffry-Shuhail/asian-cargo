const xlsxFile = require('read-excel-file/node');

function read(req, res) {
    console.log("****************************");
    console.log(req.files.excel);
    xlsxFile(req.files.excel, { sheet: 'Sheet1' }).then((rows) => {
        console.log(rows);
        console.table(rows);
    });
    res.end(JSON.stringify({status: "error", error: "Poda"}));
}

module.exports = {read};