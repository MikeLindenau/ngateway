const Events = require('events')
const inherits = require('util').inherits
const Sneeze = require('sneeze')
const Nid = require('nid')

function Mesh(opts) {
  Events.EventEmitter.call(this)

  const sneeze = Sneeze({
    bases: opts.bases,
    isbase: opts.isBase || false,
    tag: opts.tag,
    host: opts.host || '0.0.0.0'
  })

  sneeze.on('ready', () => {
    this.emit('ready')
  })

  sneeze.on('add', (info, member) => {
    this.emit('add', member)
  })

  sneeze.on('remove', (info, member) => {
    this.emit('remove', member)
  })

  this.join = function(meta) {
    opts.log.info('joining mesh')
    sneeze.join(meta)
  }

  this.leave = function() {
    sneeze.leave()
  }
}

inherits(Mesh, Events.EventEmitter)

function createMesh(opts) {
  return new Mesh(opts)
}

module.exports = { createMesh }
