function createController(filter) {
  // Still coupled to http filter
  function addService(srv, annotations) {
    const ingressAnnotation = annotations.ingress

    if (!ingressAnnotation) return

    const existingRoute = filter.find(ingressAnnotation)

    if (filter.find(ingressAnnotation)) return

    filter.on(ingressAnnotation)
  }

  return {
    addService
  }
}

module.exports = createController
