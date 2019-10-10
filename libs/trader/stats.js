const { Stats } = require('./defaults')
const assert = require('assert')

// TODO: write tests for this.

module.exports = (props = {}) => {
  let stats = Stats(props)

  const has = k => {
    assert(k, 'k required')
    return Boolean(stats[k])
  }

  const get = k => {
    if (!k) return stats

    console.log('stats', k, stats[k])
    // assert(has(k), `${k} does not exist`)

    return stats[k]
  }

  const set = (k, v) => {
    assert(k, 'k required')
    assert(v, 'v required')

    stats[k] = v
    stats.updated = Date.now()

    return get()
  }

  return {
    get,
    set,
    has,
    increment(k, v = 1) {
      let s = get(k)
      set(k, (s += v))
      set('updated', Date.now())
      return get()
    },
    decrement(k, v = 1) {
      let s = get(k)
      set(k, (s -= v))
      set('updated', Date.now())
      return get()
    },
  }
}
