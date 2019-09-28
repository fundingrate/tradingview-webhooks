require('dotenv').config()
const Database = require('../models')
const Actions = require('../libs/actions')
const Web = require('actions-http')

const ByBit = require('bybit')
const utils = require('../libs/utils')
const Trader = require('../libs/trader/trader')
const highland = require('highland')

async function main({ bybit, stats, trades, events, trader, tickers }) {
  function handlePreviousPosition(price) {
    const trade = trader.last()
    let close = null
    if (trade) {
      close = trader.close(trade.id, price, trade.qty)
    }
    return { ...trade, ...close }
  }

  function parseEvent(r) {
    let price = r.ticker.last_price

    console.log(r.id)

    // close the previous position.
    const close = handlePreviousPosition(r.ticker.last_price)
    if (close.id) trades.update(close.id, close)

    // NOTE: r.provider needs to be handled later.
    // A dashboard should be developed to manage these interactions.
    //TODO: just filter the stream of events...
    switch (r.type) {
      case 'SHORT': {
        const long = trader.openLong(r.id, price)
        return { ...r, ...long }
      }
      case 'LONG': {
        const short = trader.openShort(r.id, price)
        return { ...r, ...short }
      }
      // case 'MARKET_TREND': {
      //   // const stats = trader.updateMarketCondition(r.marketCondition)
      //   // return { ...r, ...trend }
      // }
      // case 'MOMENTUM_WAVE': {
      //   // const stats = trader.updateMarketMomentum(r.momentum)
      //   // return { ...r, ...trend }
      // }
      default: {
        console.log('Invalid type:', r.type, r.id)
        return r
      }
    }
  }
  //process the stream of trades
  const _events = await events.streamSorted()
  highland(_events)
    .map(parseEvent)
    .map(trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  //process the realtime trades
  const _eventsLive = await events.changes()
  highland(_eventsLive)
    .map(r => r.new_val)
    .map(parseEvent)
    .map(trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()


  // processors

  // utils.loop(() => {
  //   const row = trader.getStats()
  //   stats.upsert({
  //     ...row,
  //     created: Date.now(),
  //     type: 'daily',
  //   })
  // }, utils.ONE_DAY_MS)

  // utils.loop(() => {
  //   const row = trader.getStats()
  //   stats.upsert({
  //     ...row,
  //     created: Date.now(),
  //     type: 'hourly',
  //   })
  // }, utils.ONE_HOUR_MS)

  // let times = 0
  // utils.loop(() => {
  //   const row = trader.getStats()
  //   console.log(++times, row)
  // }, 1000)
}

module.exports = async config => {
  return Database(config.rethink).then(async libs => {
    libs.bybit = ByBit(config.bybit)
    libs.trader = Trader(config.trader)
    main(libs) // start subroutine
    return Actions(libs)
  })
}
