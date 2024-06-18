function log(message, noDate = false) {
  if (noDate) {
    console.log(message)
  } else {
    console.log('\n', new Date(), `- ${message}`)
  }
}

module.exports = {
  log
}