const { Runestone, RuneId, none, some } = require('runelib')
const { findFirstUtxoAvailable } = require('../services/utxo.js')
const { estimate } = require('../services/estimate.js')
const { getRuneIdByName } = require('../services/runes.js')
const {
  bitcoin,
  untweakedSigner,
  paymentAddress,
  ordinalsAddress,
  testnetNetwork,
  redeemScript
} = require('../config.js')
const { signAndSubmit, waitForTxToBeConfirmed } = require('../services/tx.js')
const { log } = require('../utils/logger.js')

function createRuneMintScript(block, txIndex) {
  const mintstone = new Runestone([], none(), some(new RuneId(block, txIndex)), some(1))

  return mintstone.encipher()
}

async function mint(name, runeId) {
  if (!runeId) {
    if (!name) {
      throw Error('Either enter a rune name or rune id')
    } else {
      runeId = await getRuneIdByName(name)
      if (!runeId) {
        throw Error('Rune not found by the name provided')
      }
    }
  }

  log(`Attempting to mint rune ${name} with id ${runeId}`)
  const utxo = await findFirstUtxoAvailable(paymentAddress, redeemScript)

  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })

  unsignedTx.addInput(utxo)

  const runeScript = createRuneMintScript(...runeId)

  unsignedTx.addOutput({ value: 0, script: runeScript })

  unsignedTx.addOutput({ address: ordinalsAddress, value: 546 })

  const feePerByte = await estimate(6)
  const estimatedTxSize = unsignedTx.toBuffer().length
  const fee = feePerByte * estimatedTxSize
  const change = utxo.value - fee

  unsignedTx.addOutput({ address: paymentAddress, value: change })

  const { txHash } = await signAndSubmit(unsignedTx, untweakedSigner)

  log(`Submitted mint transaction with hash ${txHash}`)

  await waitForTxToBeConfirmed(txHash)
  
  return { txHash }
}

mint('gota de agua')

module.exports = {
  mint
}