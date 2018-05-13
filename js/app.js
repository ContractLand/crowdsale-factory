
var app = new Vue({
  el: '#app',
  data: {
    web3Provider: null,
    account: '',
    contracts: {},
    currentCrowdsaleIndex: '',
    crowdsaleData: {
      name: '',
      symbol: '',
      openingTime: '',
      closingTime: '',
      ratePerEther: 0,
      etherRaised: 0,
      etherCap: 0,
      progressPercentage: 0,
      balanceInEther: 0,
      purchaseInEther: 0,
    },
  },
  created: function () {
    this.init()
  },
  methods: {
    init: async function () {
      this.getCurrentCrowdsaleIndex()
      await this.initWeb3()
      this.initAccount()
      await this.initContract()
      await this.getContractInfo()
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
      const CrowdsaleFactory = TruffleContract(CrowdsaleFactoryArtifact);
      CrowdsaleFactory.setProvider(this.web3Provider);
      this.contracts.CrowdsaleFactoryInstance = await CrowdsaleFactory.deployed()

      const currentCrowdsaleAddress = await this.contracts.CrowdsaleFactoryInstance.getCrowdsaleAtIndex(this.currentCrowdsaleIndex)
      console.log(currentCrowdsaleAddress)

      const SimpleCrowdsaleArtifact = await $.getJSON('contracts/SimpleCrowdsale.json')
      const SimpleCrowdsale = TruffleContract(SimpleCrowdsaleArtifact);
      SimpleCrowdsale.setProvider(this.web3Provider);
      this.contracts.SimpleCrowdsaleInstance = await SimpleCrowdsale.at(currentCrowdsaleAddress)

      const CrowdsaleTokenArtifact = await $.getJSON('contracts/CrowdsaleToken.json')
      const CrowdsaleToken = TruffleContract(CrowdsaleTokenArtifact);
      CrowdsaleToken.setProvider(this.web3Provider);
      const currentTokenAddress = await this.contracts.SimpleCrowdsaleInstance.token()
      this.contracts.CrowdsaleTokenInstance = await CrowdsaleToken.at(currentTokenAddress);
    },

    getCurrentCrowdsaleIndex: function () {
      const searchParams = new URLSearchParams(window.location.search)
      this.currentCrowdsaleIndex = searchParams.get('crowdsale')
    },

    getContractInfo: async function () {
      console.log('Getting contract info...');

      try {
        this.crowdsaleData.name = await this.contracts.CrowdsaleTokenInstance.name();
        this.crowdsaleData.symbol = await this.contracts.CrowdsaleTokenInstance.symbol();
        this.crowdsaleData.openingTime = await this.contracts.SimpleCrowdsaleInstance.openingTime();
        this.crowdsaleData.closingTime = await this.contracts.SimpleCrowdsaleInstance.closingTime();
        this.crowdsaleData.ratePerEther = Number(await this.contracts.SimpleCrowdsaleInstance.rate());
        const weiRaised = await this.contracts.SimpleCrowdsaleInstance.weiRaised();
        this.crowdsaleData.etherRaised = Number(web3.fromWei(weiRaised, 'ether'));
        const weiCap = await this.contracts.SimpleCrowdsaleInstance.cap();
        this.crowdsaleData.etherCap = Number(web3.fromWei(weiCap, 'ether'));
        this.crowdsaleData.progressPercentage = Number(this.crowdsaleData.etherRaised/this.crowdsaleData.etherCap * 100)
        const balanceInWei = await this.contracts.CrowdsaleTokenInstance.balanceOf(this.account);
        this.crowdsaleData.balanceInEther = Number(web3.fromWei(balanceInWei, 'ether'));
      } catch (e) {
        console.log(e);
      }

      web3.eth.getBlock('latest', (e, result) => {
        console.log('current block time is: ', result.timestamp)
        console.log('opening blockchain time is: ', this.crowdsaleData.openingTime.toNumber())
      })
    },

    handlePurchase: async function (event) {
      const ethAmount = this.crowdsaleData.purchaseInEther
      const weiAmount = web3.toWei(ethAmount, 'ether')

      try {
        const tx = await this.contracts.SimpleCrowdsaleInstance.sendTransaction({ from: this.account, value: weiAmount })
        console.log('Purcahse made: ' + JSON.stringify(tx))
      } catch (e) {
        console.log(e)
      }

      return this.getContractInfo()
    },

    getFormattedDateTime: function (unixTimeInSeconds) {
      return moment.unix(unixTimeInSeconds).format('MMMM Do YYYY, h:mm:ss a');
    }
  }
})
