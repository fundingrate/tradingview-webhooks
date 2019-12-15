//NOTE: temp.
const assert = require('assert')
const lodash = require('lodash')
const { Position } = require('./defaults')
const Stats = require('./stats')

module.exports = (config, userid) => {

  const stats = Stats({
    id: userid,
    userid,
  })


  const getAllowance = () => {
    return stats.get('balance') * 0.1
  }

  // NOTE: assuption has been made that this was a queue... will have to be changed.
  const positions = []

  function change(a = 0, b = 0) {
    return 100 * Math.abs((a - b) / ((a + b) / 2))
  }

  const last = () => [...positions].pop()
  const list = () => [...positions]

  function getStats() {
    return { ...stats.get(), openPositions: positions.length }
  }

  function openLong(id, price, qty = getAllowance()) {
    price = parseFloat(price)

    const pos = Position({
      userid,
      id,
      type: 'LONG',
      qty,
      price,
    })

    positions.push(pos)

    stats.set('position', pos)
    stats.set('price', price)
    stats.increment('longs')
    stats.increment('totalTrades')

    console.log(pos.id, 'LONG Opened!', stats.get())

    return pos
  }

  function openShort(id, price, qty = getAllowance()) {
    price = parseFloat(price)

    const pos = Position({
      userid,
      id,
      type: 'SHORT',
      qty,
      price,
    })

    positions.push(pos)

    stats.set('position', pos)
    stats.set('price', price)
    stats.increment('shorts')
    stats.increment('totalTrades')

    console.log(pos.id, 'SHORT Opened!', stats.get())

    return pos
  }

  function close(id, price) {
    // merge trades and update closing values
    price = parseFloat(price)
    const pos = positions.pop()

    // closed trade, do not add to active positions array.
    const trade = Position({
      ...pos,
      updated: Date.now(),
      closingPrice: price,
      done: true,
    })

    // profit per trade
    trade.profit =
      trade.type === 'SHORT'
        ? trade.price - trade.closingPrice
        : trade.closingPrice - trade.price

    // update balance to reflect profit/loss
    stats.increment('balance', trade.profit)

    if (trade.profit > 0) {
      stats.increment('profitableTrades')
      stats.increment('gained', trade.profit)
    } else {
      stats.increment('losingTrades')
      stats.increment('lost', trade.profit)
    }

    stats.set('profit', stats.get('gained') + stats.get('lost'))
    trade.change = change(trade.price, trade.closingPrice)

    if (trade.type === 'SHORT')
      stats.increment('shortProfit', trade.profit)
    else
      stats.increment('longProfit', trade.profit)

    console.log(trade.id, 'Trade Closed.', trade, stats.get())

    return trade
  }

  function closeLastPosition(price) {
    const trade = last()
    assert(trade, 'no trade to close.')
    let c = close(trade.id, price, trade.qty)
    return { ...trade, ...c }
  }

  return {
    stats,
    last,
    list,
    getStats,
    openLong,
    openShort,
    close,
    closeLastPosition
  }
}
