const { mintTx } = require('./mintTx.js')
const { waitForTxToBeConfirmed } = require('../../services/tx.js')
const { log } = require('../../utils/logger.js')

async function mint({ name, runeId }) {
  const { txHash } = await mintTx({ name, runeId })

  log('Now waiting for transaction to be confirmed')
  await waitForTxToBeConfirmed(txHash)
  log(`Mint transaction confirmed with hash ${txHash}`)
  return { txHash }
}

module.exports = {
  mint
}