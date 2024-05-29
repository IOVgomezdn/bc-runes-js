const { commitTx } = require('./commitTx.js')
const { revealTx } = require('./revealTx.js')
const { findUtxo } = require('../../services/utxo.js')
const { waitForTxToMature, waitForTxToBeConfirmed } = require('../../services/tx.js')

async function etch({
  name,
  amount,
  cap,
  symbol,
  divisibility,
  premine,
  inscriptionContent
}) {
  name = name.toUpperCase()

  const { commitTxHash, scriptP2trAddress, tapLeafScript } = await commitTx({ name, inscriptionContent })

  await waitForTxToMature(commitTxHash)

  const commitUtxo = await findUtxo(scriptP2trAddress, commitTxHash)
  commitUtxo.tapLeafScript = tapLeafScript

  const { revealTxHash } = await revealTx({
    commitUtxo,
    name,
    amount,
    cap,
    symbol,
    divisibility,
    premine,
    inscriptionContent
  })

  await waitForTxToBeConfirmed(revealTxHash)

  return { revealTxHash }
}

module.exports = {
  etch
}