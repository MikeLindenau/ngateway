const dns = require('dns')

function dnsLookup(hostname) {
  const opts = {
    all: true,
    family: 4
  }
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, opts, (err, addresses) => {
      let bases = []

      if (err) {
        throw new Error('dns lookup for base node failed')
      }

      if (Array.isArray(addresses)) {
        bases = addresses.map(address => {
          return `${address.address}:39999`
        })
      } else {
        bases.push(addresses)
      }

      resolve(bases)
    })
  })
}

module.exports = { dnsLookup }
