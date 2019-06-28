const K8s = require('@kubernetes/client-node')

function getPods(namespace, options = {}) {
  const { label, limit = 3 } = options

  const kc = new K8s.KubeConfig()

  kc.loadFromDefault()

  const k8s = kc.makeApiClient(K8s.CoreV1Api)

  return k8s
    .listNamespacedPod(
      namespace,
      false,
      false,
      undefined,
      undefined,
      label,
      limit
    )
    .then(pods => pods.body.items)
}

async function findBases(namespace, options = {}) {
  const { label = 'component=base' } = options
  const { portName = 'mesh' } = options

  const pods = await getPods(namespace, Object.assign({ label }, options))

  return pods
    .map(s => ({
      host: s.status.podIP,
      port: s.spec.containers
        .map(c => c.ports.find(p => p.name === portName))
        .find(c => c)
    }))
    .filter(s => s.host && s.port)
    .map(s => `${s.host}:${s.port.containerPort}`)
}

module.exports = { findBases }
