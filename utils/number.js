const {isString} = require('./string');

const CleanNumberString = (numStr) => {
  if (isString(numStr)) {
    const newNumberStr = numStr.replace(/,/g, '');
    return newNumberStr;
  } else {
    console.log(`numStr is of type '${typeof numStr}'`)
  }

  return numStr;
}

const NumberFromString = (numStr) => {
  if (isString(numStr)) {
    const cleanedNumStr = CleanNumberString(numStr);

    if (cleanedNumStr.includes('.'))
      return parseFloat(cleanedNumStr)

    return parseInt(cleanedNumStr);
  } else {
    console.log(`numStr is of type '${typeof numStr}'`)
  }

  return numStr;
}

module.exports = {
  CleanNumberString,
  NumberFromString
}
