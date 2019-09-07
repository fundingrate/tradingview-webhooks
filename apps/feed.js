require('dotenv').config()
const Database = require('../models')
const BitMEXClient = require('bitmex-realtime-api')

module.exports = config => {
  return Database(config.rethink).then(async ({ events }) => {
    const client = new BitMEXClient({
      maxTableLen: 1000,
    })

    client.on('error', console.error)
    client.on('open', () => console.log('Connection opened.'))
    client.on('close', () => console.log('Connection closed.'))
    client.on('initialize', () =>
      console.log('Client initialized, data is flowing.')
    )

    // client.addStream('XBTUSD', 'instrument', function(data, symbol, tableName) {
    //   console.log(`Got update for ${tableName}:${symbol}. Current state:\n${JSON.stringify(data).slice(0, 100)}...`);
    //   // Do something with the table data...
    // });

    // client.on('initialize', () => {
    //   console.log('online')
    //   // console.log(client.streams);  // Log .public, .private and .all stream names
    // })

    // client.addStream('XBTUSD', 'trade', trades => {
    //   trades.map(events.upsert)
    // })

    // client.addStream('XBTUSD', 'instrument', trades => {
    //   trades.map(console.log)
    // })
  })
}
