const dateTallyFormat = (date) => {
  return date.toISOString().split('T')[0].replaceAll('-','');
}

module.exports = {
  dateTallyFormat
}