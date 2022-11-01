const { tallyCommands, tallyCommandMap } = require('../tally/commands');

const debugRow = false;

const processParameters = (params) => {
  console.log(`params=${params}`);

  const new_params = [];
  const debit_ledger = [];
  const credit_ledger = [];
  let i = 0;
  while (i < params.length) {
    const curr_param = params[i];
    if (curr_param !== 'DR' && curr_param != 'CR') {
      new_params.push(curr_param);
      i += 1;
    } else {
      const lentry = {}
      lentry['ledger_account'] = params[i+1];
      lentry['amount'] = params[i+2];
      if (curr_param === 'DR') {
        debit_ledger.push(lentry);
      } else if (curr_param === 'CR') {
        credit_ledger.push(lentry);
      } else {
        throw `ledger entry type ${curr_param} not handled`;
      }

      i += 3;
    }
  }

  new_params.push(debit_ledger);
  new_params.push(credit_ledger);
  console.log(`new_params=${new_params}`);


  return new_params;
}

const processRowTally = (row) => {
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

  if (tallyCommands.includes(row_command)) {
    if (row_active) {
      let parameters = Object.keys(row).map(key => row[key]);
      console.log(`parameters=${parameters}`)

      parameters = processParameters(parameters);
      tallyCommandMap[row_command].handler.apply(null, parameters);
    } else {
      console.log(`row ${row} disabled`);
    }
  } else {
    console.log(`Command ${row_command} is not valid`);
  }
}

module.exports = {
  processRowTally
}