const XLSX = require("xlsx");
const XML = require("xml2js");

const processExcelFile = (path) => {
  const workbook = XLSX.readFile(path);
  const sheets = Object.keys(workbook.Sheets);

  console.log(`path=${path}`)

  const builder = new XML.Builder({headless: false, renderOpts: { pretty: true }});

  workbook.SheetNames.forEach(sheetName => {
    console.log(`Sheet:${sheetName}`);
    let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    rows.forEach(row => {
      // console.log(`${JSON.stringify(row, null, 2)}`);
      const xml = builder.buildObject(row);
      console.log(xml);
    })
  });

  return sheets;
}

module.exports = {
  processExcelFile
}