const Seneca = require('seneca')
const Mesh = require('seneca-mesh')
const Promisify = require('seneca-promisify')

const {
  SNEEZE_SILENT = false,
  SWIM_INTERVAL = 500,
  SWIM_JOIN_TIMEOUT = 2000,
  SWIM_PING_TIMEOUT = 2000,
  SWIM_PING_REQUEST_TIMEOUT = 2000
} = process.env

/**
 * We are using seneca for its transport layer for now so
 * we do not have to write a full one. We do intend to replace
 * this with one that will still be seneca compatible but more
 * performant.
 */
async function createTransport(opts) {
  const senecaOpts = {
    tag: `gateway`,
    legacy: {
      error: false,
      transport: false
    }
  }

  const meshOpts = {
    bases: opts.bases,
    isbase: opts.isBase || false,
    host: opts.host || '0.0.0.0',
    tag: opts.tag,
    sneeze: {
      silent: SNEEZE_SILENT,
      swim: {
        interval: SWIM_INTERVAL,
        joinTimeout: SWIM_JOIN_TIMEOUT,
        pingTimeout: SWIM_PING_TIMEOUT,
        pingReqTimeout: SWIM_PING_REQUEST_TIMEOUT
      }
    }
  }

  const seneca = Seneca(senecaOpts)

  seneca.use(Promisify)
  seneca.use(Mesh, meshOpts)

  await seneca.ready()

  return seneca
}

module.exports = { createTransport }
