const electron = require('electron');
const { processExcelFile } = require('./spreadsheet/excel');
const { app, BrowserWindow, ipcMain } = electron;
const { commandTester } = require('./tally/commands');

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


ipcMain.on('screen:start', () => {
  commandTester();

  // const path = `/Users/neeraj/Projects/Live/glassball-api-server/data-files/glassball-input/file.xlsx`;
  //
  // const sheets = processExcelFile(path);
  //
  // mainWindow.webContents.send('excel:metadata', sheets.length);
});

ipcMain.on('video:submit', (event, path) => {
  const sheets = processExcelFile(path);

  mainWindow.webContents.send('excel:metadata', sheets.length);
});