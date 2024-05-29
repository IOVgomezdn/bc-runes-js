const axios = require('axios')
const { log } = require('../utils/logger.js')
const { sleep } = require('../utils/sleep.js')

const RETRY_INTERVAL = 5000
const REQUEST_RETRIES = 20

async function get(url, retries = 0) {
  try {
    const { data } = await axios.get(url)

    return data
  } catch (e) {
    log(e.message)

    if (retries < REQUEST_RETRIES) {
      log(`Retryig in ${RETRY_INTERVAL / 1000} seconds`)
      await sleep(REQUEST_RETRIES)
      await get(url, retries +1)
    } else {
      throw new Error(e)
    }
  }
}

async function post(url, payload, retries = 0) {
  try {
    const { data } = await axios.post(
      url,
      payload,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    )
  
    return data
  } catch (e) {
    log(e.message)

    if (retries < REQUEST_RETRIES) {
      log(`Retryig in ${RETRY_INTERVAL / 1000} seconds`)
      await sleep(REQUEST_RETRIES)
      await get(url, retries +1)
    } else {
      throw new Error(e)
    }
  }
}

module.exports = {
  get,
  post
}