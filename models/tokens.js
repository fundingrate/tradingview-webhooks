const { Table } = require('rethink-table')
const uuid = require('uuid/v4')
const assert = require('assert')
const { ONE_DAY_MS } = require('../libs/utils')

module.exports = async con => {
  const schema = {
    table: 'tokens',
    indices: ['created', 'type', 'provider', 'userid'],
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
    generate(provider, type) {
      return table.upsert({
        provider,
        type,
        valid: false,
        id: uuid(),
        expires: ONE_DAY_MS,
        created: Date.now(),
        updated: null,
      })
    },
    validate(id, userid) {
      assert(id, 'requires id')
      return table.update(id, {
        valid: true,
        updated: Date.now(),
        userid,
        expires: ONE_DAY_MS,
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
