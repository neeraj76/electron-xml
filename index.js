const electron = require('electron');
const { processExcelFile } = require('./excel');
const { app, BrowserWindow, ipcMain } = electron;
const { initApi, getResource } = require('./services/api');
const { get_accounts_list_request, get_ledgers_list_request, get_balance_sheet_request, get_profit_loss_request,
  get_trial_balance_request, get_day_book_request
} = require('./tally/messages');
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

function show_profit_loss() {
  const profitLossRequest = get_profit_loss_request();
  tally_process_request(profitLossRequest, (responseXmlStr) => {
    console.log(`Response:\n${responseXmlStr}`);
    convertXmlToObj(responseXmlStr, (err, responseObj) => {
      const dspNames = responseObj.ENVELOPE.DSPACCNAME;
      const plAmts = responseObj.ENVELOPE.PLAMT;

      dspNames.forEach((dspName,i) =>{
        const dspAccName = dspName.DSPDISPNAME[0];
        const plAmt = plAmts[i];

        let plAmount;
        if (plAmt.BSMAINAMT[0] === "") {
          plAmount = plAmt.PLSUBAMT[0]
        } else {
          plAmount = plAmt.BSMAINAMT[0]
        }

        console.log(`${i} ${JSON.stringify(dspAccName)}: ${plAmount}`);
      })
    });
  });
}

function show_trial_balance() {
  const trialBalanceRequest = get_trial_balance_request();
  tally_process_request(trialBalanceRequest, (responseXmlStr) => {
    console.log(`Response:\n${responseXmlStr}`);
    convertXmlToObj(responseXmlStr, (err, responseObj) => {
      const dspAccNames = responseObj.ENVELOPE.DSPACCNAME;
      const dspAccInfos = responseObj.ENVELOPE.DSPACCINFO;

      dspAccNames.forEach((dspAccName,i) =>{
        const accName = dspAccName.DSPDISPNAME[0];
        const dspAccInfo = dspAccInfos[i];

        // console.log(`dspAccInfo: ${JSON.stringify(dspAccInfo)}`);
        const accDebitAmount = dspAccInfo.DSPCLDRAMT[0].DSPCLDRAMTA[0];
        const accCreditAmount = dspAccInfo.DSPCLCRAMT[0].DSPCLCRAMTA[0];

        console.log(`${i} ${JSON.stringify(accName.padStart(30))}: '${accDebitAmount.padStart(10)}' '${accCreditAmount.padStart(10)}'`);
      })
    });
  });
}

const indentationLen = 2
const propNameLen = 40;

const traverse = (object, object_index, indent) => {
  if (Object.keys(object).includes('$')) {
    const voucher_attributes = object['$'];
    console.log(`${' '.repeat(indent)} Object ${object_index}`);

    Object.keys(voucher_attributes).forEach(attr => {
      console.log(`${' '.repeat(indent)} ${attr.padStart(15)}: ${voucher_attributes[attr]}`);
    });
  }

  Object.keys(object).forEach((prop, p_index) => {
    const value = object[prop];

    if (value != "" && value != "No" && value != "0") {
      if (Array.isArray(value)) {
        if (value.length == 1) {
          if (typeof value[0] === 'string' && value[0].replace(/ /g, '').length > 0) {
            console.log(`${' '.repeat(indent)} ${p_index} Array[${value.length}]: ${prop.padStart(propNameLen)}:  ${value[0].replace(/ /g, "*")}`);
          }
        } else if (value.length > 1) {
          value.forEach((obj, obj_index) => {
            if (typeof obj === 'object') {
              console.log(`${' '.repeat(indent)} ${p_index} Array[${Object.keys(obj).length}]: ${prop.padStart(propNameLen)}`);
            }

            traverse(obj, obj_index, indent+indentationLen);
          })
        }
      } else {
        console.log(`${' '.repeat(indent)} ${p_index}        ${prop.padStart(propNameLen)}: ${value}`);
      }
    }
  });

  console.log('');
};

function show_day_book() {
  const dayBookRequest = get_day_book_request();
  tally_process_request(dayBookRequest, (responseXmlStr) => {
    // console.log(`Response:\n${responseXmlStr}`);
    convertXmlToObj(responseXmlStr, (err, responseObj) => {
      const messages = responseObj.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE;

      messages.slice(0,8).forEach((msg, m_index) => {
        const voucher = msg.VOUCHER[0];
        traverse(voucher, m_index, 0);
      })
    });
  });
}

ipcMain.on('screen:start', () => {
  // show_accounts();
  // show_ledgers();
  // show_balance_sheet();
  // show_profit_loss();
  // show_trial_balance();
  show_day_book();

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