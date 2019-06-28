const t = require('tap')
const Sneeze = require('sneeze')
const { createMesh } = require('../lib/mesh')

const test = t.test

test('listens to add and leave events for gateways', t => {
  t.plan(5)

  const base = createBase()
  base.join({ name: 'base' })

  const gatewayB = createMesh({
    isBase: false,
    bases: ['0.0.0.0:39999']
  })

  gatewayB.on('add', function(member) {
    t.pass()
  })

  gatewayB.on('ready', function() {
    gatewayB.leave()
  })

  const gatewayA = createMesh({
    isBase: false,
    bases: ['0.0.0.0:39999']
  })

  gatewayA.on('add', function(member) {
    t.pass()
  })

  gatewayA.on('remove', function(member) {
    t.pass()

    gatewayA.leave()
    base.leave()
  })

  gatewayA.on('ready', function() {
    gatewayB.join({ name: 'B' })
  })

  gatewayA.join({ name: 'A' })
})

function createBase() {
  return Sneeze({ isbase: true, tag: null, host: '0.0.0.0' })
}

function createNode() {
  return Sneeze({ isbase: false, host: '0.0.0.0' })
}
