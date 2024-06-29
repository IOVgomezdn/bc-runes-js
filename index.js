const { init, setWif } = require('./src/config.js')
const { etch } = require('./src/methods/etch/etch.js')
const { mint } = require('./src/methods/mint/mint.js')
const { mintTx } = require('./src/methods/mint/mintTx.js')
const { commitTx } = require('./src/methods/etch/commitTx.js')
const { revealTx } = require('./src/methods/etch/revealTx.js')
const { transfer } = require('./src/methods/transfer/transfer.js')
const { transferTx } = require('./src/methods/transfer/transferTx.js')
const { isConfirmed, getConfirmations, waitForTxToBeConfirmed, waitForTxToMature } = require('./src/services/tx.js')
const { findUtxo, consolidateUtxos } = require('./src/services/utxo.js')
const { getRuneIdByName, getRunesByAddress } = require('./src/services/runes.js')
const { getRandomWif } = require('./src/utils/getRandomWIF.js')
const { generateAddress } = require('./src/utils/address.js')

module.exports = {
  getRandomWif,
  generateAddress,
  setWif,
  init,
  etch,
  mint,
  mintTx,
  commitTx,
  revealTx,
  transfer,
  transferTx,
  isConfirmed,
  getRuneIdByName,
  getRunesByAddress,
  getConfirmations,
  waitForTxToBeConfirmed,
  waitForTxToMature,
  findUtxo,
  consolidateUtxos
}
