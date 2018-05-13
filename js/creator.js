var creator = new Vue({
  el: '#creator',
  data: {
    web3Provider: null,
    account: '',
    contracts: {},
    crowdsale: {
      name: '',
      symbol: '',
      openingTime: '',
      closingTime: '',
      rate: '',
      goal: '',
      cap: '',
      wallet: '',
    },
  },
  created: function () {
    this.init()
  },
  methods: {
    init: async function () {
      await this.initWeb3()
      this.initAccount()
      await this.initContract()
    },

    initWeb3: async function () {
      // Initialize web3 and set the provider to the testRPC.
      if (typeof web3 !== 'undefined') {
        this.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // set the provider you want from Web3.providers
        this.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
        web3 = new Web3(this.web3Provider);
      }
    },

    initAccount: function () {
      web3.eth.getAccounts((err, accounts) => {
        this.account = accounts[0];
      })
    },

    initContract: async function () {
      const CrowdsaleFactoryArtifact = await $.getJSON('contracts/CrowdsaleFactory.json')
      const CrowdsaleFactory = TruffleContract(CrowdsaleFactoryArtifact)
      CrowdsaleFactory.setProvider(this.web3Provider)
      this.contracts.CrowdsaleFactoryInstance = await CrowdsaleFactory.deployed()
    },

    handleCreate: async function () {
      const BigNumber = web3.BigNumber;

      try {
        const payment = await this.contracts.CrowdsaleFactoryInstance.cost()
        console.log('cost of creation is: ', web3.fromWei(payment, 'ether').toNumber())

        const tx = await this.contracts.CrowdsaleFactoryInstance.createCrowdsale(this.crowdsale.name,
                                                                                 this.crowdsale.symbol,
                                                                                 this.convertDateStringToUnixTime(this.crowdsale.openingTime),
                                                                                 this.convertDateStringToUnixTime(this.crowdsale.closingTime),
                                                                                 new BigNumber(this.crowdsale.rate),
                                                                                 new BigNumber(web3.toWei(this.crowdsale.goal, 'ether')),
                                                                                 new BigNumber(web3.toWei(this.crowdsale.cap, 'ether')),
                                                                                 this.crowdsale.wallet,
                                                                                 { from: this.account, value: payment })
        console.log('Crowdsale Created: ' + JSON.stringify(tx))
      } catch (e) {
        console.log(e)
      }
    },

    convertDateStringToUnixTime: function (dateString) {
      return Date.parse(dateString)/1000
    },
  }
})
