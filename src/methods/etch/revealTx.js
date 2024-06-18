const {
  bitcoin,
  testnetNetwork,
  taprootAddress,
  tweakedSigner
} = require('../../config.js')
const { etchRunestoneScript } = require('../../utils/runestone.js')
const { signAndSubmit } = require('../../services/tx.js')
const { log } = require('../../utils/logger.js')

async function revealTx({
  commitUtxo,
  name,
  amount,
  cap,
  divisibility,
  premine,
  symbol
}) {
  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })

  unsignedTx.addInput(commitUtxo)

  const runestone = etchRunestoneScript({ name, amount, cap, divisibility, premine, symbol })

  unsignedTx.addOutput({
    script: runestone,
    value: 0
  })

  unsignedTx.addOutput({
    address: taprootAddress(),
    value: 546
  })

  const { txHash: revealTxHash } = await signAndSubmit(unsignedTx, tweakedSigner())
  log(`Reveal transaction submitted with hash ${revealTxHash}`)

  return { revealTxHash }
}

module.exports = {
  revealTx
}