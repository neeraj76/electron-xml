// const dateformat = require('dateformat');

function JSDateToExcelDate(inDate) {
  const returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
  return returnDateTime.toString().substr(0,5);

}
function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}

module.exports = {
  ExcelDateToJSDate,
  JSDateToExcelDate
}