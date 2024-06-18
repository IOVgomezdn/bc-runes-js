const { findFirstUtxoAvailable } = require('./utxo.js')
const {
  bitcoin,
  tweakedSigner,
  testnetNetwork,
  feePerVByte,
  taprootInputSize,
  taprootOutputSize,
} = require('../config.js')
const { signAndSubmit } = require('../services/tx.js')

async function transfer(from, to, amount) {
  const estimatedVBytes = taprootInputSize + taprootOutputSize * 2
  const fee = feePerVByte() * estimatedVBytes

  const utxo = await findFirstUtxoAvailable(from, amount + fee)
  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })

  unsignedTx.addInput(utxo)

  unsignedTx.addOutput({ address: to, value: amount })

  const change = utxo.value - amount - fee

  unsignedTx.addOutput({ address: from, value: change })

  const { txHash } = await signAndSubmit(unsignedTx, tweakedSigner())

  return { txHash }
}

module.exports = {
  transfer
}