const highland = require('highland')
const lodash = require('lodash')
const assert = require('assert')

module.exports = ({ events, trades, bybit, stats, trader, users, tokens }) => {
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
    async listUsers() {
      return users.list()
    },
    async generateToken() {
      return tokens.generate('tradebot', 'user')
    },
    // async generateEventToken({token}) {
    //   assert(token, 'token required')
    //   const userToken = await tokens.get(token)
    //   const eventToken = tokens.generate('tradebot', 'event')
    //   return tokens.validate(eventToken, userToken.userid)
    // },
    async registerUsername({ username }) {
      const user = await users.create(username)
      let token = await tokens.generate('tradebot', 'user')
      token = await tokens.validate(token.id, user.id)
      return { user, token }
    },
    async consumeEvent({ token }) {
      assert(token, 'token required')

      const { valid, userid } = await tokens.get(token)
      assert(valid, 'Your token has expired or is invalid.')

      const ticker = await bybit.getTicker()

      return events.upsert({
        userid,
        ticker,
        created: Date.now(),
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
    async getStats() {
      return trader.getStats()
    },
    async listMyTokens({ token }) {
      const { userid } = await tokens.get(token)
      return tokens.getBy('userid', userid)
    },
    async me({ token }) {
      assert(token, 'token required')
      token = await tokens.get(token)
      const user = await users.get(token.userid)
      return user
    },
  }
}
