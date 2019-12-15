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

  function getOrCreateTrader(config, id) {
    let trader = null

    if (!has(id)) {
      trader = Trader(config, id)
      set(id, trader)
    } else {
      trader = get(id)
    }

    return trader
  }

  function parseEvent(r) {
    let price = r.ticker.last_price
    const trader = getOrCreateTrader(config.trader, r.userid)

    function handlePreviousPosition(price) {
      const trade = trader.last()
      let close = null
      if (trade) {
        close = trader.close(trade.id, price, trade.qty)
      }
      return { ...trade, ...close, updated: r.created }
    }

    // close the previous position.
    const close = handlePreviousPosition(r.ticker.last_price)
    if (close.id) trades.update(close.id, close)

    // NOTE: r.provider needs to be handled later.
    // A dashboard should be developed to manage these interactions.
    // maybe create editor to allow this code to be dynamically ran in sanboxed threads?
    // serverless?

    switch (r.type) {
      case 'LONG': {
        const long = trader.openLong(r.id, price)
        return { ...r, ...long, created: r.created }
      }
      case 'SHORT': {
        const short = trader.openShort(r.id, price)
        return { ...r, ...short, created: r.created }
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
        // console.log('Invalid type:', r.type, r.id)
        return r
      }
    }
  }

  const _events = await events.streamSorted()
  const _eventsLive = await events.changes()
  const _tradesLive = await trades.changes()

  //process the stream of trades
  highland(_events)
    .map(parseEvent)
    .map(trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  //process the realtime trades
  highland(_eventsLive)
    .map(r => r.new_val)
    .map(parseEvent)
    .map(trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  highland(_tradesLive)
    .map(r => r.new_val)
    .map(row => {
      return get(row.userid).getStats()
    })
    .map(stats.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  return {
    has,
    set,
    get,
    getOrCreate(userid) {
      return getOrCreateTrader(config.trader, userid)
    },
    list: () => Object.values(traders),
    keys: () => Object.keys(traders),
    async processFilter(filter) {
      assert(typeof filter === 'function', 'requires filter function')
      const _events = await events.streamSorted()

      return highland(_events)
        .filter(filter)
        .map(parseEvent)
        .map(trades.upsert)
        .map(highland)
        .toPromise(Promise)
    },
  }
}

module.exports = async config => {
  return Database(config.rethink).then(async libs => {
    libs.bybit = ByBit(config.bybit)
    libs.traders = await main(config, libs) // start subroutine
    return Actions(libs)
  })
}
