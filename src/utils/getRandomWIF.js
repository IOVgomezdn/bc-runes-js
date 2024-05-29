const bitcoin = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const ecc = require('@bitcoinerlab/secp256k1')

const network = bitcoin.networks.testnet
const ECPair = ECPairFactory(ecc)

console.log({ WIF: ECPair.makeRandom({ network }).toWIF() })