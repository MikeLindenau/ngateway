const FindMyWay = require('find-my-way')
const Jsonic = require('jsonic')
const _ = require('lodash')

function createHttpFilter(server, opts) {
  const router = FindMyWay({ defaultRoute })
  const transport = opts.transport
  const log = opts.log

  server.route({
    method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
    url: '/*',
    handler: httpHandler(router, transport)
  })

  function on(config) {
    router.on(config.method, config.path, handleRequest, {
      pattern: config.pattern,
      log: log
    })
  }

  function off(config) {
    router.off(config.method, config.path)
  }

  function find(config) {
    return router.find(config.method, config.path)
  }

  return {
    on,
    off,
    find,
    routes: router.routes
  }
}

function defaultRoute(req, res) {
  this.reply.code(404).send()
}

function httpHandler(router, transport) {
  return async function(request, reply) {
    router.lookup(request.req, reply.res, { request, reply, transport })
  }
}

async function handleRequest(req, res, params, store) {
  const log = store.log
  const request = this.request
  const reply = this.reply
  const transport = this.transport
  const requestId = request.id

  // Remove wildcard param
  delete request.params['*']

  let out
  let statusCode = 200

  try {
    out = await transport.post(buildMessage(request, store.pattern))
  } catch (error) {
    log.error(error, 'gateway_transport_failed')
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred'
    })
  }

  if (!out) {
    return reply.send()
  }

  if (out && out.ok === false) {
    statusCode = out.statusCode$ || 400
  }

  if (out.redirect$) {
    reply.redirect(out.redirect$)
  } else {
    reply.code(statusCode).send(out)
  }
}

function buildMessage(request, pattern) {
  return Object.assign(
    {},
    request.params,
    request.query,
    request.body,
    Jsonic(pattern),
    { params$: request.params },
    { query$: request.query },
    {
      ingress$: {
        id: request.id,
        headers: request.headers,
        ip: request.ip,
        ips: request.ips,
        hostname: request.hostname
      }
    }
  )
}

module.exports = { createHttpFilter }
