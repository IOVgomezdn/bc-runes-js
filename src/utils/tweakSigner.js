const bitcoin = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const ecc = require('@bitcoinerlab/secp256k1')

const ECPair = ECPairFactory(ecc)
const testnetNetwork = bitcoin.networks.testnet

function tapTweakHash(pubKey) {
  return bitcoin.crypto.taggedHash(
      'TapTweak',
      pubKey,
  )
}

function toXOnly(pubkey) {
  return pubkey.subarray(1, 33)
}

function tweakSigner(signer) {
  if (!signer.privateKey) {
    throw new Error('Private key is required for tweaking signer!')
  }

  const privateKey = signer.publicKey[0] === 3 ? ecc.privateNegate(signer.privateKey) : signer.privateKey

  const tweakedPrivateKey = ecc.privateAdd(
      privateKey,
      tapTweakHash(toXOnly(signer.publicKey)),
  )

  if (!tweakedPrivateKey) {
      throw new Error('Invalid tweaked private key!')
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), { network: testnetNetwork })
}

module.exports = {
  tapTweakHash,
  toXOnly,
  tweakSigner
}