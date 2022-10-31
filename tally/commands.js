const { handleCreateLedgerGroup, handleCreateLedger} = require('./handlers');

const tallyCommands = [
    'LEDGERGROUP',
    'LEDGER'
]

const tallyCommandMap = {
  'LEDGERGROUP': {
    handler: handleCreateLedgerGroup
  },
  'LEDGER': {
    handler: handleCreateLedger
  }
}

module.exports = {
  tallyCommands,
  tallyCommandMap
}