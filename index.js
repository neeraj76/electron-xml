const electron = require('electron');
const XLSX = require('xlsx');
const XML = require('xml2js');
const { processExcelFile } = require('./excel');

const { app, BrowserWindow, ipcMain } = electron;

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
  const path = `/Users/neeraj/Projects/Live/glassball-api-server/data-files/glassball-input/file.xlsx`;

  const sheets = processExcelFile(path);

  mainWindow.webContents.send('video:metadata', sheets.length);
});

ipcMain.on('video:submit', (event, path) => {
  const sheets = processExcelFile(path);

  mainWindow.webContents.send('video:metadata', sheets.length);
});