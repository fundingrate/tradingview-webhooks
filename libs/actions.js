const highland = require('highland')
const lodash = require('lodash')
const assert = require('assert')

module.exports = ({events, trades, bybit, trader}) => {
  return {
    async echo(payload){
      return payload
    },
    async ping() {
      return 'ok'
    },
    async consumeEvent(params) {
      const ticker = await bybit.getTicker()
      
      return events.upsert({
        created: Date.now(),
        ticker,
        ...params
      })
    },
    async listTrades() {
      return trades.list()
    },
    async getStats() {
      return trader.getStats()
    }
  }
}
