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
    listSorted() {
      const q = table
        .table()
        .orderBy({ index: table.r.desc('created') })
        .limit(100)
        .coerceTo('array')
      return table.run(q)
    },
    listUserSorted(userid) {
      const query = table
        .table()
        .orderBy({ index: 'created' })
        .filter({ userid })
        .limit(100)
        .coerceTo('array')
      return table.run(query)
    },
  }
}
