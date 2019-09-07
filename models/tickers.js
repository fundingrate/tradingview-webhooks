const { Table } = require('rethink-table')

module.exports = async con => {
  const schema = {
    table: 'tickers',
    indices: ['created', 'type'],
  }

  const table = await Table(con, schema)

  return {
    ...table,
    changes() {
      const query = table.table().changes()
      return table.streamify(query)
    },
    streamSorted() {
      const query = table.table().orderBy({index: 'created'})
      return table.streamify(query)
    },
  }
}
