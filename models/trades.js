const { Table } = require('rethink-table')

module.exports = async con => {
  const schema = {
    table: 'trades',
    indices: ['created', 'type', 'provider', 'userid'],
    compound: [
      {
        //Compound index
        name: 'created_userid',
        fields: ['created', 'userid'],
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
    listUserSorted(userid, sort ='desc') {
      const query = table
        .table()
        .orderBy({ index: table.r[sort]('created') })
        .filter({ userid })
        .limit(1000)
        .coerceTo('array')
      return table.run(query)
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
