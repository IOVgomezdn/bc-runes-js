const bitcoin = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const ecc = require('@bitcoinerlab/secp256k1')
const { tweakSigner } = require('./utils/tweakSigner.js')

const ECPair = ECPairFactory(ecc)
bitcoin.initEccLib(ecc)

const blockstreamBaseURL = 'https://blockstream.info/testnet/api'
const txURL = `${blockstreamBaseURL}/tx`
const txInfoURL = (txHash) => `${txURL}/${txHash}`
const utxoURL = (address) => `${blockstreamBaseURL}/address/${address}/utxo`
const searchRunesURL = (name) => `https://api-testnet.unisat.io/query-v4/runes/info-list?rune=${name}&limit=500`
const estimateURL = `${blockstreamBaseURL}/fee-estimates`
const getTipURL = `${blockstreamBaseURL}/blocks/tip/height`
const testnetNetwork = bitcoin.networks.testnet

let _paymentAddress, _ordinalsAddress, _wif, _untweakedSigner, _tweakedSigner, _feeEstimate, _feePerByte

function setWif(wif) {
  _wif = wif
}

function setAddresses(paymentAddress, ordinalsAddress) {
  _paymentAddress = paymentAddress
  _ordinalsAddress = ordinalsAddress
}

function setFeeEstimate(feeEstimate) {
  _feeEstimate = feeEstimate
}

function setFeePerByte(feePerByte) {
  _feePerByte = feePerByte
}

function setSigners(wif) {
  _untweakedSigner = ECPair.fromWIF(wif, testnetNetwork)
  _tweakedSigner = tweakSigner(_untweakedSigner)
}

function init({ paymentAddress, ordinalsAddress, wif, feePerByte, estimate }) {
  setWif(wif)
  setSigners(wif)
  setAddresses(paymentAddress, ordinalsAddress)
  
  if (feePerByte) {
    setFeePerByte(feePerByte)
  } else if (estimate) {
    setFeeEstimate(estimate)
  } else {
    throw new Error('Either set a feePerByte value or a fee estimate by blocks, for transactions')
  }
}

module.exports = {
  ECPair,
  init,
  bitcoin,
  setWif,
  setFeeEstimate,
  feeEstimate: () => _feeEstimate,
  feePerByte: () => _feePerByte,
  wif: () => _wif,
  untweakedSigner: () => _untweakedSigner,
  tweakedSigner: () => _tweakedSigner,
  paymentAddress: () => _paymentAddress,
  ordinalsAddress: () => _ordinalsAddress,
  blockstreamBaseURL,
  txURL,
  txInfoURL,
  utxoURL,
  searchRunesURL,
  estimateURL,
  getTipURL,
  testnetNetwork
}
