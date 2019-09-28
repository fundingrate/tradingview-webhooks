require('dotenv').config()
const Database = require('../models')
const Actions = require('../libs/actions')
const ByBit = require('bybit')

module.exports = async config => {
  return Database(config.rethink)
    .then(async libs => {
      libs.bybit = ByBit(config.bybit)
      return Actions(libs)
    })
}
