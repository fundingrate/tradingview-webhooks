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
  tokens,
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
    async changeMyUsername({ username, token }) {
      assert(token, 'token required')
      const { valid, userid, type } = await tokens.get(token)

      assert(username, 'username required')
      username = username.toLowerCase()
      const has = await users.getBy('username', username)
      assert(!has, 'Another user already claimed this username.')

      return users.update(userid, {
        username,
      })
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
    async listMyProviderStats({ token }) {
      assert(token, 'token required')
      const { valid, userid, type } = await tokens.get(token)
      assert(valid, 'token is no longer valid')
      const list = await users.getBy('userid', userid)
      return list.reduce((memo, r) => {
        try {
          const stats = traders.get(r.id).getStats()
          memo.push(stats)
          return memo
        } catch(e) {
          return memo
        }
      }, [])
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
      assert(token, 'token required')
      const { userid } = await tokens.get(token)
      return tokens.listUserSorted(userid)
    },
    async listProviders() {
      return users.getBy('type', 'provider')
    },
    async listMyProviders({ token }) {
      assert(token, 'token required')
      const { userid } = await tokens.get(token)

      return users.getBy('userid_type', [userid, 'provider'])
    },
    async createProvider({
      username,
      token,
      description = 'User Generated Provider Key.',
    }) {
      assert(username, 'username required')
      assert(token, 'token required')
      const { userid } = await tokens.get(token)

      const provider = await users.create(username, 'provider', {
        description,
        userid,
        // eventProps
      })

      // create an api token for the provider.
      let providerToken = await tokens.generate('user', 'provider')
      providerToken = await tokens.validate(providerToken.id, provider.id)

      return { provider, token: providerToken }
    },
    // async disableProvider({ userid, token }) {
    //   assert(userid, 'userid required')
    //   assert(token, 'token required')
    //   const { userid } = await tokens.get(token)

    //   return providers.update(userid, {
    //     done: true,
    //   })
    // },
    async createSubscription({ providerid, token }) {
      assert(providerid, 'providerid required')
      assert(token, 'token required')
      const { userid } = await tokens.get(token)

      const { type } = await users.get(providerid)
      assert(type === 'provider', 'You may only subscribe to provider accounts.')

      const subbed = await subscriptions.isSubscribed(userid, providerid)
      assert(!subbed, 'You have already subscribed to this provider.')

      return subscriptions.create(userid, providerid)
    },
    async listMySubscriptions({ token }) {
      assert(token, 'token required')
      const { userid } = await tokens.get(token)
      return subscriptions.getBy('userid', userid)
    },
    async isSubscribed({ providerid, token }) {
      assert(token, 'token required')
      const { userid } = await tokens.get(token)
      return subscriptions.isSubscribed(userid, providerid)
    },
    async cancelSubscription({ subscriptionid, token }) {
      assert(subscriptionid, 'subscriptionid required')
      assert(token, 'token required')

      // get the subscription to ensure ownership.
      const { userid } = await tokens.get(token)
      const sub = await subscriptions.get(userid)
      assert(sub.userid === userid, 'You do not own this subscription.')

      return subscriptions.update(subscriptionid, {
        done: true,
      })
    },
    async transferSubscription({ subscriptionid, token, recipientid }) {
      assert(subscriptionid, 'subscriptionid required')
      assert(token, 'token required')
      assert(recipientid, 'recipientid required')

      // ensure the recipient exists.
      const user = await users.get(recipientid)
      console.log('sending subscription', subscriptionid, 'to', user.id)

      // get the subscription to ensure ownership.
      const { userid } = await tokens.get(token)
      const sub = await subscriptions.get(userid)
      assert(sub.userid === userid, 'You do not own this subscription.')

      return subscriptions.update(subscriptionid, {
        userid: user.id,
      })
    },
  }
}
