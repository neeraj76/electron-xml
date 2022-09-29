const electron = require('electron');
const { processExcelFile } = require('./excel');
const { app, BrowserWindow, ipcMain } = electron;
const { initApi, getResource } = require('./services/api');
const { get_accounts_list_request, get_ledgers_list_request, get_balance_sheet_request, get_profit_loss_request,
  get_trial_balance_request, get_day_book_request, create_ledger_request, create_ledger_group_request,
  create_voucher_request, create_stock_group_request, create_unit_name_request, create_stock_item_request
} = require('./tally/messages');
const { convertObjToXml, convertXmlToObj } = require("./xml");

let mainWindow;


const flagShowRequest = false;
const flagShowResponse = false;
const flagShowDesc = false;
const flagShowXml = false;
const flagShowAll = false;
const flagShowArray = false;
const indentationLen = 4;
const propNameLen = 30;


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


const tally_process_request = (requestObj, callback, reqIdStr) => {
  if (flagShowRequest) {
    console.log(JSON.stringify(requestObj, null, 2));
  }

  const requestXmlStr = convertObjToXml(requestObj);
  if (flagShowRequest && flagShowXml) {
    console.log(`Request:\n${requestXmlStr}`)
  }

  getResource(requestXmlStr, (responseXmlStr) => {
    if (flagShowResponse && flagShowXml) {
      console.log(`Response:\n${responseXmlStr}`);
    }

    convertXmlToObj(responseXmlStr, (err, responseObj) => {
      if (flagShowResponse) {
        console.log(`Response:\n${JSON.stringify(responseObj, null, 2)}`);
      }
      callback(responseObj, requestObj, reqIdStr);
    });
  });
}


function show_accounts() {
  const accountListRequest = get_accounts_list_request();
  tally_process_request(accountListRequest, (responseObj) => {
    console.log(`Header: ${JSON.stringify(responseObj.ENVELOPE.HEADER, null, 2)}`)

    const messages = responseObj.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE
    messages.forEach(msg => {
      // console.log(`Msg Keys: ${Object.keys(msg)}  ${Object.keys(msg['$'])}`);
      if (Object.keys(msg).includes('VOUCHERTYPE')) {
        console.log(`VoucherType: ${msg.VOUCHERTYPE[0]['$']['NAME']}`)
      }
    });
  });
}

function show_ledgers() {
  const ledgerListRequest = get_ledgers_list_request();

  tally_process_request(ledgerListRequest, (responseObj) => {
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

    console.log(``)
  })
}

