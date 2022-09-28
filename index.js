const electron = require('electron');
const { processExcelFile } = require('./excel');
const { app, BrowserWindow, ipcMain } = electron;
const { initApi, getResource } = require('./services/api');
const { get_accounts_list_request, get_ledgers_list_request, get_balance_sheet_request} = require('./tally/messages');
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


const tally_process_request = (request, callback) => {
  const requestXmlStr = convertObjToXml(request);
  console.log(`Request:\n${requestXmlStr}`)

  getResource(requestXmlStr, callback);
}


function show_accounts() {
  const accountListRequest = get_accounts_list_request();
  tally_process_request(accountListRequest, (responseXmlStr) => {
    console.log(`getResource Response:\n${typeof responseXmlStr}`)
    convertXmlToObj(responseXmlStr, (err, responseObj) => {
      console.log(`Header: ${JSON.stringify(responseObj.ENVELOPE.HEADER, null, 2)}`)

      const messages = responseObj.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE
      messages.forEach(msg => {
        // console.log(`Msg Keys: ${Object.keys(msg)}  ${Object.keys(msg['$'])}`);
        if (Object.keys(msg).includes('VOUCHERTYPE')) {
          console.log(`VoucherType: ${msg.VOUCHERTYPE[0]['$']['NAME']}`)
        }
      });
    });
  });
}

function show_ledgers() {
  const ledgerListRequest = get_ledgers_list_request();
  tally_process_request(ledgerListRequest, (responseXmlStr) => {
    console.log(`Response:\n${responseXmlStr}`);
    convertXmlToObj(responseXmlStr, (err, responseObj) => {
      const ledgers = responseObj.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].LEDGER
      ledgers.forEach(ledger => {
        console.log(`Keys:${Object.keys(ledger)}`);
        console.log(`${ledger['$'].NAME}`)
        if (Object.keys(ledger.ISDELETED).length > 1) {
          console.log(`Deleted=${JSON.stringify(ledger.ISDELETED)}`);
        }
        const ledger_name = ledger['LANGUAGENAME.LIST'][0]['NAME.LIST'][0].NAME[0];
        console.log(`${ledger_name}`);
      });
    });

    console.log(``)
  })
}

function show_balance_sheet() {
  const balanceSheetRequest = get_balance_sheet_request();
  tally_process_request(balanceSheetRequest, (responseXmlStr) => {
    console.log(`Response:\n${responseXmlStr}`);
    convertXmlToObj(responseXmlStr, (err, responseObj) => {
      const bsnames = responseObj.ENVELOPE.BSNAME;
      const bsamts = responseObj.ENVELOPE.BSAMT;
      console.log(`Bsname Keys: ${Object.keys(bsnames)}  Bsamt Keys: ${Object.keys(bsamts)}`);

      bsnames.forEach((bsname,i) =>{
        bsAccName = bsname.DSPACCNAME[0].DSPDISPNAME[0];
        bsamt = bsamts[i];
        // console.log(`${i} bsamt=${JSON.stringify(bsamt)}`);
        bsSubAmts = bsamt.BSSUBAMT;
        bsMainAmt = bsamt.BSMAINAMT[0];

        console.log(`${i} ${JSON.stringify(bsAccName)}: ${bsMainAmt}`);

      })
    });
  });
}


ipcMain.on('screen:start', () => {
  // show_accounts();
  // show_ledgers();
  show_balance_sheet();

  // const path = `/Users/neeraj/Projects/Live/glassball-api-server/data-files/glassball-input/file.xlsx`;

  // const sheets = processExcelFile(path);

  // mainWindow.webContents.send('video:metadata', sheets.length);
});

ipcMain.on('video:submit', (event, path) => {
  const sheets = processExcelFile(path);

  mainWindow.webContents.send('video:metadata', sheets.length);
});