const electron = require('electron');
const { processExcelFile } = require('./excel');
const { app, BrowserWindow, ipcMain } = electron;
const { initApi, getResource } = require('./services/api');
const { get_accounts_request } = require('./tally/messages');
const { convertObjToXml, convertXmlToObj } = require("./xml");

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
  const accountsRequest = get_accounts_request();
  const requestXmlStr = convertObjToXml(accountsRequest);
  console.log(`Accounts Request:\n${requestXmlStr}`)

  getResource(requestXmlStr, (accountsXmlStr) => {
    console.log(`getResource Response:\n${typeof accountsXmlStr}`)
    convertXmlToObj(accountsXmlStr, (err, accountsObj) => {
      console.log(`Header: ${JSON.stringify(accountsObj.ENVELOPE.HEADER, null, 2)}`)

      const messages = accountsObj.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE
      messages.forEach(msg => {
        // console.log(`Msg Keys: ${Object.keys(msg)}  ${Object.keys(msg['$'])}`);
        if (Object.keys(msg).includes('VOUCHERTYPE')) {
          console.log(`VoucherType: ${msg.VOUCHERTYPE[0]['$']['NAME']}`)
        }
      });
    });

  });

  // const path = `/Users/neeraj/Projects/Live/glassball-api-server/data-files/glassball-input/file.xlsx`;

  // const sheets = processExcelFile(path);

  // mainWindow.webContents.send('video:metadata', sheets.length);
});

ipcMain.on('video:submit', (event, path) => {
  const sheets = processExcelFile(path);

  mainWindow.webContents.send('video:metadata', sheets.length);
});