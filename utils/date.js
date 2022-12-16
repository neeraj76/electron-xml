const { format: formatDate, parse: parseDate } = require('date-fns');
const isoDateFormat = "yyyy-MM-dd";
const isoFormat = "yyyy-MM-ddTHH:mm:ss";

const DateToString = (date, format='ISO-Date') => {
  if (format === 'ISO-Date') {
    format = isoDateFormat;
  }

  return formatDate(date, format);
}

const DateToStringDate = (date) => {
  return DateToString(date).split('T')[0];
}

const DateToStringTime = (date) => {
  return DateToString(date).split('T')[1];
}

const DateFromDateString = (dateStr, format='ISO-Date') => {
  // third param is referenceData: defines values missing from the parsed dateString
  if (format === 'ISO-Date') {
    format = isoDateFormat;
  }
  return parseDate(dateStr, format, new Date());
}

const DateFromISOString = (dateStr) => {
  return new Date(dateStr);
}

const isDate = (val) => {
  return val instanceof Date && !isNaN(val)
}

module.exports = {
  DateToString,
  DateToStringDate,
  DateToStringTime,
  DateFromDateString,
  DateFromISOString,
  isDate
}