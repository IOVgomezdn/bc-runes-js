const { findFirstUtxoAvailable } = require('./utxo.js')
const { estimate } = require('./estimate.js')
const {
  bitcoin,
  untweakedSigner,
  paymentAddress,
  testnetNetwork,
} = require('../config.js')
const { signAndSubmit } = require('../services/tx.js')

async function transfer(from, to, amount) {
  const feePerByte = await estimate(6)
  const estimatedVBytes = 153
  const fee = feePerByte * estimatedVBytes

  const utxo = await findFirstUtxoAvailable(paymentAddress, amount + fee)
  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })

  unsignedTx.addInput(utxo)

  unsignedTx.addOutput({ address: to, value: amount })

  const change = utxo.value - amount - fee

  unsignedTx.addOutput({ address: from, value: change })

  const { txHash } = await signAndSubmit(unsignedTx, untweakedSigner)

  return { txHash }
}

module.exports = {
  transfer
}