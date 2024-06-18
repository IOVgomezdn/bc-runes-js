const { transferTx } = require('./transferTx.js')
const { waitForTxToBeConfirmed } = require('../../services/tx.js')
const { log } = require('../../utils/logger.js')

async function transfer(transfers) {
  const { txHash } = await transferTx(transfers)

  log('Now waiting for transaction to be confirmed')
  await waitForTxToBeConfirmed(txHash)
  log(`Transfer transaction confirmed with hash ${txHash}`)
  return { txHash }
}

module.exports = {
  transfer
}