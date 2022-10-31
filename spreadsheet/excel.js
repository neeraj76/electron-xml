const XLSX = require("xlsx");
const { convertObjToXml } = require('../xml/convert');
const { processRowTally } = require('./excel_tally');
const fs = require('fs');

function processWorkbook(workbook, callback) {
  workbook.SheetNames.forEach(sheetName => {
    console.log(`Sheet:${sheetName}`);
    let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    callback(rows);
  });
}

const processExcelFile = (path) => {
  // console.log(`path=${path}`)

  if (!fs.existsSync(path)) {
    console.error(`file '${path}' does not exist`);
    return;
  }

  const workbook = XLSX.readFile(path);
  const sheets = Object.keys(workbook.Sheets);

  processWorkbook(workbook, (rows) => {
    rows.forEach(row => {
      processRowTally(row);

      // const xml = convertObjToXml(row);
      // console.log(xml);
    })
  });

  return sheets;
}

module.exports = {
  processExcelFile
}