const { get } = require('./http.js')
const { getTipURL } = require('../config.js')

async function getTip() {
  const tipBlock = await get(getTipURL)

  return { tipBlock }
}

module.exports = {
  getTip
}