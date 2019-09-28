const { Table } = require('rethink-table')

module.exports = async con => {
  const schema = {
    table: 'trades',
    indices: ['created', 'type', 'provider'],
  }

  const table = await Table(con, schema)

  return {
    ...table,
    changes() {
      const query = table.table().changes()
      return table.streamify(query)
    },
    streamSorted() {
      const query = table.table().orderBy({ index: 'created' })
      return table.streamify(query)
    },
    listClosed() {
      const q = table
        .table()
        .orderBy({ index: table.r.desc('created') })
        .filter({ done: true })
        .limit(100)
        .coerceTo('array')
      return table.run(q)
    },
    // listTopSites() {
    //   const query = table
    //     .table()
    //     .getAll('case-opened', { index: 'type' })
    //     .group('caseOpeningSite')
    //     .count()
    //     .ungroup()
    //     .orderBy(table.r.desc('reduction'))
    //     .limit(100)

    //   return table.run(query)
    // },
  }
}
