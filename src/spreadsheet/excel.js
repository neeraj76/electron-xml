const XLSX = require("xlsx");
const fs = require('fs');

function processWorkbook(workbook, callback) {
  workbook.SheetNames.forEach(sheetName => {
    console.log(`Processing sheet '${sheetName}'`);
    let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    callback(rows);
  });
}

const processExcelFile = (path, rowFunction) => {
  // console.log(`path=${path}`)

  if (!fs.existsSync(path)) {
    console.error(`file '${path}' does not exist`);
    return;
  }

  const workbook = XLSX.readFile(path, {cellDates: true});
  // const workbook = XLSX.readFile(path);
  const sheets = Object.keys(workbook.Sheets);

  try {
    processWorkbook(workbook, (rows) => {
      rows.forEach(row => {
        rowFunction(row);
      })
    });
  } catch (e) {
    console.log('Error processing the excel', e);
  }

  return sheets;
}

module.exports = {
  processExcelFile
}