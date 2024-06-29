const { get } = require('./http.js')
const { runeByNameURL, runesByAddressURL, runeByIdURL } = require('../config.js')


async function getRuneIdByName(name) {
  const { data: { detail : runes } } = await get(runeByNameURL(name))
  const foundRune = runes.find(({ rune, spacedRune }) => rune === name.toUpperCase() || spacedRune === name.toUpperCase())

  return foundRune ? foundRune.runeid : undefined
}

async function getRuneNameById(runeId) {
  const { data: { spacedRune } } = await get(runeByIdURL(runeId))
  return spacedRune
}

async function getRunesByAddress(address) {
  const { data: { detail: runes } } = await get(runesByAddressURL(address))

  return runes
}

module.exports = {
  getRuneIdByName,
  getRuneNameById,
  getRunesByAddress
}