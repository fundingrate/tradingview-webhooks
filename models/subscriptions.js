const { Table } = require('rethink-table')
const uuid = require('uuid/v4')
const assert = require('assert')
const { ONE_DAY_MS } = require('../libs/utils')

module.exports = async con => {
  const schema = {
    table: 'subscriptions',
    indices: ['created', 'type', 'userid'],
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
    listGroups(index) {
      const q = table
        .table()
        .group({ index })
        .count()
      return table.run(q)
    },
    create(providerid, userid) {
      assert(providerid, 'providerid required')
      assert(userid, 'userid required')
      
      return table.upsert({
        id: uuid(),
        providerid,
        userid,
        // expires: 7 * ONE_DAY_MS,
        created: Date.now(),
        updated: null,
      })
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
