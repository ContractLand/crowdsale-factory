require('babel-register');
require('babel-polyfill');

const Web3 = require("web3");
const web3 = new Web3();
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = process.env["MNEMONIC"]

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
      gasPrice: 0,
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/KetwbGBGwNagOnjgPUkN")
      },
      gas: 4600000,
      gasPrice: web3.toWei("20", "gwei"),
      network_id: 3
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/KetwbGBGwNagOnjgPUkN")
      },
      gas: 4600000,
      gasPrice: web3.toWei("20", "gwei"),
      network_id: 4
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/KetwbGBGwNagOnjgPUkN")
      },
      gas: 4600000,
      gasPrice: web3.toWei("20", "gwei"),
      network_id: 1
    },
  },
};
