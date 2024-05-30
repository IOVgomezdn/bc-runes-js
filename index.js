const { etch } = require('./src/methods/etch/etch.js')
const { commitTx } = require('./src/methods/etch/commitTx.js')
const { revealTx } = require('./src/methods/etch/revealTx.js')
const { isConfirmed, getConfirmations, waitForTxToBeConfirmed, waitForTxToMature } = require('./src/services/tx.js')
const { findUtxo } = require('./src/services/utxo.js')

module.exports = {
  etch,
  commitTx,
  revealTx,
  isConfirmed,
  getConfirmations,
  waitForTxToBeConfirmed,
  waitForTxToMature,
  findUtxo
}
