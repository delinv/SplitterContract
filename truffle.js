module.exports = {
  networks: {
    development: { // This one is optional and reduces the scope for failing fast
      host: "localhost",
      gas: 3000000,
      port: 8545,
      network_id: "*" // Match any network id
    },
    "net42": {
      host: "localhost",
      gas: 3000000,
      port: 8545,
      network_id: 42
    },
    "ropsten": {
      host: "localhost",
      gas: 3000000,
      port: 8545,
      network_id: 3
    }
  }
};