function show_balance_sheet() {
  const balanceSheetRequest = get_balance_sheet_request();
  tally_process_request(balanceSheetRequest, (responseObj) => {
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
}

function show_profit_loss() {
  const profitLossRequest = get_profit_loss_request();
  tally_process_request(profitLossRequest, (responseObj) => {
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
}

function show_trial_balance() {
  const trialBalanceRequest = get_trial_balance_request();
  tally_process_request(trialBalanceRequest, (responseObj) => {
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
}


const traverse = (object, object_index, indent) => {
  if (Object.keys(object).includes('$')) {
    const voucher_attributes = object['$'];
    console.log(`${' '.repeat(indent)} Object ${object_index}`);

    Object.keys(voucher_attributes).forEach(attr => {
      console.log(`${' '.repeat(indent)} ${attr.padStart(15)}: ${voucher_attributes[attr]}`);
    });
  }

  Object.keys(object).forEach((prop, p_index) => {
    if (flagShowAll) {
      console.log(`${prop}`)
    }
    const value = object[prop];

    if (value != "" && value != "No" && value != "0") {
      if (Array.isArray(value)) {
        if (value.length == 1) {
          if (typeof value[0] === 'string' && value[0].replace(/ /g, '').length > 0) {
            if (flagShowArray) {
              console.log(`${' '.repeat(indent)} ${p_index} Array[${value.length}]: ${prop.padStart(propNameLen)}:  ${value[0]}`);
            } else {
              console.log(`${' '.repeat(indent)} ${p_index} ${prop.padStart(propNameLen)}:  ${value[0]}`);
            }
          }
        } else if (value.length > 1) {
          value.forEach((obj, obj_index) => {
            if (typeof obj === 'object') {
              if (flagShowArray) {
                console.log(`${' '.repeat(indent)} ${p_index} Array[${Object.keys(obj).length}]: ${prop.padStart(propNameLen)}`);
              } else {
                console.log(`${' '.repeat(indent)} ${p_index} : ${prop.padStart(propNameLen)}`);
              }
            } else {
              console.log(`Leaf: ${JSON.stringify(obj)}`);
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
  tally_process_request(dayBookRequest, (responseObj) => {
      const messages = responseObj.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE;

      messages.slice(0,8).forEach((msg, m_index) => {
        const voucher = msg.VOUCHER[0];
        traverse(voucher, m_index, 0);
      })
  });
}

function parseResponseObj(responseObj, requestObj, reqIdStr) {
    const result = responseObj.ENVELOPE.BODY[0].DATA[0].IMPORTRESULT[0];

    // traverse(result, 0);
    if (result.CREATED == 1) {
      console.log(`${reqIdStr}: Created Successfully`);
    } else if (result.ALTERED == 1) {
      console.log(`${reqIdStr}: Modified Successfully`);
    } else if (result.DELETED == 1) {
      console.log(`${reqIdStr}: Deleted Successfully`);
    } else {
      console.log(`${reqIdStr}: Repsonse traversed`)
      traverse(result, 0);
    }


    if (flagShowDesc) {
      const desc = responseObj.ENVELOPE.BODY[0].DESC[0].CMPINFO[0];
      traverse(desc, 0);
    }
}


function handle_create_ledger_group(ledger_group_name, parent_ledger_group_name) {
  const reqIdStr = `Create LedgerGroup: ${ledger_group_name} [parent:${parent_ledger_group_name}]`;
  const createLedgersRequest = create_ledger_group_request(ledger_group_name, parent_ledger_group_name);
  tally_process_request(createLedgersRequest, parseResponseObj, reqIdStr);
}

function handle_create_ledger(ledger_name, parent_ledger_group_name, opening_amount) {
  const reqIdStr = `Create Ledger: ${ledger_name} [parent:${parent_ledger_group_name} opening_amount=${opening_amount}] `
  const createLedgersRequest = create_ledger_request(ledger_name, parent_ledger_group_name, opening_amount);
  tally_process_request( createLedgersRequest, parseResponseObj, reqIdStr);
}


function handle_create_voucher(date, voucher_type, debit_ledger, credit_ledger, amount, narration) {
  const reqIdStr = `Create Voucher: ${date} ${voucher_type} [DR:${debit_ledger} CR:${credit_ledger}] ${amount}`
  const createVoucherRequest = create_voucher_request(date, voucher_type, debit_ledger, credit_ledger, amount, narration);
  tally_process_request(createVoucherRequest, parseResponseObj, reqIdStr);
}


function handle_create_unit_name(unit_name) {
  const createUnitNameRequest = create_unit_name_request(unit_name)
  tally_process_request(createUnitNameRequest, parseResponseObj);
}

function handle_create_stock_group(stock_group_name, parent_stock_group_name) {
  const createStockGroupRequest = create_stock_group_request(stock_group_name, parent_stock_group_name);
  tally_process_request(createStockGroupRequest, parseResponseObj);
}

function handle_create_stock_item(stockitem_name, parent_stock_group_name, unit_name,
                                  open_position_type, open_position_quantity, open_position_amount) {
  const createStockItemRequest = create_stock_item_request(stockitem_name, parent_stock_group_name, unit_name,
      open_position_type, open_position_quantity, open_position_amount);
  tally_process_request(createStockItemRequest, parseResponseObj);
}

ipcMain.on('screen:start', () => {
  // show_accounts();
  // show_ledgers();
  // show_balance_sheet();
  // show_profit_loss();
  // show_trial_balance();
  // show_day_book();

  // handle_create_ledger_group("Computers and Accessories", "Indirect Expenses");
  // handle_create_ledger_group("Laptop", "Computers and Accessories");

  handle_create_ledger('Bank of India', 'Bank Accounts', 0);
  handle_create_ledger('Conveyance', 'Indirect Expenses', 0);

  handle_create_voucher("20220402", "Payment", "Conveyance", "Bank of India", 14000, "Payment for Travel");
  // handle_create_unit_name("Num")
  // handle_create_stock_group("Securities", "");
  // handle_create_stock_group("Equities", "Securities");
  // handle_create_stock_group("Derivatives", "Securities");
  // handle_create_stock_item("RELIANCE", "Equities", "No.",
  //     "BUY", 100, 239500);

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