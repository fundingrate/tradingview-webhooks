const { Table } = require('rethink-table')

module.exports = async con => {
  const schema = {
    table: 'providers',
    indices: ['created', 'type', 'userid', 'name'],
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
    create(name, userid, meta ={}) {
      assert(name, 'name required')
      assert(userid, 'userid required')
      
      return table.upsert({
        done: false,
        verified: false,
        id: uuid(),
        name,
        userid,
        expires: null,
        created: Date.now(),
        updated: null,
        ...meta
      })
    },
    listGroups(index) {
      const q = table
        .table()
        .group({ index })
        .count()
      return table.run(q)
    },
    listDone(done=false) {
      return table.getBy('done', done)
    }
  }
}
