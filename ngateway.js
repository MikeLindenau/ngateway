const Seneca = require('seneca')
const Server = require('fastify')
const Mesh = require('seneca-mesh')
const findIp = require('get-ip-address')

const { dnsLookup } = require('./lib/dnsLookup')
const { fetchProjectConfig } = require('./lib/project')
const { createController } = require('./lib/controller')
const { createTransport } = require('./lib/transport')
const { createServer } = require('./lib/server')
const { createHttpFilter } = require('./lib/http-filter')
const { createMesh } = require('./lib/mesh')
const { createLogger } = require('./lib/log')

const {
  NGATEWAY_SERVICE_HOST = 'localhost',
  NGATEWAY_SERVICE_PORT = 5100
} = process.env

async function boot() {
  const bases = await dnsLookup('core-base.seneca-mesh.svc.cluster.local')
  const host = findIp()
  const log = createLogger()
  const project = await fetchProjectConfig()

  log.debug(bases, 'bases')
  log.debug(host, 'host')

  const meshOpts = { tag: project.id, bases, host, log }
  const mesh = createMesh(meshOpts)
  const transport = await createTransport(meshOpts)

  const server = createServer()
  const httpFilter = createHttpFilter(server, { transport, log })
  const controller = createController(httpFilter)

  mesh.join({
    kind: 'gateway',
    project: project.id,
    serviceHost: `${NGATEWAY_SERVICE_HOST}:${NGATEWAY_SERVICE_PORT}`,
    slug: project.slug,
    domains: project.domains
  })

  mesh.on('add', controller.addService)

  await server.listen(NGATEWAY_SERVICE_PORT).catch(err => {
    log.error(err, 'gateway_failed')
    process.exit(1)
  })

  log.info(`Gateway for project ${project.id} listening`)
}

if (require.main === module) {
  boot()
} else {
  module.exports = boot
}
