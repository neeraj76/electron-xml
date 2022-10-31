const XLSX = require("xlsx");
const { convertObjToXml } = require('../xml/convert');

function processWorkbook(workbook, callback) {
  workbook.SheetNames.forEach(sheetName => {
    console.log(`Sheet:${sheetName}`);
    let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    callback(rows);
  });
}

const processExcelFile = (path) => {
  const workbook = XLSX.readFile(path);
  const sheets = Object.keys(workbook.Sheets);

  console.log(`path=${path}`)

  processWorkbook(workbook, (rows) => {
    rows.forEach(row => {
      const xml = convertObjToXml(row);
      console.log(xml);
    })
  });

  return sheets;
}

module.exports = {
  processExcelFile
}