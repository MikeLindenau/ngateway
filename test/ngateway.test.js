const t = require('tap')
const Seneca = require('seneca')
const Wreck = require('@hapi/wreck')
const proxyquire = require('proxyquire')

const startGateway = proxyquire('../ngateway', {
  './lib/project': {
    fetchProjectConfig: function() {
      return new Promise((resolve, reject) => {
        process.nextTick(function() {
          resolve({
            id: 'woet8gu4',
            slug: 'test',
            domains: []
          })
        })
      })
    }
  },
  './lib/find-bases': {
    findBases: async function() {
      return ['127.0.0.1:39999']
    }
  }
})

const test = t.test

test('Happy proxy', async t => {
  t.plan(2)
  const base = await createBase()
  const service = await createService()

  await startGateway()
  await pauseForMesh()

  const request = ['post', 'http://127.0.0.1:5100/']
  const res = await Wreck.request(...request)
  const out = await Wreck.read(res, { json: true })

  t.ok(out)
  t.same(out, { hello: 'world' })
})

async function createBase() {
  let base = Seneca({
    legacy: {
      error: false,
      transport: false
    }
  })
    .use('promisify')
    .use('mesh', {
      isbase: true,
      sneeze: {
        tag: null
      }
    })

  base = await base.ready()

  return base
}

async function createService() {
  let service = Seneca({
    legacy: {
      error: false,
      transport: false
    }
  })
    .use('promisify')
    .message('a:b', async function() {
      return { hello: 'world' }
    })
    .use('mesh', {
      isbase: false,
      host: '127.0.0.1',
      bases: ['127.0.0.1:39999'],
      sneeze: {
        tag: 'woet8gu4'
      },
      listen: [
        {
          pins: ['a:b'],
          ingress: [
            {
              method: 'POST',
              path: '/',
              pattern: 'a:b'
            }
          ]
        }
      ]
    })

  service = await service.ready()
  return service
}

function pauseForMesh() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 2000)
  })
}
