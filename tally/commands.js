const {
  handleCreateLedgerGroup,
  handleCreateLedger,
  handleCreateVoucher,
  handleCreateVoucherSplit,
  showAccounts,
  showLedgers,
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

  "SHOW_ACCOUNTS": {
    handler: showAccounts
  },
  "SHOW_LEDGERS": {
    handler: showLedgers
  },
  "SHOW_LEDGERGROUPS": {
    handler: showLedgerGroups
  },
  "SHOW_BALANCESHEET": {
    handler: showBalanceSheet
  },
  "SHOW_PROFITLOSS": {
    handler: showProfitLoss
  },
  "SHOW_TRIALBALANCE": {
    handler: showTrialBalance
  },
  "SHOW_DAYBOOK": {
    handler: showDayBook
  }
}

const tallyCommands = Object.keys(tallyCommandMap)

module.exports = {
  tallyCommands,
  tallyCommandMap
}