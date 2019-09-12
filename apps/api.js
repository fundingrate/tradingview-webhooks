require('dotenv').config()
const Database = require('../models')
const Actions = require('../libs/actions')
const Web = require('actions-http')

const ByBit = require('bybit')
const utils = require('../libs/utils')
const Trader = require('../libs/trader/trader')
const highland = require('highland')

async function main({ stats, trades, events, trader }) {

  function handlePreviousPosition(price) {
    const trade = trader.last()
    let close = null
    if (trade) {
      close = trader.close(trade.id, price, trade.qty)
      trader.delete(trade.id) // delete closed positions from memory.
    }
    return { ...trade, ...close }
  }

  function parseEvent(r) {
    let price = r.ticker.last_price

    // close the previous position.
    const close = handlePreviousPosition(r.ticker.last_price)
    if (close.id) trades.update(close.id, close)

    // NOTE: r.provider needs to be handled later.
    // A dashboard should be developed to manage these interactions.
    switch (r.type) {
      case 'SHORT': {
        const long = trader.openLong(r.id, price)
        return { ...r, ...long }
      }
      case 'LONG': {
        const short = trader.openShort(r.id, price)
        return { ...r, ...short }
      }
      case 'MARKET_TREND': {
        const stats = trader.updateMarketCondition(r.marketCondition)
        // return { ...r, ...trend }
      }
      case 'MOMENTUM_WAVE': {
        const stats = trader.updateMarketMomentum(r.momentum)
        // return { ...r, ...trend }
      }
      default: {
        console.log('Invalid type.')
        return r
      }
    }
  }

  const _events = await events.streamSorted()
  highland(_events)
    .map(parseEvent)
    .map(trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  const _eventsLive = await events.changes()
  highland(_eventsLive)
    .map(r => r.new_val)
    .map(parseEvent)
    .map(trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  // const _trades = trades.changes()
  // highland(_trades)
  //   .map(r => r.new_val)
  //   .filter(r => r.done)
  //   .map(r => {
  //     // do somthing ...
  //   })
  //   .errors(console.error)
  //   .resume()

  utils.loop(() => {
    const row = trader.getStats()
    stats.upsert({
      ...row,
      created: Date.now(),
      type: 'daily',
    })
  }, utils.ONE_DAY_MS)

  utils.loop(() => {
    const row = trader.getStats()
    stats.upsert({
      ...row,
      created: Date.now(),
      type: 'hourly',
    })
  }, utils.ONE_HOUR_MS)
}

module.exports = async config => {
  return Database(config.rethink)
    .then(async libs => {
      libs.bybit = ByBit(config.bybit)
      libs.trader = Trader(config.trader)
      main(libs) // start subroutine
      return Actions(libs)
    })
    .then(async actions => {
      return Web(config, actions)
    })
}
