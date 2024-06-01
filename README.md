# BC RUNES JS
A package that makes use of [runelib](https://www.npmjs.com/package/runelib) library to allow minting, etching or transferring [bitcoin runes](https://docs.ordinals.com/runes/specification.html) very easily, by abstracting a bit more of what runelib does, creating the whole environment and scripts for transaction signing, submitting, and waiting.

# USAGE

## Preparing the addresses
  ```javascript
    const {
      generateAddresses,
      getRandomWif
    } = require('bc-runes-js')

    async function main() {
      // If getting addresses for the first time, a random wif should be used.
      // Otherwise, skip the line below and invoke generateAddresses($yourWif)
      const randomWif = getRandomWif()
      const addresses = generateAddresses(randomWif)
      console.log(addresses)
    }
  ```
  Will output the following
  ```bash
    {
      paymentAddress: 'tb1qjv2yav5wrfgljqgsyqm2fk0duf6g24fn54sw5l',
      ordinalsAddress: 'tb1paygndrxzphwlgpn8utlcp592wf267jvk50wxnam6zuvszruhk3pqut4e6f',
      WIF: 'cMjdU3yAEif9P6eug1pa3MxYbpgPjd5vTnRP1cfzLPrWg85N5NAg'
    }
  ```
  
  Save `paymentAddress`, `ordinalsAddress` and `WIF` in an .env file or anywhere for later use in the project. These addresses are, respectively, the one that should hold the satoshis to pay for transaction fees, and the address that will own the runes etched or minted.
 <br>
 <br>
 **Note:** the addresses and keys shown in this example are randomly generated and purely for this example, don't try to use them.


## Example for etching a rune

```javascript
const {
  etch,
  init
} = require('bc-runes-js')

const {
  PAYMENT_ADDRESS,
  ORDINALS_ADDRESS,
  WIF
} = process.env

async function main() {
  init({
    paymentAddress: PAYMENT_ADDRESS,
    ordinalsAddress: ORDINALS_ADDRESS,
    wif: WIF,
    feePerByte: 300
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
  PAYMENT_ADDRESS,
  ORDINALS_ADDRESS,
  WIF
} = process.env

async function main() {
  init({
    paymentAddress: PAYMENT_ADDRESS,
    ordinalsAddress: ORDINALS_ADDRESS,
    wif: WIF,
    feePerByte: 300
  })

  // only one of these two arguments is mandatory
  const res = await mint({
    name: '',
    runeId: [blockNumber, txIndex]
  })

  console.log({ res })
}

main()
```

## Example for minting a rune
Not implemented yet. Will be available soon.
