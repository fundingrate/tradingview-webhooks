const { Table } = require('rethink-table')
const uuid = require('uuid/v4')
const assert = require('assert')

module.exports = async con => {
  const schema = {
    table: 'users',
    indices: ['created', 'type', 'username', 'userid'],
    compound: [
      {
        //Compound index
        name: 'userid_type',
        fields: ['userid', 'type'],
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
        .limit(100)
        .coerceTo('array')
      return table.run(q)
    },
    async create(username, type, meta = {}) {
      assert(username, 'username required')
      username = username.toLowerCase()
      const u = await table.hasBy('username', username)
      assert(!u, 'User already exists with that username')
      return table.upsert({
        ...meta,
        username,
        type,
        id: uuid(),
        created: Date.now(),
        updated: Date.now(),
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
