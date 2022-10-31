const { tallyCommands, tallyCommandMap } = require('../tally/commands');

const debugRow = false;

const processRowTally = (row) => {
  if (debugRow) {
    console.log(`typeof(row)=${typeof row}`, row);
  }

  if (!'Command' in Object.keys(row)) {
    console.error("Key 'Command' not found in row");
    return;
  }

  const command = row['Command'];
  // console.log(`command=${command}`);
  if (tallyCommands.includes(command)) {
    // console.log(`Command ${command} is valid`);

    const values = Object.keys(row).map(key => row[key]);
    // console.log(`values=${values}`);

    tallyCommandMap[command].handler.apply(null, values.slice(1));
  } else {
    console.log(`Command ${command} is not valid`);
  }
}

module.exports = {
  processRowTally
}