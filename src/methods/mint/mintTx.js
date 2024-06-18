const { Runestone, RuneId, none, some } = require('runelib')
const { findFirstUtxoAvailable } = require('../../services/utxo.js')
const { getRuneIdByName } = require('../../services/runes.js')
const {
  bitcoin,
  feePerVByte,
  tweakedSigner,
  taprootAddress,
  testnetNetwork
} = require('../../config.js')
const { mintRunestoneScript } = require('../../utils/runestone.js')
const { signAndSubmit } = require('../../services/tx.js')
const { log } = require('../../utils/logger.js')

async function mintTx({ name, runeId }) {
  if (!runeId) {
    if (!name) {
      throw Error('Either enter a rune name or rune id')
    } else {
      name = name.toUpperCase()
      runeId = await getRuneIdByName(name)
      if (!runeId) {
        throw Error('Rune not found by the name provided')
      }
    }
  }
  log(`Attempting to mint rune${name ? ' ' + name : ''} with id ${runeId}.`)

  const estimatedVBytes = 174
  const fee = feePerVByte() * estimatedVBytes

  const utxo = await findFirstUtxoAvailable(taprootAddress(), fee + 546)

  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })

  unsignedTx.addInput(utxo)

  const runeScript = mintRunestoneScript(runeId)

  unsignedTx.addOutput({ value: 0, script: runeScript })

  unsignedTx.addOutput({ address: taprootAddress(), value: 546 })

  const change = utxo.value - fee
  unsignedTx.addOutput({ address: taprootAddress(), value: change })

  const { txHash } = await signAndSubmit(unsignedTx, tweakedSigner())

  log(`Submitted mint transaction with hash ${txHash}`)
  
  return { txHash }
}

module.exports = {
  mintTx
}