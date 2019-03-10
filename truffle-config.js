require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");

new HDWalletProvider(process.env.MNEMONIC,
'https://ropsten.infura.io/${process.env.INFURA_API_KEY}'
)
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC,
        'https://ropsten.infura.io/${process.env.INFURA_API_KEY}'
        )
      },
      gasPrice: 25000000000,
      from: "0xd5eA2DCAa1F6F5645dcAF7C1E72Cd6eE51801fD4".toLowerCase(),
      network_id: 3
    }
  }
};
