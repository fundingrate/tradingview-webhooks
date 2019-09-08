//NOTE: temp.
const assert = require('assert')

module.exports = config => {
  // contracts will be negative if in a short.
  // contracts should be 0 when no position is open.

  const stats = {
    longs: 0, // count of longs
    shorts: 0, // count of shorts
    startingBalance: 10000,
    balance: 10000, // current wallet balance
    price: 0,
    position: null
  }

  const positions = new Map()

  positions.last = () => {
    const keys = [...positions.keys()]
    const k = keys[positions.size - 1]

    return {
      id: k,
      ...positions.get(k),
    }
  }

  function getDifference(price) {
    const last = positions.last()
    assert(last, 'requires last position')
    const balance = last.price - price

    return {
      last,
      price,
      balance,
    }
  }

  function change(a = 0, b = 0) {
    return 100 * Math.abs((a - b) / ((a + b) / 2))
  }

  return {
    getStats() {
      return { ...stats }
    },
    keys: positions.keys,
    last: positions.last,
    openLong(id, price, qty = 10) {
      price = parseFloat(price)

      stats.longs += 1
      stats.balance -= qty
      stats.price = price
      stats.position = 'LONG'

      positions.set(id, {
        done: false,
        type: 'LONG',
        created: Date.now(),
        updated: null,
        qty,
        price,
      })

      return positions.get(id)
    },
    openShort(id, price, qty = 10) {
      price = parseFloat(price)

      stats.shorts += 1
      stats.balance -= qty
      stats.price = price
      stats.position = 'SHORT'

      positions.set(id, {
        done: false,
        type: 'SHORT',
        created: Date.now(),
        updated: null,
        qty,
        price,
      })

      return positions.get(id)
    },
    close(id, price, qty = 10) {
      price = parseFloat(price)

      const pos = positions.get(id)

      const trade = {
        ...pos,
        updated: Date.now(),
        qty,
        closingPrice: price,
        done: true,
      }

      trade.profit =
        trade.type === 'SHORT'
          ? trade.price - trade.closingPrice
          : trade.closingPrice - trade.price

      if(trade.profit > 0) {
        stats.balance += trade.profit
      }

      trade.change = change(trade.price, trade.closingPrice)
      
      positions.set(id, trade)
      return positions.get(id)
    },
  }
}
