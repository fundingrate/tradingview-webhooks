require('dotenv').config()
const assert = require('assert')
const { parseEnv } = require('./libs/utils')

const config = parseEnv(process.env)
assert(config.name, 'app requires a name')

const App = require(`./apps/${config.name}`)
assert(App, 'app not found')

const Web = require('actions-http')

App(config)
  .then((x={}) => {
    console.log(config.name, 'Online')
    return Web(config, x)
  })
  .catch(e => {
    console.log(e)
    process.exit(1)
  })

process.on('unhandledRejection', function(err, promise) {
  console.log(err)
  process.exit(1)
})
process.on('uncaughtException', function(err) {
  console.log(err.stack)
  process.exit(1)
})
