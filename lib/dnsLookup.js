const dns = require("dns");

function dnsLookup(hostname) {
    dns.lookup(
      hostname,
      {
        all: true,
        family: 4
      },
      (err, addresses) => {
        let bases = [];

        if (err) {
          throw new Error("dns lookup for base node failed");
        }

        if (Array.isArray(addresses)) {
          bases = addresses.map(address => {
            return `${address.address}:39999`;
          });
        } else {
          bases.push(addresses);
        }

        return bases;
      }
    );
}

module.exports = { dnsLookup }