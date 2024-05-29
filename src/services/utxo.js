const { get } = require('./http.js')
const { utxoURL, bitcoin, testnetNetwork, untweakedSigner } = require('../config.js')
const { estimate } = require('./estimate.js')
const { signAndSubmit } = require('./tx.js')
const { log } = require('../utils/logger.js')
const { sleep } = require('../utils/sleep.js')

async function findFirstUtxoAvailable(address, amountNeeded) {
  const utxos = await getUTxos(address)
  let utxo = undefined

  for (let i = 0; i < utxos.length && !utxo; i++) {
    const { txid: hash, vout: index, status: { confirmed }, value } = utxos[i]

    if (confirmed && value >= amountNeeded) {

      utxo = {
        value,
        hash,
        index,
        witnessUtxo: {
          value,
          script: bitcoin.address.toOutputScript(address, testnetNetwork)
        }
      }
    }
  }

  if (utxo) {
    return utxo
  } else {
    console.error(`No UTXOs available for address ${address} with at least ${amountNeeded} satoshis`)
    process.exit(1)
  }
}

async function findUtxo(address, txHash) {
  const utxos = await getUTxos(address)
  const utxo = utxos.find(({ txid }) => txid === txHash)

  if (utxo) {
    const { txid: hash, vout: index, status: { confirmed, block_height: blockHeight }, value } = utxo

    return {
      value,
      hash,
      index,
      confirmed,
      blockHeight,
      witnessUtxo: {
        value,
        script: bitcoin.address.toOutputScript(address, testnetNetwork)
      }
    }
  }
}

async function getUTxos(address) {
  const utxos = await get(utxoURL(address))

  return utxos
}

async function consolidateUtxos(address) {
  const utxos = await getUTxos(address)
  const fee = await estimate(6)

  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })
  let total = 0

  for (const { txid, vout, value } of utxos.filter(u => u.status.confirmed)) {
    if (value > 546) {
      total += value

      unsignedTx.addInput({
        hash: txid,
        index: vout,
        value,
        witnessUtxo: {
          value,
          script: bitcoin.address.toOutputScript(address, testnetNetwork)
        }
      })
    }
  }

  if (total) {
    log(`Consolidating all UTXOs from address ${address} with a total of ${total - fee * 153} satoshis.`)
    
    unsignedTx.addOutput({ address, value: total - fee * 153 })  
    const { txHash } = await signAndSubmit(unsignedTx, untweakedSigner)
  
    log(`Submitted UTXOs consolidation transaction with hash ${txHash}.`)
  } else {
    log('No UTXOs to consolidate yet.')
  }
}

async function splitUtxos(address) {
  // TODO
}

module.exports = {
  findFirstUtxoAvailable,
  findUtxo
}