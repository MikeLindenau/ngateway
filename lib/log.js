'use strict'

const Pino = require('pino')

const PRETTY_LOGS = process.env.PRETTY_LOGS
const ENV = process.env.NODE_ENV

const defaults = {
  name: 'nproxy',
  prettyPrint: PRETTY_LOGS || ENV !== 'production'
}

function createLogger(opts) {
  opts = Object.assign(defaults, opts)
  return Pino(opts)
}

module.exports = { createLogger }
