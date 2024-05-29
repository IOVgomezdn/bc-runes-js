const { get, post } = require('./http.js')
const { getTip } = require('./getTip.js')
const { sleep } = require('../utils/sleep.js')
const { txInfoURL, txURL } = require('../config.js')
const { log } = require('../utils/logger.js')

const CHECK_INTERVAL = 15000

async function submitTx(hex) {
  const txHash = await post(txURL, hex)
  
  return { txHash }
}

async function signAndSubmit(unsignedTx, signer) {
  const signedTx = unsignedTx.signAllInputs(signer)
  const hex = signedTx.finalizeAllInputs().extractTransaction().toHex()

  const { txHash } = await submitTx(hex)

  return { txHash }
}

async function getConfirmations(txHash) {
  const { status: { block_height: blockHeight } } = await get(txInfoURL(txHash))
  const { tipBlock } = await getTip()

  if (blockHeight) {
    return tipBlock - blockHeight + 1
  } else {
    return 0
  }
}

async function isConfirmed(txHash) {
  const { status: { confirmed } } = await get(txInfoURL(txHash))

  return confirmed
}

async function waitForTxToMature(txHash) {
  log(`Waiting for transaction ${txHash} to mature..`)
  let confirmations = await getConfirmations(txHash)

  while (confirmations < 6) {
    log(`Still has ${confirmations} confirmations, checking every ${CHECK_INTERVAL / 1000} seconds..`)
    await sleep(CHECK_INTERVAL)
    confirmations = await getConfirmations(txHash)
  }

  log('Transaction reached 6 or more confirmations')
  return { txHash }
}

async function waitForTxToBeConfirmed(txHash) {
  let confirmed = await isConfirmed(txHash)

  while (!confirmed) {
    log(`Waiting for transaction to be confirmed.. check is done every ${CHECK_INTERVAL / 1000} seconds`)
    await sleep(CHECK_INTERVAL)

    confirmed = await isConfirmed(txHash)
  }

  log(`Transaction ${txHash} confirmed`)
  return { txHash }
}

module.exports = {
  signAndSubmit,
  isConfirmed,
  getConfirmations,
  waitForTxToBeConfirmed,
  waitForTxToMature
}