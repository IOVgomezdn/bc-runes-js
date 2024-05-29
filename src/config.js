const bitcoin = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const ecc = require('@bitcoinerlab/secp256k1')
const { tweakSigner } = require('./utils/tweakSigner.js')
require('dotenv').config()

const {
  PAYMENT_ADDRESS: paymentAddress,
  ORDINALS_ADDRESS: ordinalsAddress,
  WIF: wif,
} = process.env

if (!wif) {
  throw new Error('No WIF found, use `npm run random-wif` and save it to .env, then run `npm run generate-addresses` and save them to .env also.')
}

const blockstreamBaseURL = 'https://blockstream.info/testnet/api'
const txURL = `${blockstreamBaseURL}/tx`
const txInfoURL = (txHash) => `${txURL}/${txHash}`
const utxoURL = (address) => `${blockstreamBaseURL}/address/${address}/utxo`
const searchRunesURL = (name) => `https://api-testnet.unisat.io/query-v4/runes/info-list?rune=${name}&limit=500`
const estimateURL = `${blockstreamBaseURL}/fee-estimates`
const getTipURL = `${blockstreamBaseURL}/blocks/tip/height`

const testnetNetwork = bitcoin.networks.testnet

const ECPair = ECPairFactory(ecc)
bitcoin.initEccLib(ecc)

const untweakedSigner = ECPair.fromWIF(wif, testnetNetwork)
const tweakedSigner = tweakSigner(untweakedSigner)

module.exports = {
  bitcoin,
  ECPair,
  ecc,
  testnetNetwork,
  tweakedSigner,
  untweakedSigner,
  paymentAddress,
  ordinalsAddress,
  estimateURL,
  getTipURL,
  txURL,
  utxoURL,
  txInfoURL,
  searchRunesURL
}
