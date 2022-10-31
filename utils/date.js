const DateToString = (date) => {
  return date.toISOString();
}

const DateToStringDate = (date) => {
  return DateToString(date).split('T')[0];
}

const DateToStringTime = (date) => {
  return DateToString(date).split('T')[1];
}

module.exports = {
  DateToString,
  DateToStringDate,
  DateToStringTime
}