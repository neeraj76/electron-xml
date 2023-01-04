const {endOfDay, format} = require("date-fns");

const dateTallyCreateVoucherFormat = (date) => {
  console.log(`date=${date} ${typeof (date)}`);
  return format(endOfDay(date),"yyyyMMdd");
}

const dateTallyModifyVoucherFormat = (date) => {
  return format(endOfDay(date),"dd-MMM-yyyy");
}

module.exports = {
  dateTallyCreateVoucherFormat,
  dateTallyModifyVoucherFormat
}