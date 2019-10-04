const highland = require('highland')
const lodash = require('lodash')
const assert = require('assert')

module.exports = ({ 
  events, 
  trades, 
  bybit, 
  stats, 
  subscriptions, 
  traders, 
  users, 
  tokens 
}) => {
  return {
    async echo(payload) {
      return payload
    },
    async ping() {
      return 'ok'
    },
    async me({ token }) {
      assert(token, 'token required')
      token = await tokens.get(token)
      const user = await users.get(token.userid)
      return user
    },
    async getTicker() {
      return bybit.getTicker()
    },
    async registerUsername({ username }) {
      const user = await users.create(username)
      let token = await tokens.generate('tradebot', 'user')
      token = await tokens.validate(token.id, user.id)
      return { user, token }
    },
    async listUsers() {
      return users.listSorted()
    },
    async listTraders() {
      return traders.keys()
    },
    async consumeEvent({ token, ...params }) {
      assert(token, 'token required')

      const { valid, userid, type } = await tokens.get(token)
      assert(valid, 'Your token has expired or is invalid.')
      // assert(type === 'user', 'Your token has expired or is invalid.')

      const ticker = await bybit.getTicker()

      return events.upsert({
        userid,
        ticker,
        created: Date.now(),
        ...params,
      })
    },
    async listMyTrades({ token }) {
      assert(token, 'token required')
      const { valid, userid, type } = await tokens.get(token)
      assert(valid, 'token is no longer valid')
      return trades.listUserSorted(userid)
    },
    async listMyEvents({ token }) {
      assert(token, 'token required')
      const { valid, userid, type } = await tokens.get(token)
      assert(valid, 'token is no longer valid')
      return events.listUserSorted(userid)
    },
    async getMyStats({ token }) {
      assert(token, 'token required')
      const { valid, userid, type } = await tokens.get(token)
      assert(valid, 'token is no longer valid')
      const trader = traders.get(userid)
      assert(trader, 'trader not found, you have no events recorded.')
      return trader.getStats()
    },
    async listMyTokens({ token }) {
      const { userid } = await tokens.get(token)
      return tokens.listUserSorted(userid)
    },
    async listEventProviders() {
      return events.listGroups('provider')
    },
    async listUserEventProviders() {
      return events.listGroups('provider_userid')
    },
    async createSubscription({ providerid, token }) {
      assert(providerid, 'providerid required')
      assert(token, 'token required')
      const { userid } = await tokens.get(token)
      return subscriptions.create(providerid, userid)
    },
    async listMySubscriptions({token}){
      assert(token, 'token required')
      const { userid } = await tokens.get(token)
      return subscriptions.getBy('userid', userid)
    }
  }
}
