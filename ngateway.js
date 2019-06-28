const Seneca = require('seneca')
const Mesh = require('seneca-mesh')
const findIp = require('get-ip-address')

const { findBases } = require('./lib/find-bases')
const { createServer } = require('./lib/server')
const { createMesh } = require('./lib/mesh')
const { createLogger } = require('./lib/log')

const {
  CLOUD_PROVIDER,
  BASE_MESH_NAMESPACE = 'mesh',
  NGATEWAY_SERVICE_HOST = 'localhost',
  NGATEWAY_SERVICE_PORT = 5100,
  GATEWAY_REGISTRY_MESH_TAG = 'sys_gateways'
} = process.env

const IFACE_NAME = CLOUD_PROVIDER ? 'eth0' : 'lo0'

// TODO: These should not be env vars but pulled from a project config
function getProjectConfig() {
  const { PROJECT_SLUG, PROJECT_ID, PROJECT_DOMAINS } = process.env

  return {
    id: PROJECT_ID,
    slug: PROJECT_SLUG,
    domains: PROJECT_DOMAINS ? PROJECT_DOMAINS.split(',') : []
  }
}

async function boot() {
  const bases = await findBases(BASE_MESH_NAMESPACE)
  const host = CLOUD_PROVIDER ? findIp() : 'localhost'
  const log = createLogger()
  const project = getProjectConfig()

  log.info(bases, 'bases')
  log.info(host, 'host')
  log.info(GATEWAY_REGISTRY_MESH_TAG, 'mesh tag')
  /**
   * Gateway Mesh
   * ----------
   * - Joins the gateway sub mesh to broadcast its existance to edge proxy.
   * - Recieves project meta via env vars. This needs to be updated to push/pull stratergy
   * - Uses k8 service information as location so that proxy can
   */
  const gatewayRegistry = createMesh({
    tag: GATEWAY_REGISTRY_MESH_TAG,
    isBase: false,
    bases,
    host,
    log
  })

  gatewayRegistry.join({
    kind: 'gateway',
    host: `http://${NGATEWAY_SERVICE_HOST}:${NGATEWAY_SERVICE_PORT}`, //`ngateway.${PROJECT_ID}.svc.cluster.local`,
    slug: project.slug,
    domains: project.domains
  })

  /**
   * Http Listener
   * -----------
   * Http server created leveraging fastify.
   */
  //const server = createServer(/*opts*/)

  const http = require('fastify')({
    trustProxy: true
  })

  http.route({
    method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
    url: '/*',
    handler: httpFilter
  })

  /**
   * HTTP filter
   * -----------
   * - A catch all route for the http listener
   * - We do a routetable lookup on the route to get transport config
   * - We then map request to message and proxy message on to service
   * - We await for a response and reply as appropriate to the original request
   *
   */
  function httpFilter(request, reply) {
    reply.send({ hello: 'world' })
  }

  try {
    await http.listen(NGATEWAY_SERVICE_PORT)
    log.info('server listening')
  } catch (err) {
    log.error(err)
    process.exit(1)
  }
}

boot()

/**
 * Namespace Mesh Listener
 * ----------
 * - Joins the namespace mesh to listen when service join.
 * - It looks for egress meta
 * - Updates the routetable with the appropriate data
 */

/**
 * Routetable
 * ----------
 * - Stores the transport configuration for a declared egress route
 * - Uses 'find-my-way' routing module
 */

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
