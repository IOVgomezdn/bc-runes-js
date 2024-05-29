function log(message) {
  console.log('\n', new Date(), `- ${message}`)
}

function trace(message) {
  console.trace(message)
}

module.exports = {
  log,
  trace
}