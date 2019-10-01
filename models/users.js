const { Table } = require('rethink-table')
const uuid = require('uuid/v4')
const assert = require('assert')

module.exports = async con => {
  const schema = {
    table: 'users',
    indices: ['created', 'type', 'username'],
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
    async create(username) {
      assert(username, 'username required')
      username = username.toLowerCase()
      const u = await table.hasBy('username', username)
      assert(!u, 'User already exists with that username')
      return table.upsert({
        username,
        id: uuid(),
        created: Date.now(),
        updated: Date.now()
      })
    }
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
