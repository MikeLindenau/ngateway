const Events = require('events')
const inherits = require('util').inherits
const Sneeze = require('sneeze')
const Nid = require('nid')

const {
  SNEEZE_SILENT = true,
  SWIM_INTERVAL = 500,
  SWIM_JOIN_TIMEOUT = 2000,
  SWIM_PING_TIMEOUT = 2000,
  SWIM_PING_REQUEST_TIMEOUT = 2000
} = process.env

/**
 * Project Mesh Listener
 * ----------
 * - Joins the project mesh to listen when service join.
 * - It looks for egress meta
 * - Updates the routetable with the appropriate data
 */
function Mesh(opts) {
  Events.EventEmitter.call(this)

  const sneeze = Sneeze({
    bases: opts.bases,
    isbase: opts.isBase || false,
    tag: 'seneca~' + opts.tag,
    host: opts.host || '0.0.0.0',
    silent: SNEEZE_SILENT,
    swim: {
      interval: SWIM_INTERVAL,
      joinTimeout: SWIM_JOIN_TIMEOUT,
      pingTimeout: SWIM_PING_TIMEOUT,
      pingReqTimeout: SWIM_PING_REQUEST_TIMEOUT
    }
  })

  sneeze.on('ready', () => {
    opts.log.debug('mesh ready')
    this.emit('ready')
  })

  sneeze.on('add', (info, member) => {
    opts.log.debug(info, 'member joined')
    this.emit('add', member, member.meta.config)
  })

  sneeze.on('remove', (info, member) => {
    opts.log.debug(info, 'member left')
    this.emit('remove', member, member.meta.config)
  })

  this.join = function(meta) {
    opts.log.debug('joining mesh')
    sneeze.join(meta)
  }

  this.leave = function() {
    opts.log.debug('leaving mesh')
    sneeze.leave()
  }
}

inherits(Mesh, Events.EventEmitter)

function createMesh(opts) {
  return new Mesh(opts)
}

module.exports = { createMesh }
