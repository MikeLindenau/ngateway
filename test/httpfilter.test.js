const t = require('tap')
const Fastify = require('fastify')
const Wreck = require('@hapi/wreck')
const Seneca = require('seneca')

const { createHttpFilter } = require('../lib/http-filter')
const { createLogger } = require('../lib/log')

const test = t.test

test('registers a route', async t => {
  const log = createLogger()
  const server = await createServer()
  const transport = createTransport(resolver)
  const httpFilter = createHttpFilter(server, { transport, log })

  await server.listen(3000)

  httpFilter.on({
    method: 'POST',
    path: '/',
    pattern: 'a:b'
  })

  function resolver(msg) {
    t.ok(msg)
  }

  const request = ['post', 'http://localhost:3000/']
  const res = await Wreck.request(...request)
  const out = await Wreck.read(res, { json: true })

  server.close()
})

test('resolves route and pushes message to transport', async t => {
  const log = createLogger()
  const server = await createServer()
  const transport = createTransport(resolver)
  const httpFilter = createHttpFilter(server, { transport, log })

  await server.listen(3000)

  httpFilter.on({
    method: 'POST',
    path: '/',
    pattern: 'a:b'
  })

  function resolver(msg) {
    t.ok(msg)
    return { ok: true }
  }

  const request = ['post', 'http://localhost:3000/']
  const res = await Wreck.request(...request)
  const out = await Wreck.read(res, { json: true })

  t.ok(out)
  t.same(out, { ok: true })

  server.close()
})

test('can redirect', async t => {
  const log = createLogger()
  const server = await createServer()
  const transport = createTransport(resolver)
  const httpFilter = createHttpFilter(server, { transport, log })

  await server.listen(3000)

  httpFilter.on({
    method: 'POST',
    path: '/',
    pattern: 'a:b'
  })

  function resolver(msg) {
    t.ok(msg)
    return { ok: true, redirect$: 'https://google.com' }
  }

  const request = ['post', 'http://localhost:3000/']
  const res = await Wreck.request(...request)
  const out = await Wreck.read(res, { json: true })

  t.same(res.headers.location, 'https://google.com')
  t.same(res.statusCode, '302')

  server.close()
})

test('fails on not ok', async t => {
  const log = createLogger()
  const server = await createServer()
  const transport = createTransport(resolver)
  const httpFilter = createHttpFilter(server, { transport, log })

  await server.listen(3000)

  httpFilter.on({
    method: 'POST',
    path: '/',
    pattern: 'a:b'
  })

  function resolver(msg) {
    t.ok(msg)
    return { ok: false }
  }

  const request = ['post', 'http://localhost:3000/']
  const res = await Wreck.request(...request)
  const out = await Wreck.read(res, { json: true })

  t.same(res.statusCode, '400')

  server.close()
})

test('fails with custom code', async t => {
  const log = createLogger()
  const server = await createServer()
  const transport = createTransport(resolver)
  const httpFilter = createHttpFilter(server, { transport, log })

  await server.listen(3000)

  httpFilter.on({
    method: 'POST',
    path: '/',
    pattern: 'a:b'
  })

  function resolver(msg) {
    t.ok(msg)
    return { ok: false, statusCode$: 409 }
  }

  const request = ['post', 'http://localhost:3000/']
  const res = await Wreck.request(...request)
  const out = await Wreck.read(res, { json: true })

  t.same(res.statusCode, 409)

  server.close()
})

test('fails on error', async t => {
  const log = createLogger()
  const server = await createServer()
  const transport = createTransport(resolver)
  const httpFilter = createHttpFilter(server, { transport, log })

  await server.listen(3000)

  httpFilter.on({
    method: 'POST',
    path: '/',
    pattern: 'a:b'
  })

  function resolver(msg) {
    throw Error('booom')
  }

  const request = ['post', 'http://localhost:3000/']
  const res = await Wreck.request(...request)
  const out = await Wreck.read(res, { json: true })

  t.same(res.statusCode, 500)

  server.close()
})

test('unregisters route', async t => {
  const log = createLogger()
  const server = await createServer()
  const transport = createTransport(resolver)
  const httpFilter = createHttpFilter(server, { transport, log })

  await server.listen(3000)

  httpFilter.on({
    method: 'POST',
    path: '/',
    pattern: 'a:b'
  })

  function resolver(msg) {
    return { ok: true }
  }

  const request = ['post', 'http://localhost:3000/']
  let res = await Wreck.request(...request)
  let out = await Wreck.read(res, { json: true })

  t.same(res.statusCode, 200)

  httpFilter.off({
    method: 'POST',
    path: '/'
  })

  res = await Wreck.request(...request)
  out = await Wreck.read(res, { json: true })

  t.same(res.statusCode, 404)

  server.close()
})

function createServer() {
  return Fastify({ trustProxy: true })
}

function createTransport(resolver) {
  return {
    post: function post(msg) {
      return Promise.resolve(resolver(msg))
    }
  }
}
