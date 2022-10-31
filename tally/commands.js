const { handleCreateLedgerGroup, handleCreateLedger, handleCreateVoucher} = require('./handlers');

const tallyCommands = [
    'LEDGERGROUP',
    'LEDGER',
    'VOUCHER'
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
  }
}

module.exports = {
  tallyCommands,
  tallyCommandMap
}