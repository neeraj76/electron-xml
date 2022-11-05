const { format: formatDate, parse: parseDate } = require('date-fns');
const isoDateFormat = "yyyy-MM-dd";

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

const DateFromString = (dateStr, format='ISO-Date') => {
  // third param is referenceData: defines values missing from the parsed dateString
  if (format === 'ISO-Date') {
    format = isoDateFormat;
  }
  return parseDate(dateStr, format, new Date());
}

module.exports = {
  DateToString,
  DateToStringDate,
  DateToStringTime,
  DateFromString
}