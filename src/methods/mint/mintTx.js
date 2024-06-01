const { Runestone, RuneId, none, some } = require('runelib')
const { findFirstUtxoAvailable } = require('../../services/utxo.js')
const { getRuneIdByName } = require('../../services/runes.js')
const {
  bitcoin,
  feePerByte,
  untweakedSigner,
  paymentAddress,
  ordinalsAddress,
  testnetNetwork
} = require('../../config.js')
const { signAndSubmit } = require('../../services/tx.js')
const { log } = require('../../utils/logger.js')

function createRuneMintScript(block, txIndex) {
  const mintstone = new Runestone([], none(), some(new RuneId(block, txIndex)), some(1))

  return mintstone.encipher()
}

async function mintTx({ name, runeId }) {
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
  log(`Attempting to mint rune${name ? ' ' + name : ''} with id ${runeId.join(':')}`)

  const estimatedVBytes = 174
  const fee = feePerByte() * estimatedVBytes

  const utxo = await findFirstUtxoAvailable(paymentAddress(), fee + 546)

  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })

  unsignedTx.addInput(utxo)

  const runeScript = createRuneMintScript(...runeId)

  unsignedTx.addOutput({ value: 0, script: runeScript })

  unsignedTx.addOutput({ address: ordinalsAddress(), value: 546 })

  const change = utxo.value - fee
  unsignedTx.addOutput({ address: paymentAddress(), value: change })

  const { txHash } = await signAndSubmit(unsignedTx, untweakedSigner())

  log(`Submitted mint transaction with hash ${txHash}`)
  
  return { txHash }
}

module.exports = {
  mintTx
}