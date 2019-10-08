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
    openPositions: 0,
    profitableTrades: 0,
    losingTrades: 0,
    lost: 0,
    gained: 0,
    shortProfit: 0,
    longProfit: 0,
    profit: 0,
    ...p,
  }
}
