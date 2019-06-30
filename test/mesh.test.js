const t = require('tap')
const Sneeze = require('sneeze')
const { createMesh } = require('../lib/mesh')
const { createLogger } = require('../lib/log')

const test = t.test
const log = createLogger()

test('Connect to mesh network', t => {
  t.plan(5)

  // Setup base
  const base = createBase()
  const bases = ['0.0.0.0:39999']
  base.join({ name: 'base' })

  // Add member
  const m2 = createMesh({ bases, log })

  m2.on('add', function(member) {
    t.pass()
  })

  m2.on('ready', function() {
    m2.leave()
  })

  const m1 = createMesh({ bases, log })

  m1.on('add', function(member) {
    t.pass()
  })

  m1.on('remove', function(member) {
    t.pass()

    m1.leave()
    base.leave()
  })

  m1.on('ready', function() {
    m2.join({ name: 'B' })
  })

  m1.join({ name: 'A' })
})

function createBase() {
  return Sneeze({ isbase: true, tag: null, host: '0.0.0.0' })
}
