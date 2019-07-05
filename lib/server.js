const Fastify = require('fastify')
const Cors = require('fastify-cors')

function createServer() {
  const fastify = Fastify({ trustProxy: true })

  fastify.register(Cors)

  return fastify
}

module.exports = { createServer }
