const bitcoin = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const ecc = require('@bitcoinerlab/secp256k1')

const network = bitcoin.networks.testnet
const ECPair = ECPairFactory(ecc)

function getRandomWif() {
  const wif = ECPair.makeRandom({ network }).toWIF()
  
  return wif
}

if (process.argv[2] === '--log=wif') {
  console.log({ WIF: getRandomWif() })
}

module.exports = {
  getRandomWif
}