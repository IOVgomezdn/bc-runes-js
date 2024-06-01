const { init, setWif } = require('./src/config.js')
const { etch } = require('./src/methods/etch/etch.js')
const { mint } = require('./src/methods/mint/mint.js')
const { mintTx } = require('./src/methods/mint/mintTx.js')
const { commitTx } = require('./src/methods/etch/commitTx.js')
const { revealTx } = require('./src/methods/etch/revealTx.js')
const { isConfirmed, getConfirmations, waitForTxToBeConfirmed, waitForTxToMature } = require('./src/services/tx.js')
const { findUtxo, consolidateUtxos } = require('./src/services/utxo.js')
const { getRuneIdByName } = require('./src/services/runes.js')
const { getRandomWif } = require('./src/utils/getRandomWIF.js')
const { generateAddresses } = require('./src/utils/addresses.js')

module.exports = {
  getRandomWif,
  generateAddresses,
  setWif,
  init,
  etch,
  mint,
  mintTx,
  commitTx,
  revealTx,
  isConfirmed,
  getRuneIdByName,
  getConfirmations,
  waitForTxToBeConfirmed,
  waitForTxToMature,
  findUtxo,
  consolidateUtxos
}
