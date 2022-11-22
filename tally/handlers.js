const {
  get_companies_request,
  get_current_company_request,
  get_license_info_request,
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
  create_stock_item_request,
} = require("./messages");
const { tallyProcessRequestPromise } = require("./request");
const { DateToStringDate } = require('../utils/date');

const flagShowDesc = false;
const flagShowAll = false;
const flagShowArray = false;
const indentationLen = 4;
const propNameLen = 30;


function getCompanies({command}) {
  const companiesRequest = get_companies_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(companiesRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const companyResponse = tallyResponse.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].COMPANY;
            if (companyResponse) {
              const companies = companyResponse.map(company => {
                // console.log(`company=${JSON.stringify(company, null, 2)}`);
                return {
                  name: company['$'].NAME,
                  alt: company.NAME[0]['_']
                };
              })

              resolve({response:companies, request:command});
            } else {
              // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
              // throw 'this should be handled';
              throw 'Error! in getting companies. Verify that tally is running in Licensed mode or Educational mode.';
            }
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function getLicenseInfo({command}) {
  const licenseInfoRequest = get_license_info_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(licenseInfoRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const licenseInfoResponse = tallyResponse.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].LICENSEINFO[0];
            if (licenseInfoResponse) {
              const licenseInfo = parseCollection(licenseInfoResponse);

              // const licenseInfo = Object.keys(licenseInfoResponse).map(key => {
              //   // console.log(`key=${key} value=${JSON.stringify(licenseInfoResponse[key], null, 2)}`);
              //   if (key === '$') {
              //     return {name: key, value: licenseInfoResponse[key], type:'header'}
              //   } else {
              //     return {name: key, value: licenseInfoResponse[key][0]["_"], type: licenseInfoResponse[key][0]["$"].TYPE};
              //   }
              // })

              resolve({response:licenseInfo, request:command});
            } else {
              // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
              // throw 'this should be handled';
              throw 'Error! in getting License Info. Verify that tally is running in Licensed mode or Educational mode.';
            }
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function parseCollection(response) {
  const list = Object.keys(response).map(key => {
    // console.log(`key=${key} value=${JSON.stringify(response[key], null, 2)}`);
    // return response[key];
    if (key === '$') {
      return {name: key, value: response[key], type: 'header'}
    } else {
      return {name: key, value: response[key][0]["_"], type: response[key][0]["$"].TYPE};
    }
  })
      .filter(item => item.name !== '$')
  
  return list;
}

function getCurrentCompany({command}) {
  const currentCompanyRequest = get_current_company_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(currentCompanyRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const currentCompanyResponse = tallyResponse.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].CURRENTCOMPANY[0];
            if (currentCompanyResponse) {
              const currentCompany = parseCollection(currentCompanyResponse)[0];

              resolve({response:currentCompany, request:command});
            } else {
              // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
              // throw 'this should be handled';
              throw 'Error! in getting License Info. Verify that tally is running in Licensed mode or Educational mode.';
            }
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function getAccounts({command}) {
  const accountListRequest = get_accounts_list_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(accountListRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const messages = tallyResponse.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE;
            messages.forEach(msg => {
              console.log(`msg.keys=${Object.keys(msg)}`);
            })

            // console.log(`messages=${JSON.stringify(messages, null, 2)}`);
            // const accounts = messages.map(msg => {
            //   // console.log(`Msg Keys: ${Object.keys(msg)}  ${Object.keys(msg['$'])}`);
            //   if (Object.keys(msg).includes('VOUCHERTYPE')) {
            //     console.log(`VoucherType: ${msg.VOUCHERTYPE[0]['$']['NAME']}`)
            //   }
            //   return msg.VOUCHERTYPE[0]['$']['NAME'];
            // });

            resolve({response:messages, request:command});
          } else {
            // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
            // throw 'this should be handled';
            throw 'Error! in getting accounts. Verify that a company is selected.';
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function getLedgers({command, parameters}) {
  console.log(`getLedgers: parameters=${JSON.stringify(parameters, null, 2)}`);
  const ledgerListRequest = get_ledgers_list_request(parameters);

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(ledgerListRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const ledgerResponse = tallyResponse.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].LEDGER;
            if (ledgerResponse) {
              const ledgers = ledgerResponse.map(ledger => {
                // console.log(`ledger=${JSON.stringify(ledger, null, 2)}`);
                return {
                  name: ledger['LANGUAGENAME.LIST'][0]['NAME.LIST'][0].NAME[0],
                  parent: ledger.PARENT[0]['_']
                };
              })

              resolve({response:ledgers, request:command});
            } else {
              // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
              // throw 'this should be handled';
              throw 'Error! in getting ledgers. Verify that a company is selected.';
            }
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function getLedgerGroups(command) {
  const ledgerGroupsListRequest = get_ledger_groups_list_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(ledgerGroupsListRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const groupResponse = tallyResponse.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].GROUP;
            if (groupResponse) {
              const groups = groupResponse.map(group => {
                // console.log(`ledger=${JSON.stringify(group, null, 2)}`);
                return {
                  name: group['LANGUAGENAME.LIST'][0]['NAME.LIST'][0].NAME[0],
                  parent: group.PARENT[0]['_']
                };
              })

              resolve({response:groups, request:command});
            } else {
              // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
              // throw 'this should be handled';
              throw 'Error! in getting groups. Verify that a company is selected.';
            }
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function getBalanceSheet({command}) {
  const balanceSheetRequest = get_balance_sheet_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(balanceSheetRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const bsnames = tallyResponse.ENVELOPE.BSNAME;
            const bsamts = tallyResponse.ENVELOPE.BSAMT;

            bsnames.forEach((bsname,i) =>{
              const bsAccName = bsname.DSPACCNAME[0].DSPDISPNAME[0];
              const bsamt = bsamts[i];
              // console.log(`${i} bsamt=${JSON.stringify(bsamt)}`);
              const bsSubAmts = bsamt.BSSUBAMT;
              const bsMainAmt = bsamt.BSMAINAMT[0];

              console.log(`${i} ${JSON.stringify(bsAccName)}: ${bsMainAmt}`);
            })

            resolve({response: {}, request:command});
          } else {
            // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
            // throw 'this should be handled';
            throw 'Error! in getting accounts. Verify that a company is selected.';
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function getProfitLoss({command}) {
  const profitLossRequest = get_profit_loss_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(profitLossRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const dspNames = tallyResponse.ENVELOPE.DSPACCNAME;
            const plAmts = tallyResponse.ENVELOPE.PLAMT;

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

            resolve({response: {}, request:command});
          } else {
            // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
            // throw 'this should be handled';
            throw 'Error! in getting accounts. Verify that a company is selected.';
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}

function getTrialBalance({command}) {
  const trialBalanceRequest = get_trial_balance_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(trialBalanceRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {
            const dspAccNames = tallyResponse.ENVELOPE.DSPACCNAME;
            const dspAccInfos = tallyResponse.ENVELOPE.DSPACCINFO;

            dspAccNames.forEach((dspAccName,i) =>{
              const accName = dspAccName.DSPDISPNAME[0];
              const dspAccInfo = dspAccInfos[i];

              // console.log(`dspAccInfo: ${JSON.stringify(dspAccInfo)}`);
              const accDebitAmount = dspAccInfo.DSPCLDRAMT[0].DSPCLDRAMTA[0];
              const accCreditAmount = dspAccInfo.DSPCLCRAMT[0].DSPCLCRAMTA[0];

              console.log(`${i} ${JSON.stringify(accName.padStart(30))}: '${accDebitAmount.padStart(10)}' '${accCreditAmount.padStart(10)}'`);
            })

            resolve({response: {}, request:command});
          } else {
            // throw just makes the handling of exceptions of resolve similar to exceptions from called fns
            // throw 'this should be handled';
            throw 'Error! in getting accounts. Verify that a company is selected.';
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
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

function getDayBook({command}) {
  const dayBookRequest = get_day_book_request();

  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(dayBookRequest)
        .then(({status, tallyResponse}) => {
          if (status == 'Success') {

            resolve({response: {}, request:command});
          } else {
            const messages = tallyResponse.ENVELOPE.BODY[0].IMPORTDATA[0].REQUESTDATA[0].TALLYMESSAGE;

            messages.slice(0,8).forEach((msg, m_index) => {
              const voucher = msg.VOUCHER[0];
              traverse(voucher, m_index, 0, "Voucher");
            })

            // throw just makes the handling of exceptions to resolve similar to exceptions from called fns
            // throw 'this should be handled';
            throw 'Error! in getting accounts. Verify that a company is selected.';
          }
        })
        // Keep the catch block as it is needed to catch the exceptions raised from .then block
        .catch(error =>{
          // console.log(`getLedgers:catch error=${error}`);
          reject(error);
        });
  });
}


function parseTallyResponseObj(tallyResponse) {
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
function tallyCommandExecute(commandRequest) {
  return new Promise((resolve, reject) => {
    tallyProcessRequestPromise(commandRequest)
        .then(({status, tallyResponse}) => {
          parseTallyResponseObj(tallyResponse)
              .then(parseResponse => {
                // console.log(`tallyCommandExecute: response=${JSON.stringify(parseResponse, null, 2)}`);
                if (parseResponse.ERRORS > 0 || Object.keys(parseResponse).includes('LINEERROR')) {
                  reject({status: 'ERROR', reason: parseResponse.LINEERROR, tallyError:parseResponse})
                }

                resolve({status: 'SUCCESS', tallyResponse:parseResponse});
              })
        })
        .catch(({status, reason, tallyError, requestObj, reqIdStr}) => {
          // console.log(`tallyCommandExecute: tallyError=${tallyError}`);
          reject({status: 'ERROR', reason: 'error communicating with tally', tallyError})
        });
  });
}

function handleCreateLedgerGroup(ledger_group_name, parent_ledger_group_name) {
  const reqIdStr = `Create LedgerGroup: ${ledger_group_name} [parent:${parent_ledger_group_name}]`;
  const createLedgerGroupsRequest = create_ledger_group_request(ledger_group_name, parent_ledger_group_name);

  return tallyCommandExecute(createLedgerGroupsRequest);
}

function handleCreateLedger(ledger_name, parent_ledger_group_name, opening_amount) {
  const reqIdStr = `Create Ledger: ${ledger_name} [parent:${parent_ledger_group_name} opening_amount=${opening_amount}]`;
  const createLedgersRequest = create_ledger_request(ledger_name, parent_ledger_group_name, opening_amount);

  return tallyCommandExecute(createLedgersRequest);
}

function createTallyVoucherPromise(voucherRequest, reqIdStr) {
  return new Promise((resolve, reject) => {
    tallyCommandExecute(voucherRequest)
        .then(response => {
          const voucherResponse = {
            status: response.status,
            voucher_id: response.tallyResponse.LASTVCHID
          }
          resolve(voucherResponse);
        })
        .catch(error => {
          delete error.tallyError
          reject(error);
        });
  });
}

// The data must be a javascript data instance
function handleCreateVoucher(target_company, voucher_type, voucher_date, debit_ledger, credit_ledger, amount, narration) {
  const reqIdStr = `Create Voucher: ${voucher_type} ${DateToStringDate(voucher_date)} [DR:${debit_ledger} CR:${credit_ledger}] ${amount}`;
  const createVoucherRequest = create_voucher_request(target_company, voucher_type, voucher_date, debit_ledger, credit_ledger, amount, narration);

  return createTallyVoucherPromise(createVoucherRequest, reqIdStr);
}

// The data must be a javascript data instance
function handleCreateVoucherSplit(target_company, voucher_type, voucher_date, narration, debit_entries, credit_entries) {
  // const date = ExcelDateToJSDate(excel_date);
  const reqIdStr = `Create VoucherSplit: ${voucher_type} ${DateToStringDate(voucher_date)} [DR:${debit_entries} CR:${credit_entries}]`;
  const createVoucherSplitRequest = create_vouchersplit_request(target_company, voucher_type, voucher_date, narration, debit_entries, credit_entries);

  return createTallyVoucherPromise(createVoucherSplitRequest, reqIdStr);
}

function handleCreateUnitName(unit_name) {
  const reqIdStr = `Create Unit: ${unit_name}`;
  const createUnitNameRequest = create_unit_name_request(unit_name);

  return tallyCommandExecute(createUnitNameRequest);
}

function handleCreateStockGroup(stock_group_name, parent_stock_group_name) {
  const reqIdStr = `Create StockGroup: ${stock_group_name} [parent:${parent_stock_group_name}]`;
  const createStockGroupRequest = create_stock_group_request(stock_group_name, parent_stock_group_name);

  return tallyCommandExecute(createStockGroupRequest);
}

function handleCreateStockItem(stockitem_name, parent_stock_group_name, unit_name,
                               open_position_type, open_position_quantity, open_position_amount) {
  const reqIdStr = `Create StockItem: ${stockitem_name} [parent:${parent_stock_group_name}] ${unit_name}}`;
  const createStockItemRequest = create_stock_item_request(stockitem_name, parent_stock_group_name, unit_name,
      open_position_type, open_position_quantity, open_position_amount);

  return tallyCommandExecute(createStockItemRequest);
}

function commandTester() {
  // showAccounts();
  // showLedgers();
  getLedgerGroups();
  // getBalanceSheet();
  // showProfitLoss();
  // getTrialBalance();
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
  getAccounts,
  getLedgers,
  getLedgerGroups,
  getBalanceSheet,
  getProfitLoss,
  getTrialBalance,
  getDayBook,
  getCompanies,
  getCurrentCompany,
  getLicenseInfo,
}