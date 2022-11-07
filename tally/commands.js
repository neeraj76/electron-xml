const {
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
  getDayBook
} = require('./handlers');

// const tallyCommands = [
//     'LEDGERGROUP',
//     'LEDGER',
//     'VOUCHER',
//     'VOUCHERSPLIT'
// ]

const tallyCommandMap = {
  'LEDGERGROUP': {
    handler: handleCreateLedgerGroup
  },
  'LEDGER': {
    handler: handleCreateLedger
  },
  'VOUCHER': {
    handler: handleCreateVoucher
  },
  'VOUCHERSPLIT': {
    handler: handleCreateVoucherSplit
  },

  "ACCOUNTS": {
    handler: getAccounts,
    type: "get"
  },
  "LEDGERS": {
    handler: getLedgers,
    type: "get"
  },
  "LEDGER_GROUPS": {
    handler: getLedgerGroups,
    type: "get"
  },
  "BALANCE_SHEET": {
    handler: getBalanceSheet,
    type: "get"
  },
  "PROFIT_LOSS": {
    handler: getProfitLoss,
    type: "get"
  },
  "TRIAL_BALANCE": {
    handler: getTrialBalance,
    type: "get"
  },
  "DAY_BOOK": {
    handler: getDayBook,
    type: "get"
  }
}

const tallyCommands = Object.keys(tallyCommandMap);
const tallyReadOnlyCommands = Object.entries(tallyCommandMap)
    .filter(([key, val]) => val.type === "get")
    .map(([key, _]) => key);
// const tallyReadOnlyCommands = tallyCommands;


module.exports = {
  tallyCommandMap,
  tallyCommands,
  tallyReadOnlyCommands
}