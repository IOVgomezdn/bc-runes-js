const { get } = require('./http.js')
const { signAndSubmit, waitForTxToBeConfirmed } = require('./tx.js')
const { log } = require('../utils/logger.js')
const { 
  utxoURL,
  bitcoin,
  testnetNetwork,
  tweakedSigner,
  feePerVByte,
  runesByAddressURL,
  runeUtxosForAddressURL,
  taprootOutputSize,
  taprootInputSize
} = require('../config.js')
const { toXOnly } = require('../utils/tweakSigner.js')
const { getRuneNameById } = require('./runes.js')
const { sleep } = require('../utils/sleep.js')


function formatUtxo(
  address,
  {
  txid: hash,
  vout: index,
  value,
  status = {}
} = {}) {
  return  {
    value,
    hash,
    index,
    confirmed: status.confirmed,
    blockHeight: status.block_height,
    witnessUtxo: {
      value,
      script: bitcoin.address.toOutputScript(address, testnetNetwork)
    },
    tapInternalKey: toXOnly(tweakedSigner().publicKey)
  }
}

async function findFirstUtxoAvailable(address, amountNeeded) {
  const utxos = await getUtxos(address)
  let utxo = undefined
  utxos.sort((u1, u2) => u2.value - u1.value)

  while (!utxo && utxos.length) {
    const current = utxos.pop()
    if (current.value >= amountNeeded) {
      utxo = formatUtxo(address, current)
    }
  }

  if (utxo) {
    return utxo
  } else {
    throw new Error(`No UTXOs available for address ${address} with at least ${amountNeeded} satoshis`)
  }
}

async function findUtxo(address, txHash) {
  const utxos = await getUtxos(address, false)
  const utxo = utxos.find(({ txid }) => txid === txHash)

  return utxo ? formatUtxo(address, utxo) : undefined
}

async function getRunesByAddress(address) {
  const { data } = await get(runesByAddressURL(address))

  return data.detail
}

async function findUtxosForRune(address, { runeId, amount } = {}) {
  if (amount < 0) throw new Error('Amount must be a positive number')

  const { data: { utxo: runeUtxos }} = await get(runeUtxosForAddressURL(address, runeId))
  const sufficientUtxos = { total: 0, utxos: [] }

  while (runeUtxos.length && sufficientUtxos.total < amount) {
    const { runes, txid, vout, satoshi: value } = runeUtxos.pop()
    runes.sort((r1, r2) => r2.total - r1.total)

    for (const { runeid, amount } of runes) {
      if (runeid === runeId) {
        sufficientUtxos.total += Number(amount)
        sufficientUtxos.utxos.push(formatUtxo(address, { txid, vout, value }))
      }
    }
  }

  if (sufficientUtxos.total >= amount) {
    return sufficientUtxos
  } else {
    const name = await getRuneNameById(runeId)
    throw new Error(`Address ${address} doesn't have enough ${name} to transfer.`)
  }
}

async function getUtxos(address, confirmedOnly = true) {
  const utxos = await get(utxoURL(address))

  return confirmedOnly ? utxos.filter(utxo => utxo.status && utxo.status.confirmed) : utxos
}

async function consolidateUtxos(address, valueThreshold) {
  // TODO: severely improve/optimize logic. Right now it works but it's not efficient.
  const utxos = await getUtxos(address)
  const fee = feePerVByte() * 153

  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })
  let total = 0

  for (const { txid, vout, value } of utxos.filter(u => u.status.confirmed)) {
    if (value > valueThreshold) {
      total += value

      unsignedTx.addInput(formatUtxo(address, { txid, vout, value }))
    }
  }

  if (total) {
    // TO DO: parameterize that 153 value for the actual vBytes of the tx 
    log(`Consolidating all UTXOs from address ${address} with a total of ${total - fee * 153} satoshis.`)
    
    unsignedTx.addOutput({ address, value: total - fee })  
    const { txHash } = await signAndSubmit(unsignedTx, tweakedSigner())
    log(`Submitted UTXOs consolidation transaction with hash ${txHash}.`)

    await waitForTxToBeConfirmed(txHash)
  } else {
    log('No UTXOs to consolidate yet.')
  }
}

async function splitBiggestUtxo({
  address,
  splitSize,
  maxUtxosQuantity = 100,
  roundUp = true
}) {
  const utxos = (await getUtxos(address)).sort((u1, u2) => u1.value - u2.value)
  const biggestUtxo = formatUtxo(address, utxos.pop())

  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })

  const utxoValue = biggestUtxo.value
  let chunks = Math.round(utxoValue / splitSize)

  if (!utxoValue || !chunks) {
      throw new Error('Not enough sats to split by the desired size')
  } else {
    unsignedTx.addInput(biggestUtxo)

    chunks = Math.min(chunks, maxUtxosQuantity)
    let remainingValue = utxoValue - chunks * splitSize
  
    const fee = () => (taprootInputSize + chunks * taprootOutputSize) * feePerVByte()

    while (fee() > remainingValue) {
      chunks--
      remainingValue += splitSize
    }

    const outputs = []
    for (let i = 0; i < chunks; i++) {
      outputs.push({
        address,
        value: splitSize
      })
    }

    const change = remainingValue - fee()
    if (change > 0 && roundUp) {
      const roundSize = Math.round(change / outputs.length)
      for (let i = 0; i < outputs.length; i++) {
        outputs[i].value += roundSize
      }
    }

    log(`Splitting the UTXO with value ${utxoValue} into ${chunks} pieces of ${outputs[0].value} sats each, with a fee rate of ${feePerVByte()} sats per VByte.\n\nIf don't want to distribute the change between all the chunks, run it again passing { roundUp: false } option argument.\n\nWaiting 10 seconds to cancel, otherwise will proceed..`, true)
    let timer = 10
    while (timer) {
      await sleep(1000)
      log(`${timer} seconds left`, true)
      timer--
    }
    await sleep(1000)

    unsignedTx.addOutputs(outputs)
    const { txHash } = await signAndSubmit(unsignedTx, tweakedSigner())
    log(`Submitted split utxos transaction with hash ${txHash}`)
  }
}

module.exports = {
  findFirstUtxoAvailable,
  findUtxo,
  findUtxosForRune,
  getRunesByAddress,
  getUtxos,
  consolidateUtxos,
  splitBiggestUtxo
}