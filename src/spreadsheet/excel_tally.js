const { getTallyCommands, getTallyCommandMap, getTallyParameterMap } = require('@glassball/tally');

const debugRow = true;
const debugParameters = true;

const processParameters = (params, paramsMap) => {
  if (debugParameters) {
    console.log(`params=${params}`);
    console.log(`paramsMap=${JSON.stringify(paramsMap)}`);
  }

  const newParams = [];
  const paramsObj = {}
  const debitLedger = [];
  const creditLedger = [];
  let paramIdx = 0;
  while (paramIdx < params.length) {
    const currParam = params[paramIdx];
    if (currParam !== 'DR' && currParam != 'CR') {
      // newParams.push(currParam);
      paramsObj[paramsMap[paramIdx].name] = currParam;
      paramIdx += 1;
    } else {
      const lentry = {}
      lentry['ledger_account'] = params[paramIdx+1];
      lentry['amount'] = params[paramIdx+2];
      if (currParam === 'DR') {
        debitLedger.push(lentry);
      } else if (currParam === 'CR') {
        creditLedger.push(lentry);
      } else {
        throw `ledger entry type ${currParam} not handled`;
      }

      paramIdx += 3;
    }
  }

  // newParams.push(debitLedger);
  // newParams.push(creditLedger);
  if (debitLedger.length) {
    paramsObj.debitLedger = debitLedger;
  }
  if (creditLedger.length) {
    paramsObj.creditLedger = creditLedger;
  }

  if (debugParameters) {
    console.log(`paramsObj=${JSON.stringify(paramsObj)}`);
  }

  return [paramsObj];
}

const processRowAsCommand = (row) => {
  if (debugRow) {
    console.log(`typeof(row)=${typeof row}`, row);
  }

  if (row.Command === undefined) {
    console.error("Key 'Command' not found in row");
    throw "error";
  }
  const row_command = row.Command;
  delete row.Command;

  let row_status = 'Active';
  if (row.Status !== undefined) {
    row_status = row.Status;
    delete row.Status;
  }
  const row_active =  row_status !== 'Disabled' && row_status !== 'Inactive';

  if (getTallyCommands().includes(row_command)) {
    if (row_active) {
      let parameters = Object.keys(row).map(key => row[key]);
      if (debugParameters) {
        console.log(`parameters=${parameters}`)
      }

      parameters = processParameters(parameters, getTallyParameterMap()[row_command]);

      // Can be Temp Disabled
      getTallyCommandMap()[row_command].handler.apply(null, parameters)
          .then(response => {
            console.log(`processRowTally: response=${JSON.stringify(response)}`);
          })
          .catch(error => {
            console.log(`processRowTally: error=${JSON.stringify(error)}`);
          });
    } else {
      if (debugRow) {
        console.log(`row ${row} disabled`);
      }
    }
  } else {
    console.log(`Command ${row_command} is not valid`);
  }
}

module.exports = {
  processRowTally: processRowAsCommand
}