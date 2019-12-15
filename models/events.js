const { Table } = require('rethink-table')

module.exports = async con => {
  const schema = {
    table: 'events',
    indices: ['created', 'type', 'provider', 'userid', 'timeframe'],
    compound: [
      {
        //Compound index
        name: 'provider_userid',
        fields: ['provider', 'userid'],
      },
      {
        //Compound index
        name: 'provider_timeframe_userid',
        fields: ['provider', 'timeframe', 'userid'],
      },
    ],
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
    listSorted() {
      const q = table
        .table()
        .orderBy({ index: table.r.desc('created') })
        .limit(1000)
        .coerceTo('array')
      return table.run(q)
    },
    listUserSorted(userid) {
      const query = table
        .table()
        .orderBy({ index: 'created' })
        .filter({ userid })
        .limit(1000)
        .coerceTo('array')
      return table.run(query)
    },
    listIndexSorted(index, value) {
      const query = table
        .table()
        .orderBy({ index: 'created' })
        .filter({ [index]: value })
        .limit(1000)
        .coerceTo('array')
      return table.run(query)
    },
    listGroups(index) {
      const q = table
        .table()
        .group({ index })
        .count()
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
