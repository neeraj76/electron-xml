const electron = require('electron');
const { processExcelFile } = require('./spreadsheet/excel');
const { app, BrowserWindow, ipcMain } = electron;
const { commandTester } = require('./tally/handlers');
const {processRowTally} = require("./spreadsheet/excel_tally");
const {tallyCheckServer} = require("./tally/request");

let mainWindow;

app.on('ready', () => {
  // console.log('App is now ready');
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // tallyCheckServer()
  //     .then(response => console.log(`response: ${response.status}`))
  //     .catch(error => console.error(`error: ${error}`));
});


const handleSpreadsheet = (path) => {
  const sheets = processExcelFile(path, processRowTally);

  if (sheets) {
    mainWindow.webContents.send('excel:metadata', sheets.length);
  }
}

ipcMain.on('screen:start', () => {
  // commandTester();

  handleSpreadsheet(`/Users/neeraj/Desktop/tally_ledger.xlsx`);
  // handleSpreadsheet(`/Users/neeraj/Desktop/tally_voucher.xlsx`);
  // handleSpreadsheet(`/Users/neeraj/Desktop/tally_vouchersplit.xlsx`);
  // handleSpreadsheet(`/Users/neeraj/Desktop/tally_commands.xlsx`);
});


ipcMain.on('excel:submit', (event, path) => {
  console.log(`Received file ${path}`);
  handleSpreadsheet(path);
});