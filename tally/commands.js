const {
  handleCreateLedgerGroup,
  handleCreateLedger,
  handleCreateVoucher,
  handleDeleteVoucher,
  handleModifyVoucher,
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
} = require('./handlers');

const tallyCommandMap = {
  'LEDGERGROUP': {
    handler: handleCreateLedgerGroup
  },
  'LEDGER': {
    handler: handleCreateLedger
  },
  'VOUCHER_ADD': {
    handler: handleCreateVoucher
  },
  'VOUCHER_DELETE': {
    handler: handleDeleteVoucher
  },
  'VOUCHER_MODIFY': {
    handler: handleModifyVoucher
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
  },
  "COMPANIES": {
    handler: getCompanies,
    type: "get"
  },
  "CURRENTCOMPANY":{
    handler: getCurrentCompany,
    type: "get"
  },
  "LICENSEINFO": {
    handler: getLicenseInfo,
    type: "get"
  },
}

const tallyParameterMap = {
  'LEDGERGROUP': [
    {
      name: 'ledgerGroupName',
      type: 'string'
    },
    {
      name: 'parentLedgerGroupName',
      type: 'string'
    }
  ],

  'LEDGER': [
    {
      name: 'ledgerName',
      type: 'string'
    },
    {
      name: 'parentLedgerGroupName',
      type: 'string'
    },
    {
      name: 'openingAmount',
      type: 'decimal'
    }
  ],

  'VOUCHER_ADD': [
    {
      name: 'voucherType',
      type: 'string'
    },
    {
      name: 'voucherDate',
      type: 'date'
    },
    {
      name: 'debitLedger',
      type: 'string'
    },
    {
      name: 'creditLedger',
      type: 'string'
    },
    {
      name: 'amount',
      type: 'decimal'
    },
    {
      name: 'narration',
      type: 'string'
    }
  ],

  // targetCompany, voucherType, voucherDate, narration, debitEntries, creditEntries
  // Haven't tested its working yet
  'VOUCHERSPLIT': [
    {
      name: 'voucherType',
      type: 'string'
    },
    {
      name: 'voucherDate',
      type: 'date'
    },
    {
      name: 'narration',
      type: 'string'
    }
  ],

  'UNIT': [
    {
      name: 'unitName',
      type: 'string'
    }
  ],

  'STOCKGROUP': [
    {
      name: 'stockGroupName',
      type: 'string'
    },
    {
      name: 'parentStockGroupName',
      type: 'string'
    }
  ],

  'STOCKITEM': [
    {
      name: 'stockItemName',
      type: 'string'
    },
    {
      name: 'parentStockGroupName',
      type: 'string'
    },
    {
      name: 'unitName',
      type: 'string'
    },
    {
      name: 'openPositionType',
      type: 'string'
    },
    {
      name: 'openPositionQuantity',
      type: 'decimal'
    },
    {
      name: 'openPositionAmount',
      type: 'decimal'
    }
  ],
}


const tallyCommands = Object.keys(tallyCommandMap);
const tallyReadOnlyCommands = Object.entries(tallyCommandMap)
    .filter(([key, val]) => val.type === "get")
    .map(([key, _]) => key);
// const tallyReadOnlyCommands = tallyCommands;


module.exports = {
  tallyCommandMap,
  tallyParameterMap,
  tallyCommands,
  tallyReadOnlyCommands
}