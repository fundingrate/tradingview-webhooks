const Trader = require('./trader')
const assert = require('assert')

module.exports = (config, trades) => {
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

  return {
    has,
    set,
    get,
    getOrCreate: userid => getOrCreateTrader(config, userid),
    list: () => Object.values(traders),
    keys: () => Object.keys(traders)
  }
}