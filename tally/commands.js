const {
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
    handler: showAccounts,
    type: "get"
  },
  "LEDGERS": {
    handler: getLedgers,
    type: "get"
  },
  "LEDGER_GROUPS": {
    handler: showLedgerGroups,
    type: "get"
  },
  "BALANCE_SHEET": {
    handler: showBalanceSheet,
    type: "get"
  },
  "PROFIT_LOSS": {
    handler: showProfitLoss,
    type: "get"
  },
  "TRIAL_BALANCE": {
    handler: showTrialBalance,
    type: "get"
  },
  "DAY_BOOK": {
    handler: showDayBook,
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