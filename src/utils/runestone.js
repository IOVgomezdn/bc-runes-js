const {
  Runestone,
  Rune,
  Terms,
  Range,
  Etching,
  none,
  some,
  getSpacersVal
} = require('runelib')

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
  etchRunestoneScript
}