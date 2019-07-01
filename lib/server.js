const Server = require('fastify')

function createServer() {
  return Server({ trustProxy: true })
}

module.exports = { createServer }
