const { EtchInscription } = require('runelib')
const { getP2tr } = require('../../utils/addresses.js')
const {
  bitcoin,
  paymentAddress,
  tweakedSigner
} = require('../../config.js')
const { toXOnly } = require('../../utils/tweakSigner.js')
const { estimate } = require('../../services/estimate.js')
const { transfer } = require('../../services/transfer.js')
const { log } = require('../../utils/logger.js')

async function commitTx({
  name,
  inscriptionContent
}) {
  const inscription = new EtchInscription()

  if (inscriptionContent) {
    inscription.setContent("text/plain", Buffer.from(inscriptionContent, 'utf-8'))
  }
  inscription.setRune(name)
  
  const etchingScriptASM = `${toXOnly(tweakedSigner.publicKey).toString("hex")} OP_CHECKSIG`
  const etchingScript = Buffer.concat([bitcoin.script.fromASM(etchingScriptASM), inscription.encipher()])

  const scriptTree = {
    output: etchingScript,
  }

  const scriptP2tr = getP2tr({ internalPubkey: toXOnly(tweakedSigner.publicKey), scriptTree })

  const etchingRedeem = {
    output: etchingScript,
    redeemVersion: 192
  }

  const etchingP2tr = getP2tr({ internalPubkey: toXOnly(tweakedSigner.publicKey), scriptTree, redeem: etchingRedeem })

  const scriptP2trAddress= scriptP2tr.address

  const feePerByte = await estimate(6)
  const p2trTxFee = feePerByte * 207

  const tapLeafScript = [{
    leafVersion: etchingRedeem.redeemVersion,
    script: etchingRedeem.output,
    controlBlock: etchingP2tr.witness[etchingP2tr.witness.length - 1]
  }]

  log(`Sending commit transaction to taproot address ${scriptP2trAddress}`)
  const { txHash: commitTxHash } = await transfer(paymentAddress, scriptP2trAddress, p2trTxFee + 546)
  log(`Commit transaction submitted with hash ${commitTxHash}`)

  return {
    commitTxHash,
    scriptP2trAddress,
    tapLeafScript
  }
}

module.exports = {
  commitTx
}