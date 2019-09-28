require('dotenv').config()
const Database = require('../models')
const Actions = require('../libs/actions')
const Web = require('actions-http')

const ByBit = require('bybit')
const utils = require('../libs/utils')
const Trader = require('../libs/trader/trader')
const highland = require('highland')

async function main({ bybit, tickers }) {
  

  // save the price every 5 minutes
  utils.loop(async () => {
    const ticker = await bybit.getTicker()
    tickers.upsert({
      ...ticker,
      created: Date.now(),
      id: ticker.symbol,
    })
  }, 5 * utils.ONE_MINUTE_MS)
}

module.exports = async config => {
  return Database(config.rethink).then(async libs => {
    libs.bybit = ByBit(config.bybit)
    libs.trader = Trader(config.trader)
    main(libs) // start subroutine
    return Actions(libs)
  })
}
