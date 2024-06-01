const { get } = require('./http.js')
const { searchRunesURL } = require('../config.js')

async function getRuneIdByName(name) {
  const { data: { detail : runes } } = await get(searchRunesURL(name))
  const foundRune = runes.find(r => r.rune === name.toUpperCase())

  return foundRune ? foundRune.runeid.split(':').map(str => Number(str)) : undefined
}

module.exports = {
  getRuneIdByName
}