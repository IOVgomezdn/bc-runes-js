const { Runestone, RuneId, Edict, none } = require('runelib')
const { findFirstUtxoAvailable, findUtxosForRune } = require('../../services/utxo.js')
const { getRuneIdByName } = require('../../services/runes.js')
const {
  bitcoin,
  testnetNetwork,
  feePerVByte,
  taprootAddress,
  tweakedSigner,
  taprootInputSize,
  taprootOutputSize
} = require('../../config.js')
const { transferRunestoneScript } = require('../../utils/runestone.js')
const { signAndSubmit } = require('../../services/tx.js')
const { log } = require('../../utils/logger.js')

async function createEdictsAndOutputs(transfers, unsignedTx, feesUtxo, fee) {
  let firstUnusedOutputIndex = 0
  let runeChangeOutputs = 0

  const edicts = []
  const amountsTransferredByRune = { }
  
  for (let { amount, to, runeId, available } of transfers) {
    unsignedTx.addOutput({ address: to, value: 546 })

    edicts.push(new Edict(new RuneId(...runeId.split(':')), BigInt(amount), firstUnusedOutputIndex))
    firstUnusedOutputIndex++

    if (!amountsTransferredByRune[runeId]) {
      amountsTransferredByRune[runeId] = { totalAmountToTransfer: amount, available }
    } else {
      amountsTransferredByRune[runeId].totalAmountToTransfer += amount
    }
  }
  
  for (const [runeId, { available, totalAmountToTransfer }] of Object.entries(amountsTransferredByRune)) {
    const change = available - totalAmountToTransfer
    if (change) {
      edicts.push(new Edict(new RuneId(...runeId.split(':')), BigInt(change), firstUnusedOutputIndex))
      runeChangeOutputs++
      firstUnusedOutputIndex++
    }
  }

  while (runeChangeOutputs) {
    // adds as much runes change outputs depending on how edicts were added in the previous step
    unsignedTx.addOutput({ address: taprootAddress(), value: 546 })
    runeChangeOutputs--
  }

  const runeScript = transferRunestoneScript(edicts)
  unsignedTx.addOutput({ value: 0, script: runeScript })

  const btcChange = feesUtxo.value - fee
  if (btcChange) {
    unsignedTx.addOutput({ address: taprootAddress(), value: btcChange })
  }
}

async function getIdsForAllTransfers(transfers) {
  const transfersWithId = []

  for (const transfer of transfers) {
    if (!transfer.runeId) {
      if (!transfer.name) throw new Error('All transfers need either a rune id or name')
      transfer.runeId = await getRuneIdByName(transfer.name)
    }

    transfersWithId.push(transfer)
  }

  return transfersWithId
}

async function transferTx(transfers) {
  function filterUtxos(allUtxos) {
    const filtered = []
    for (const utxo of allUtxos) {
      if (!filtered.some(({ hash, index }) => utxo.hash === hash && utxo.index === index)) {
        filtered.push(utxo)
      }
    }
    return filtered
  }

  const unsignedTx = new bitcoin.Psbt({ network: testnetNetwork })
  
  transfers = await getIdsForAllTransfers(transfers)
  let runesUtxos = []
  for (const transfer of transfers) {
    const { utxos: runeUtxos, total } = await findUtxosForRune(taprootAddress(), transfer)
    transfer.available = total
    runesUtxos.push(...runeUtxos)
  }

  runesUtxos = filterUtxos(runesUtxos)
  unsignedTx.addInputs(runesUtxos)

  const estimatedVBytes = (runesUtxos.length + 1) * taprootInputSize + transfers.length * taprootOutputSize
  const fee = estimatedVBytes * feePerVByte()
  const feesUtxo = await findFirstUtxoAvailable(taprootAddress(), fee + 546)
  unsignedTx.addInput(feesUtxo)

  await createEdictsAndOutputs(transfers, unsignedTx, feesUtxo, fee)

  const { txHash } = await signAndSubmit(unsignedTx, tweakedSigner())
  log(`Submitted transfer transaction with hash ${txHash}`)

  return { txHash }
}

module.exports = {
  transferTx
}