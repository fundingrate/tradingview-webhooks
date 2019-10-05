const { Init } = require('rethink-table')

module.exports = config => {
  return Init.advanced(config, [
    require('./events'),
    require('./tickers'),
    require('./trades'),
    require('./stats'),
    require('./tokens'),
    require('./users'),
    require('./subscriptions')
  ])
}
