const Seneca = require('seneca')
const Server = require('fastify')
const Mesh = require('seneca-mesh')
const findIp = require('get-ip-address')

const { findBases } = require('./lib/find-bases')
const { fetchProjectConfig } = require('./lib/project')
const { createServer } = require('./lib/server')
const { createHttpFilter } = require('./lib/http-filter')
const { createMesh } = require('./lib/mesh')
const { createLogger } = require('./lib/log')

const {
  CLOUD_PROVIDER,
  BASE_MESH_NAMESPACE = 'mesh',
  NGATEWAY_SERVICE_HOST = 'localhost',
  NGATEWAY_SERVICE_PORT = 5100
} = process.env

async function boot() {
  const bases = await findBases(BASE_MESH_NAMESPACE)
  const host = CLOUD_PROVIDER ? findIp() : 'localhost'
  const log = createLogger()
  const project = await fetchProjectConfig()

  log.debug(bases, 'bases')
  log.debug(host, 'host')

  const meshOpts = { tag: project.id, bases, host, log }
  const mesh = createMesh(meshOpts)
  const transport = createTransport(meshOpts)

  const server = Server({ trustProxy: true })
  const httpFilter = createHttpFilter(server, { transport })

  mesh.join({
    kind: 'gateway',
    project: project.id,
    serviceHost: `${NGATEWAY_SERVICE_HOST}:${NGATEWAY_SERVICE_PORT}`,
    slug: project.slug,
    domains: project.domains
  })

  mesh.on('add', httpFilter.add)
  mesh.on('remove', httpFilter.remove)

  await server.listen(NGATEWAY_SERVICE_PORT).catch(err => {
    log.error(err, 'gateway_failed')
    process.exit(1)
  })

  log.info(`Gateway for project ${project.id} listening`)
}

/**
 * Limitations
 * ---------
 * - Can only add routes
 * - leverages seneca as transport
 *
 *
 * Open Questions
 * ---------
 * - How to handle multiple instances registering the same route.
 *
 */

boot()
