const {
  get_accounts_list_request,
  get_ledgers_list_request,
  get_balance_sheet_request,
  get_profit_loss_request,
  get_trial_balance_request,
  get_day_book_request,
  create_ledger_group_request,
  create_ledger_request,
  create_voucher_request,
  create_unit_name_request,
  create_stock_group_request,
  create_stock_item_request
} = require("./messages");
const {tallyProcessRequest} = require("./request");

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

function showLedgers() {
  const ledgerListRequest = get_ledgers_list_request();

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


function handleCreateLedgerGroup(ledger_group_name, parent_ledger_group_name) {
  const reqIdStr = `Create LedgerGroup: ${ledger_group_name} [parent:${parent_ledger_group_name}]`;
  const createLedgersRequest = create_ledger_group_request(ledger_group_name, parent_ledger_group_name);
  tallyProcessRequest(createLedgersRequest, parseResponseObj, reqIdStr);
}

function handleCreateLedger(ledger_name, parent_ledger_group_name, opening_amount) {
  const reqIdStr = `Create Ledger: ${ledger_name} [parent:${parent_ledger_group_name} opening_amount=${opening_amount}]`;
  const createLedgersRequest = create_ledger_request(ledger_name, parent_ledger_group_name, opening_amount);
  tallyProcessRequest( createLedgersRequest, parseResponseObj, reqIdStr);
}


function handleCreateVoucher(date, voucher_type, debit_ledger, credit_ledger, amount, narration) {
  const reqIdStr = `Create Voucher: ${date} ${voucher_type} [DR:${debit_ledger} CR:${credit_ledger}] ${amount}`;
  const createVoucherRequest = create_voucher_request(date, voucher_type, debit_ledger, credit_ledger, amount, narration);
  tallyProcessRequest(createVoucherRequest, parseResponseObj, reqIdStr);
}


function handleCreateUnitName(unit_name) {
  const reqIdStr = `Create Unit: ${unit_name}`;
  const createUnitNameRequest = create_unit_name_request(unit_name)
  tallyProcessRequest(createUnitNameRequest, parseResponseObj, reqIdStr);
}

function handleCreateStockGroup(stock_group_name, parent_stock_group_name) {
  const reqIdStr = `Create StockGroup: ${stock_group_name} [parent:${parent_stock_group_name}]`;
  const createStockGroupRequest = create_stock_group_request(stock_group_name, parent_stock_group_name);
  tallyProcessRequest(createStockGroupRequest, parseResponseObj, reqIdStr);
}

function handleCreateStockItem(stockitem_name, parent_stock_group_name, unit_name,
                               open_position_type, open_position_quantity, open_position_amount) {
  const reqIdStr = `Create StockItem: ${stockitem_name} [parent:${parent_stock_group_name}] ${unit_name}}`;
  const createStockItemRequest = create_stock_item_request(stockitem_name, parent_stock_group_name, unit_name,
      open_position_type, open_position_quantity, open_position_amount);
  tallyProcessRequest(createStockItemRequest, parseResponseObj, reqIdStr);
}

function commandTester() {
  // showAccounts();
  // showLedgers();
  // showBalanceSheet();
  // showProfitLoss();
  // showTrialBalance();
  // showDayBook();

  handleCreateLedgerGroup("Computers and Accessories", "Indirect Expenses");
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
  commandTester
}