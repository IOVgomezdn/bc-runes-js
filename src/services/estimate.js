const { get, post } = require('./http.js')
const { estimateURL } = require('../config.js')

async function estimate(blocks) {
  const estimatePerBlocksAmount = await get(estimateURL)

  return Math.round(estimatePerBlocksAmount[blocks])
}

module.exports = {
  estimate
}