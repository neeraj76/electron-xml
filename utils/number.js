const CleanNumberString = (numStr) => {
  const newNumberStr = numStr.replace(/,/g, '');
  return newNumberStr;
}

const NumberFromString = (numStr) => {
  const cleanedNumStr = CleanNumberString(numStr);

  if (cleanedNumStr.includes('.'))
    return parseFloat(cleanedNumStr)

  return parseInt(cleanedNumStr);
}

module.exports = {
  CleanNumberString,
  NumberFromString
}
