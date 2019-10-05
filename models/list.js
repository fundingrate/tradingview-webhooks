const { Table } = require('utils').Rethink
const assert = require('assert')

module.exports = name => async con => {
  assert(name, 'requires table name')
  const schema = {
    table: name,
  }

  const table = await Table(con, schema)

  table.create = props => {
    assert(props.id, 'requires id')
    props.list = props.list || []
    return table.upsert(props)
  }

  table.push = async (id, data) => {
    assert(id, 'requires id')
    assert(data, 'requires data to push')
    const item = await table.get(id)
    item.list.push(data)
    return table.upsert(item)
  }

  table.pop = async id => {
    const item = await table.get(id)
    const data = item.list.pop()
    await table.upsert(item)
    return data
  }

  table.dequeue = async id => {
    const item = await table.get(id)
    const data = item.list.shift()
    await table.upsert(item)
    return data
  }

  table.splice = async (id, ...args) => {
    const item = await table.get(id)
    const data = item.list.splice(...args)
    return table.upsert(item)
  }

  return table
}
