const { PROJECT_SLUG, PROJECT_ID, PROJECT_DOMAINS } = process.env

/**
 *
 * FIXME: These should not be env vars but pulled from a
 * project config or setup properly via a custom gateway
 * resource.
 */
function fetchProjectConfig() {
  return new Promise((resolve, reject) => {
    process.nextTick(function() {
      resolve({
        id: PROJECT_ID,
        slug: PROJECT_SLUG,
        domains: PROJECT_DOMAINS ? PROJECT_DOMAINS.split(',') : []
      })
    })
  })
}

module.exports = { fetchProjectConfig }
