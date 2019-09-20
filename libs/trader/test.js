require('dotenv').config()
const test = require('tape')
const { parseEnv } = require('../utils')
const config = parseEnv(process.env)
const API = require('./index')

const position = {
  id: null,
  price: 0,
  qty: 0
}

test('init class', t => {
  let api
  t.test('init', t => {
    api = API()
    t.ok(api)
    t.end()
  })
  t.test('Open Long', async t => {
    let long = api.openLong('long', 10000)
    long = api.get('long')
    t.ok(long)
    t.end()
  })
  t.test('Get Stats', async t => {
    const stats = api.getStats()
    console.log(stats)
    t.ok(stats)
    t.end()
  })
  t.test('Close Long', async t => {
    const close = api.close('long', 10040)
    console.log(close)
    t.ok(close)
    t.end()
  })
  t.test('Get Stats', async t => {
    const stats = api.getStats()
    console.log(stats)
    t.ok(stats)
    t.end()
  })
})
