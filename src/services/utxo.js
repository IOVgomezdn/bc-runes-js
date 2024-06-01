const { get } = require('./http.js')
const { signAndSubmit, waitForTxToBeConfirmed } = require('./tx.js')
const { log } = require('../utils/logger.js')
const { 
  utxoURL,
  bitcoin,
  testnetNetwork,
  untweakedSigner,
  feePerByte
} = require('../config.js')

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
  const fee = feePerByte() * 153

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
    // TO DO: parameterize that 153 value for the actual vBytes of the tx 
    log(`Consolidating all UTXOs from address ${address} with a total of ${total - fee * 153} satoshis.`)
    
    unsignedTx.addOutput({ address, value: total - fee })  
    const { txHash } = await signAndSubmit(unsignedTx, untweakedSigner())
    log(`Submitted UTXOs consolidation transaction with hash ${txHash}.`)

    await waitForTxToBeConfirmed(txHash)
  } else {
    log('No UTXOs to consolidate yet.')
  }
}

async function splitUtxos(address) {
  // TODO
}

module.exports = {
  findFirstUtxoAvailable,
  findUtxo,
  consolidateUtxos
}