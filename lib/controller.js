function createController(filter) {
  // Still coupled to http filter
  function addService(srv, annotations) {
    let ingressAnnotation = annotations.ingress

    if (!ingressAnnotation) return

    if (typeof ingressAnnotation === 'string') {
      ingressAnnotation = [ingressAnnotation]
    }

    ingressAnnotation.forEach(annotation => {
      if (filter.find(annotation)) return
      filter.on(annotation)
    })
  }

  return {
    addService
  }
}

module.exports = { createController }
