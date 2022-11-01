const {
  handleCreateLedgerGroup,
  handleCreateLedger,
  handleCreateVoucher,
  handleCreateVoucherSplit
} = require('./handlers');

const tallyCommands = [
    'LEDGERGROUP',
    'LEDGER',
    'VOUCHER',
    'VOUCHERSPLIT'
]

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
  }
}

module.exports = {
  tallyCommands,
  tallyCommandMap
}