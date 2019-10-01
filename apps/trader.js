require('dotenv').config()
const Database = require('../models')
const Actions = require('../libs/actions')
const Web = require('actions-http')

const ByBit = require('bybit')
const utils = require('../libs/utils')
const Trader = require('../libs/trader/trader')
const highland = require('highland')

const assert = require('assert')

async function main(config, { bybit, stats, trades, events, tickers }) {

  const traders = {}
  
  function set(id, trader) {
    assert(id, 'id required')
    assert(trader, 'trader required')
    traders[id] = trader
    return traders[id]
  }

  function get(id) {
    assert(id, 'id required')
    assert(traders[id], 'trader does not exist')
    return traders[id]
  }

  function has(id) {
    assert(id, 'id required')
    return traders[id] ? true : false
  }
  
  function parseEvent(r) {
    console.log(r.id)
    let trader = null

    if(!has(r.userid)) {
      trader = Trader(config.trader, r.userid)
      set(r.userid, trader)
    } else {
      trader = get(r.userid)
    }
    let price = r.ticker.last_price

    function handlePreviousPosition(price) {
      const trade = trader.last()
      let close = null
      if (trade) {
        close = trader.close(trade.id, price, trade.qty)
      }
      return { ...trade, ...close }
    }  

    // close the previous position.
    const close = handlePreviousPosition(r.ticker.last_price)
    if (close.id) trades.update(close.id, close)

    // NOTE: r.provider needs to be handled later.
    // A dashboard should be developed to manage these interactions.
    //TODO: just filter the stream of events...
    switch (r.type) {
      case 'LONG': {
        const long = trader.openLong(r.id, price)
        return { ...r, ...long }
      }
      case 'SHORT': {
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

  const _events = await events.streamSorted()
  const _eventsLive = await events.changes()

  //process the stream of trades
  highland(_events)
    .filter(r => r.timeframe === '5m')
    .filter(r => r.provider === 'Market Liberator A')
    .map(parseEvent)
    .map(trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  //process the realtime trades
  highland(_eventsLive)
    .map(r => r.new_val)
    .filter(r => r.timeframe === '5m')
    .filter(r => r.provider === 'Market Liberator A')
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

  // utils.loop(() => {
  //   const row = trader.getStats()
  //   stats.upsert({
  //     ...row,
  //     created: Date.now(),
  //     type: 'hourly',
  //   })
  // }, 5 * utils.ONE_MINUTE_MS)

  return {
    has,
    set,
    get,
    list: () => Object.values(traders),
    keys: () => Object.keys(traders)
  }
}

module.exports = async config => {
  return Database(config.rethink).then(async libs => {
    libs.bybit = ByBit(config.bybit)
    libs.traders = await main(config, libs) // start subroutine
    return Actions(libs)
  })
}
