const electron = require('electron');
const { processExcelFile } = require('./spreadsheet/excel');
const { app, BrowserWindow, ipcMain } = electron;
const { commandTester } = require('./tally/handlers');
const {processRowTally} = require("./spreadsheet/excel_tally");
const {tallyCheckServer, tallyCheckServerBoolean} = require("./tally/request");

let mainWindow;

app.on('ready', () => {
  // console.log('App is now ready');
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  // mainWindow.loadURL(`file://${__dirname}/local.html`)
  mainWindow.loadFile('./local.html')
      .then(response => {
        console.log(`File loaded successfully for mainWindow`);
      })
      .catch(error => {
        console.error(`File not loaded: ${error}`);
      });

  // tallyCheckServerBoolean()
  //     .then(response => console.log(`response: ${response}`))
  //     .catch(error => console.error(`error: ${error}`));
  //
  // tallyCheckServer()
  //     .then(response => console.log(`response: ${JSON.stringify(response)}`))
  //     .catch(error => console.error(`error: ${JSON.stringify(error)}`));
});


const handleSpreadsheet = (path) => {
  const sheets = processExcelFile(path, processRowTally);

  if (sheets) {
    mainWindow.webContents.send('excel:metadata', sheets.length);
  }
}

ipcMain.on('screen:start', () => {
  // commandTester();

  // handleSpreadsheet(`/Users/neeraj/Desktop/tally_ledger.xlsx`);
  // handleSpreadsheet(`/Users/neeraj/Desktop/tally_voucher.xlsx`);
  // handleSpreadsheet(`/Users/neeraj/Desktop/tally_vouchersplit.xlsx`);
  // handleSpreadsheet(`/Users/neeraj/Desktop/tally_commands.xlsx`);
});


ipcMain.on('excel:submit', (event, path) => {
  console.log(`Received file ${path}`);
  handleSpreadsheet(path);
});