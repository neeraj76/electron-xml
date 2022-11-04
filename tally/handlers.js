const {
  get_accounts_list_request,
  get_ledgers_list_request,
  get_ledger_groups_list_request,
  get_balance_sheet_request,
  get_profit_loss_request,
  get_trial_balance_request,
  get_day_book_request,
  create_ledger_group_request,
  create_ledger_request,
  create_voucher_request,
  create_vouchersplit_request,
  create_unit_name_request,
  create_stock_group_request,
  create_stock_item_request
} = require("./messages");
const { tallyProcessRequest, tallyProcessRequestPromise } = require("./request");
const { ExcelDateToJSDate, dateTallyFormat } = require('../spreadsheet/excel_date');
const { DateToStringDate } = require('../utils/date');

const flagShowDesc = false;
const flagShowAll = false;
const flagShowArray = false;
const indentationLen = 4;
const propNameLen = 30;

function showAccounts() {
  const accountListRequest = get_accounts_list_request();
  tallyProcessRequest(accountListRequest, (responseObj) => {
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

function getLedgers({command}) {
  const ledgerListRequest = get_ledgers_list_request();
  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(ledgerListRequest)
        .then(({status, tallyResponse, requestObj, reqIdStr}) => {
          if (status == 'Success') {
            const ledgerResponse = tallyResponse.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].LEDGER;
            if (ledgerResponse) {
              const ledgers = ledgerResponse.map(ledger => {
                if (Object.keys(ledger.ISDELETED).length > 1) {
                  // console.log(`Deleted=${JSON.stringify(ledger.ISDELETED)}`);
                }
                return ledger['LANGUAGENAME.LIST'][0]['NAME.LIST'][0].NAME[0];
              })

              resolve({response:ledgers, request:command});
            }
          }
        })
        // .catch((error) => {
        //   throw error;
        // });
  })
}

function showLedgerGroups() {
  const ledgerListRequest = get_ledger_groups_list_request();

  tallyProcessRequest(ledgerListRequest, (responseObj) => {
    const ledgers = responseObj.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].LEDGER
    ledgers.forEach(ledger => {
      // console.log(`Keys:${Object.keys(ledger)}`);
      // console.log(`${ledger['$'].NAME}`)
      if (Object.keys(ledger.ISDELETED).length > 1) {
        // console.log(`Deleted=${JSON.stringify(ledger.ISDELETED)}`);
      }
      const ledger_name = ledger['LANGUAGENAME.LIST'][0]['NAME.LIST'][0].NAME[0];
      console.log(`${ledger_name}`);
    });

    console.log(``)
  })
}

