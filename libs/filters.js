// module.exports = function(r) {
//   console.log(r.id, r.provider, r.ticker.last_price)
//   let price = r.ticker.last_price

//   // const trader = getOrCreateTrader(config.trader, r.userid)
//   const trader = getOrCreateTrader(config.trader, r.userid)

//   function handlePreviousPosition(price) {
//     const trade = trader.last()
//     let close = null
//     if (trade) {
//       close = trader.close(trade.id, price, trade.qty)
//     }
//     return { ...trade, ...close }
//   }

//   // close the previous position.
//   const close = handlePreviousPosition(r.ticker.last_price)
//   if (close.id) trades.update(close.id, close)

//   // NOTE: r.provider needs to be handled later.
//   // A dashboard should be developed to manage these interactions.
//   // maybe create editor to allow this code to be dynamically ran in sanboxed threads?
//   // serverless?

//   switch (r.type) {
//     case 'LONG': {
//       const long = trader.openLong(r.id, price)
//       return { ...r, ...long }
//     }
//     case 'SHORT': {
//       const short = trader.openShort(r.id, price)
//       return { ...r, ...short }
//     }
//     // case 'MARKET_TREND': {
//     //   // const stats = trader.updateMarketCondition(r.marketCondition)
//     //   // return { ...r, ...trend }
//     // }
//     // case 'MOMENTUM_WAVE': {
//     //   // const stats = trader.updateMarketMomentum(r.momentum)
//     //   // return { ...r, ...trend }
//     // }
//     default: {
//       console.log('Invalid type:', r.type, r.id)
//       return r
//     }
//   }
// }
