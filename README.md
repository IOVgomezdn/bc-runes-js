# BC RUNES JS
A package that makes use of [runelib](https://www.npmjs.com/package/runelib) library to allow minting, etching or transferring [bitcoin runes](https://docs.taproot.com/runes/specification.html) very easily, by abstracting a bit more of what runelib does, creating the whole environment and scripts for transaction signing, submitting, and waiting.

# USAGE

## Preparing the address
  ```javascript
    const {
      generateAddress,
      getRandomWif
    } = require('bc-runes-js')

    async function main() {
      // If getting an address for the first time, a random wif should be used.
      // Otherwise, skip the line below and invoke generateAddress($yourWif)
      const randomWif = getRandomWif()
      const address = generateAddress(randomWif).taprootAddress
      console.log(address)
    }
  ```
  Will output the following
  ```bash
    {
      taprootAddress: 'tb1paygndrxzphwlgpn8utlcp592wf267jvk50wxnam6zuvszruhk3pqut4e6f',
      WIF: 'cMjdU3yAEif9P6eug1pa3MxYbpgPjd5vTnRP1cfzLPrWg85N5NAg'
    }
  ```
  
  Save `taprootAddress` and `WIF` in an .env file or anywhere for later use in the project. This only taproot address will hold the runes sent to it, minted or premined, in outputs with a value of 546. It will need bigger utxos to pay the fees for the transactions it may send.
 <br>
 <br>
 **Note:** the address in this example is randomly generated and purely for this example, don't try to use it.


## Example for etching a rune

```javascript
const {
  etch,
  init
} = require('bc-runes-js')

const {
  TAPROOT_ADDRESS,
  WIF
} = process.env

async function main() {
  init({
    taprootAddress: TAPROOT_ADDRESS,
    wif: WIF,
    feePerVByte: 300
  })

  const res = await etch({
    amount: 1,
    cap: 100,
    divisibility: 0,
    name: 'YOUR•RUNE•NAME',
    symbol: '❤︎'
  })

  console.log({ res })
}

main()
```

## Example for minting a rune
```javascript
const {
  mint,
  init
} = require('bc-runes-js')

const {
  TAPROOT_ADDRESS,
  WIF
} = process.env

async function main() {
  init({
    taprootAddress: TAPROOT_ADDRESS,
    wif: WIF,
    feePerVByte: 300
  })

  // only one of these two arguments is mandatory
  const res = await mint({
    name: 'a rune name with or without spacers (•)',
    runeId: 'blockNumber:txIndex'
  })

  console.log({ res })
}

main()
```

## Example for minting a rune
Not implemented yet. Will be available soon.
