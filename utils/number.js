const CleanNumberString = (numStr) => {
  if (numStr instanceof String) {
    const newNumberStr = numStr.replace(/,/g, '');
    return newNumberStr;
  }
  return numStr;
}

const NumberFromString = (numStr) => {
  if (numStr instanceof String) {
    const cleanedNumStr = CleanNumberString(numStr);

    if (cleanedNumStr.includes('.'))
      return parseFloat(cleanedNumStr)

    return parseInt(cleanedNumStr);
  }

  return numStr;
}

module.exports = {
  CleanNumberString,
  NumberFromString
}
