exports.Position = p => {
  return {
    // id: uuid(),
    done: false,
    created: Date.now(),
    updated: null,
    ...p,
    // type: 'SHORT',
    // qty,
    // price,
  }
}

exports.Stats = p => {
  const startingBalance = 10000
  return {
    longs: 0, // count of longs
    shorts: 0, // count of shorts
    totalTrades: 0,
    startingBalance,
    balance: startingBalance,
    price: null,
    position: null,
    // marketCondition: null,
    // momentum: null,
    count: 0,
    profitableTrades: 0,
    ...p,
  }
}
