const electron = require('electron');
const XLSX = require('xlsx');
const XML = require('xml2js');


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


function processExcelFile(path) {
  const workbook = XLSX.readFile(path);
  const sheets = Object.keys(workbook.Sheets);

  console.log(`path=${path}`)

  const builder = new XML.Builder({headless: false, renderOpts: { pretty: true }});

  workbook.SheetNames.forEach(sheetName => {
    console.log(`Sheet:${sheetName}`);
    let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    rows.forEach(row => {
      // console.log(`${JSON.stringify(row, null, 2)}`);
      const xml = builder.buildObject(row);
      console.log(xml);
    })
  });

  return sheets;
}

ipcMain.on('screen:start', () => {
  const path = `/Users/neeraj/Projects/Live/glassball-api-server/data-files/glassball-input/file.xlsx`;

  const sheets = processExcelFile(path);

  mainWindow.webContents.send('video:metadata', sheets.length);
});

ipcMain.on('video:submit', (event, path) => {
  const sheets = processExcelFile(path);

  mainWindow.webContents.send('video:metadata', sheets.length);
});