const bitcoin = require('bitcoinjs-lib')
const { toXOnly } = require('./tweakSigner.js')
const { tweakedSigner, untweakedSigner } = require('../config.js')

const network = bitcoin.networks.testnet

function getP2tr({
  internalPubkey,
  scriptTree,
  redeem
}) {
    if (redeem) {
      return bitcoin.payments.p2tr({
        internalPubkey,
        scriptTree,
        redeem,
        network
      })
    } else {
      return bitcoin.payments.p2tr({
        internalPubkey,
        scriptTree,
        network
      })
    }
}

const { address: paymentAddress } = bitcoin.payments.p2wpkh({
  pubkey: untweakedSigner.publicKey,
  network
})

const { address: ordinalsAddress } = bitcoin.payments.p2tr({
  pubkey: toXOnly(tweakedSigner.publicKey),
  network
})

if (process.argv[2] === 'log') {
  console.log({ paymentAddress, ordinalsAddress })
}

module.exports = {
  ordinalsAddress,
  paymentAddress,
  getP2tr
}