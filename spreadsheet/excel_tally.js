const { tallyCommands, tallyCommandMap } = require('../tally/commands');
const debugRow = true;



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
      const parameters = Object.keys(row).map(key => row[key]);
      console.log(`parameters=${parameters}`)
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