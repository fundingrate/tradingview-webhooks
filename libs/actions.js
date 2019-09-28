const highland = require('highland')
const lodash = require('lodash')
const assert = require('assert')

module.exports = ({ events, trades, bybit, stats, trader }) => {
  return {
    async echo(payload) {
      return payload
    },
    async ping() {
      return 'ok'
    },
    async getTicker() {
      return bybit.getTicker()
    },
    async consumeEvent(params) {
      const ticker = await bybit.getTicker()

      return events.upsert({
        created: Date.now(),
        ticker,
        ...params,
      })
    },
    async listTrades() {
      return trades.list()
    },
    async listClosedTrades() {
      return trades.listClosed()
    },
    async listStats(params) {
      return stats.list(params)
    },
    async getStats(params) {
      return trader.getStats()
    }
  }
}
