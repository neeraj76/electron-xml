const electron = require('electron');
const { processExcelFile } = require('./spreadsheet/excel');
const { app, BrowserWindow, ipcMain } = electron;
const { commandTester } = require('./tally/handlers');

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
});


const handleSpreadsheet = (path) => {
  const sheets = processExcelFile(path);

  if (sheets) {
    mainWindow.webContents.send('excel:metadata', sheets.length);
  }
}

ipcMain.on('screen:start', () => {
  // commandTester();

  const path = `/Users/neeraj/Desktop/tally_commands.xlsx`;
  handleSpreadsheet(path);
});


ipcMain.on('video:submit', (event, path) => {
  console.log(`Received file ${path}`);
  handleSpreadsheet(path);
});