function showBalanceSheet() {
  const balanceSheetRequest = get_balance_sheet_request();
  tallyProcessRequest(balanceSheetRequest, (responseObj) => {
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

function showProfitLoss() {
  const profitLossRequest = get_profit_loss_request();
  tallyProcessRequest(profitLossRequest, (responseObj) => {
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

function showTrialBalance() {
  const trialBalanceRequest = get_trial_balance_request();
  tallyProcessRequest(trialBalanceRequest, (responseObj) => {
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


const traverse = (object, object_index, indent, object_name) => {
  if (Object.keys(object).includes('$')) {
    const object_attributes = object['$'];
    console.log(`${' '.repeat(indent)} ${object_name ? object_name : 'Object'} ${object_index}`);

    Object.keys(object_attributes).forEach(attr => {
      console.log(`${' '.repeat(indent)} ${attr.padStart(15)}: ${object_attributes[attr]}`);
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

function showDayBook() {
  const dayBookRequest = get_day_book_request();
  tallyProcessRequest(dayBookRequest, (responseObj) => {
    const messages = responseObj.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE;

    messages.slice(0,8).forEach((msg, m_index) => {
      const voucher = msg.VOUCHER[0];
      traverse(voucher, m_index, 0, "Voucher");
    })
  });
}

function parseTallyErrorObj(tallyError, requestObj, reqIdStr) {
  return new Promise((resolve, reject) => {
    console.log(`Error! ${reqIdStr}: ${tallyError}`)
    resolve(tallyError);
  })
}

function parseTallyResponseObj(tallyResponse, requestObj, reqIdStr) {
  const responseCodeMap = {
    "CREATED": {type: "integer"},
    "ALTERED": {type: "integer"},
    "DELETED": {type: "integer"},
    "LASTVCHID": {type: "integer"},
    "LASTMID": {type: "integer"},
    "COMBINED": {type: "integer"},
    "IGNORED": {type: "integer"},
    "ERRORS": {type: "integer"},
    "CANCELLED": {type: "integer"},
    "VCHNUMBER": {type: "integer"},
    "LINEERROR": {type: "text"}
  };

  return new Promise((resolve, reject) =>{
    let data;
    try {
      data = tallyResponse.ENVELOPE.BODY[0].DATA[0];
    } catch (e) {
      console.error(`The response is not to a tally show command`);
    }

    if (data === undefined) {
      data = tallyResponse.RESPONSE;
      console.log(`${data}`);
    } else {
      const keys = Object.keys(data);

      if (keys.includes('IMPORTRESULT')) {
        const  importResult = data.IMPORTRESULT[0];

        const new_keypair = Object.entries(importResult)
            .filter(([key, val]) => Object.keys(responseCodeMap).includes(key))
            .map(([key, val]) =>
                [key, responseCodeMap[key].type === "integer" ? parseInt(val[0]) : val[0]]
            );
        const result = Object.fromEntries(new_keypair);


        if (flagShowDesc) {
          const desc = tallyResponse.ENVELOPE.BODY[0].DESC[0].CMPINFO[0];
          traverse(desc, 0);
        }
        resolve(result)
      } else if (keys.includes('LINEERROR')) {
        const new_keypair = Object.entries(data)
            .filter(([key, val]) => Object.keys(responseCodeMap).includes(key))
            .map(([key, val]) =>
                [key, responseCodeMap[key].type === "integer" ? parseInt(val[0]) : val[0]]
            );
        const result = Object.fromEntries(new_keypair);

        resolve(result);
      } else {
        throw "Tally Response to be supported"
      }
    }
  });
}

// Need to make a promise out of this
function tallyCommandExecute(commandRequest, reqIdStr) {
  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(commandRequest, reqIdStr)
        .then(({status, tallyResponse, requestObj, reqIdStr}) => {
          // console.log(`tallyCommandExecute: tallyResponse=${tallyResponse}`);
          // This could be culprit
          parseTallyResponseObj(tallyResponse, requestObj, reqIdStr)
              .then(response => {
                // console.log(`tallyCommandExecute: response=${JSON.stringify(response, null, 2)}`);
                if (response.ERRORS > 0) {
                  reject({status: 'ERROR', reason: response.LINEERROR, response})
                }

                resolve({status: 'SUCCESS', response});
              })
              // .catch(error => {
              //   console.log(`tallyCommandExecute: error=${JSON.stringify(error, null, 2)}`);
              //   console.log("tallyCommandExecute:Response Error in parsing");
              // });
        })
        .catch(({status, reason, tallyError, requestObj, reqIdStr}) => {
          console.log(`tallyCommandExecute: tallyError=${tallyError}`);
          // throw tallyError;
        });
  });
}

function handleCreateLedgerGroup(ledger_group_name, parent_ledger_group_name) {
  const reqIdStr = `Create LedgerGroup: ${ledger_group_name} [parent:${parent_ledger_group_name}]`;
  const createLedgerGroupsRequest = create_ledger_group_request(ledger_group_name, parent_ledger_group_name);

  return tallyCommandExecute(createLedgerGroupsRequest, reqIdStr);
}

function handleCreateLedger(ledger_name, parent_ledger_group_name, opening_amount) {
  const reqIdStr = `Create Ledger: ${ledger_name} [parent:${parent_ledger_group_name} opening_amount=${opening_amount}]`;
  const createLedgersRequest = create_ledger_request(ledger_name, parent_ledger_group_name, opening_amount);

  return tallyCommandExecute(createLedgersRequest, reqIdStr);
}


function handleCreateVoucher(voucher_type, excel_date, debit_ledger, credit_ledger, amount, narration) {
  const date = ExcelDateToJSDate(excel_date);
  // console.log(`date=${date}`);
  const reqIdStr = `Create Voucher: ${voucher_type} ${DateToStringDate(date)} [DR:${debit_ledger} CR:${credit_ledger}] ${amount}`;
  const createVoucherRequest = create_voucher_request(voucher_type, date, debit_ledger, credit_ledger, amount, narration);

  return new Promise((resolve, reject) => {
    tallyCommandExecute(createVoucherRequest, reqIdStr)
        .then(response => {
          console.log(`handleCreateVoucher:Response ${JSON.stringify(response, null, 2)}`);
          resolve(response);
        })
        .catch(error => {
          console.log(`handleCreateVoucher:Error ${JSON.stringify(error, null, 2)}`);
        });
  });
}

function handleCreateVoucherSplit(voucher_type, excel_date, narration, debit_entries, credit_entries) {
  const date = ExcelDateToJSDate(excel_date);
  const reqIdStr = `Create VoucherSplit: ${voucher_type} ${DateToStringDate(date)} [DR:${debit_entries} CR:${credit_entries}]`;
  const createVoucherSplitRequest = create_vouchersplit_request(voucher_type, date, narration, debit_entries, credit_entries);

  return tallyCommandExecute(createVoucherSplitRequest, reqIdStr);
}

function handleCreateUnitName(unit_name) {
  const reqIdStr = `Create Unit: ${unit_name}`;
  const createUnitNameRequest = create_unit_name_request(unit_name);

  tallyCommandExecute(createUnitNameRequest, reqIdStr);
}

function handleCreateStockGroup(stock_group_name, parent_stock_group_name) {
  const reqIdStr = `Create StockGroup: ${stock_group_name} [parent:${parent_stock_group_name}]`;
  const createStockGroupRequest = create_stock_group_request(stock_group_name, parent_stock_group_name);

  tallyCommandExecute(createStockGroupRequest, reqIdStr);
}

function handleCreateStockItem(stockitem_name, parent_stock_group_name, unit_name,
                               open_position_type, open_position_quantity, open_position_amount) {
  const reqIdStr = `Create StockItem: ${stockitem_name} [parent:${parent_stock_group_name}] ${unit_name}}`;
  const createStockItemRequest = create_stock_item_request(stockitem_name, parent_stock_group_name, unit_name,
      open_position_type, open_position_quantity, open_position_amount);

  tallyCommandExecute(createStockItemRequest, reqIdStr);
}

function commandTester() {
  // showAccounts();
  // showLedgers();
  showLedgerGroups();
  // showBalanceSheet();
  // showProfitLoss();
  // showTrialBalance();
  // showDayBook();

  // handleCreateLedgerGroup("Computers and Accessories", "Indirect Expenses");
  // handleCreateLedgerGroup("Laptop", "Computers and Accessories");
  //
  // handleCreateLedger('Bank of India', 'Bank Accounts', 0);
  // handleCreateLedger('Conveyance', 'Indirect Expenses', 0);
  //
  // handleCreateVoucher("20220401", "Payment", "Conveyance", "Bank of India", 9000, "Payment for Travel");
  // handleCreateVoucher("20220401", "Payment", "Conveyance", "Bank of India", 14000, "Payment for Travel");
  //
  // const unit_name = "Num";
  // handleCreateUnitName(unit_name)
  // handleCreateStockGroup("Securities", "");
  // handleCreateStockGroup("Equities", "Securities");
  // handleCreateStockGroup("Derivatives", "Securities");
  // handleCreateStockItem("RELIANCE", "Equities", unit_name, "BUY", 100, 239500);
}

module.exports = {
  commandTester,
  handleCreateLedgerGroup,
  handleCreateLedger,
  handleCreateVoucher,
  handleCreateVoucherSplit,
  showAccounts,
  getLedgers,
  showLedgerGroups,
  showBalanceSheet,
  showProfitLoss,
  showTrialBalance,
  showDayBook
}