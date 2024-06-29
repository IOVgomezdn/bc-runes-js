const {
  Runestone,
  Rune,
  Terms,
  Range,
  Etching,
  RuneId,
  none,
  some,
  getSpacersVal
} = require('runelib')

function transferRunestoneScript(edicts) {
  const transferstone = new Runestone(edicts, none(), none(), none())

  return transferstone.encipher()
}

function mintRunestoneScript(runeId) {
  const mintstone = new Runestone([], none(), some(new RuneId(...runeId.split(':'))), some(1))

  return mintstone.encipher()
}

function etchRunestoneScript({
  name,
  amount,
  cap,
  divisibility,
  premine,
  symbol
}) {
  const rune = Rune.fromName(name)

  const terms = new Terms(amount, cap, new Range(none(), none()), new Range(none(), none()))

  const etching = new Etching(
    (!isNaN(divisibility) && divisibility >= 0) ? some(divisibility) : none(),
    (!isNaN(premine) && premine > 0) ? some(premine) : none(),
    some(rune),
    some(getSpacersVal(name)),
    symbol ? some(symbol) : none(),
    some(terms),
    true
  )

  const runestone = new Runestone([], some(etching), none(), some(1))

  return runestone.encipher()
}

module.exports = {
  etchRunestoneScript,
  transferRunestoneScript,
  mintRunestoneScript
}