require('dotenv').config()
const Database = require('../models')
const Actions = require('../libs/actions')

const ByBit = require('bybit')
const highland = require('highland')
const Traders = require('../libs/trader').manager

// handle any event type in here.
function parseEvent(event, libs) {
  let price = event.ticker.last_price

  try {
    // close the previous position.
    const close = libs.trader.closeLastPosition(event.ticker.last_price)
    libs.trades.update(close.id, close)
  } catch (e) {
    // this is ok, we simply had no trade to close.
    console.log('TRADE CLOSE ERROR:', e)
  }

  switch (event.type) {
    case 'LONG': {
      const long = libs.trader.openLong(event.id, price)
      return { ...event, ...long }
    }
    case 'SHORT': {
      const short = libs.trader.openShort(event.id, price)
      return { ...event, ...short }
    }
    // case 'CLOSE': {
    //   const close = libs.trader.closeLastPosition(event.ticker.last_price)
    //   trades.update(close.id, close)
    //   return event
    // }
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
      return event
    }
  }
}

// inisialize the app and handle any new events.
async function main(config, libs) {
  const traders = Traders(config.trader, libs.trades)

  const _events = await libs.events.streamSorted()
  const _eventsLive = await libs.events.changes()
  const _tradesLive = await libs.trades.changes()

  // process the stream of historical trades
  // NOTE: this should be done before we process new trades or cached.
  highland(_events)
    .map(e => {
      const trader = traders.getOrCreate(e.userid)
      return parseEvent(e, { trader, trades: libs.trades })
    })
    .map(libs.trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  //process the realtime trades
  highland(_eventsLive)
    .map(r => r.new_val)
    .map(e => {
      const trader = traders.getOrCreate(e.userid)
      return parseEvent(e, { trader, trades: libs.trades })
    })
    .map(libs.trades.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  highland(_tradesLive)
    .map(r => r.new_val)
    .map(row => {
      return traders.get(row.userid).getStats()
    })
    .map(libs.stats.upsert)
    .map(highland)
    .errors(console.error)
    .resume()

  return traders
}

// expose the application interface.
module.exports = async config => {
  return Database(config.rethink).then(async libs => {
    libs.bybit = ByBit(config.bybit)
    libs.traders = await main(config, libs) // start subroutine
    return Actions(libs)
  })
}
