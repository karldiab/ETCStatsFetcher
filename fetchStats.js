var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var ETCStatsFetcher = function() {
    events.EventEmitter.call(this);
    this.currentBlockNo;
    this.currentDiff;
    this.blockTime;
    this.diffChange;
    this.diffChangeFactor = 185142; //number of blocks in a month assuming 14s blocktime
    this.blockTimeFactor = 200;
    this.currentBlock;
    this.blockTimeBlock;
    this.diffChangeBlock;
    this.prices = {};
    this.pricesToFetch = ["USD", "RUB", "CNY", "EUR", "CAD", "HKD", "GBP", "JPY", "AUD", "VND"]; //excludes BTC
    this.BTCPriceInfo;
    this.BTCETCPrice;
    this.fetchBlocks();
    this.fetchPrice();
}

ETCStatsFetcher.prototype.fetchBlocks = function() {
    this.currentBlock = null;
    this.blockTimeBlock = null;
    this.diffChangeBlock = null;
    var self = this;
    request('https://etcchain.com/gethProxy/eth_blockNumber', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        self.currentBlockNo = (parseInt(body.substring(1, body.length-1)));
        //console.log('https://etcchain.com/gethProxy/eth_getBlockByNumber?number=' + self.currentBlockNo);
        request('https://etcchain.com/gethProxy/eth_getBlockByNumber?number=' + self.currentBlockNo, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.currentBlock = JSON.parse(body);
            self.currentDiff = (parseInt(self.currentBlock.difficulty,16)); 
            //console.log("Got currentDiff, it is " + self.currentDiff);
            self.calculateBlockTime();
            self.calculateDiffChange();
        }
        })
        request('https://etcchain.com/gethProxy/eth_getBlockByNumber?number=' + (self.currentBlockNo - self.blockTimeFactor), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.blockTimeBlock = JSON.parse(body);
            //console.log("Got blocktimeBlock");
            self.calculateBlockTime();
        }
        })
        request('https://etcchain.com/gethProxy/eth_getBlockByNumber?number=' + (self.currentBlockNo - self.diffChangeFactor), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log("Got diffChangeBlock");
            self.diffChangeBlock = JSON.parse(body);
            self.calculateDiffChange();
        }
        })
    }
    })
}
ETCStatsFetcher.prototype.calculateBlockTime = function() {
    if (this.currentBlock !== null && this.blockTimeBlock !== null) {
        this.blockTime = (parseInt(this.currentBlock.timestamp) - parseInt(this.blockTimeBlock.timestamp))/this.blockTimeFactor;
        this.emit('statsFetched');
        //console.log("blocktime = " + this.blockTime);
    }
}
ETCStatsFetcher.prototype.calculateDiffChange = function() {
    if (this.currentBlock !== null && this.diffChangeBlock !== null) {
        this.diffChange = (parseInt(this.currentBlock.difficulty) - parseInt(this.diffChangeBlock.difficulty))/this.diffChangeFactor;
        //console.log("diffChange = " + this.diffChange);
    }
}
ETCStatsFetcher.prototype.fetchPrice = function() {
    this.BTCPriceInfo = null;
    var self = this;
    //fetch BTC rates from coinbase
    request('https://api.coinbase.com/v2/exchange-rates', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.BTCPriceInfo = JSON.parse(body);
            self.calculatePrice();
        }
    })
    //fetch ETC to BTC rates from Poloniex
    request('https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETC&depth=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.BTCETCPrice = JSON.parse(body);
            self.calculatePrice();
        }
    })
}
//puts ETC prices into prices JSON
ETCStatsFetcher.prototype.calculatePrice = function() {
    if (this.BTCPriceInfo !== null && this.BTCETCPrice !== null) {
        this.prices.BTC = (parseFloat(this.BTCETCPrice.asks[0][0]) + parseFloat(this.BTCETCPrice.bids[0][0]))/2;
        //console.log("BTC PRICE: " + this.prices.BTC);
        for (var currency in this.pricesToFetch) {
            //console.log(this.pricesToFetch[currency]);
            var currentCurrency = this.pricesToFetch[currency];
            this.prices[currentCurrency] = (this.prices.BTC/this.BTCPriceInfo.data.rates.BTC)*this.BTCPriceInfo.data.rates[currentCurrency];
            /*console.log("this.prices.BTC = " + this.prices.BTC);
            console.log("this.BTCPriceInfo.data.rates.USD = " + this.BTCPriceInfo.data.rates.USD);
            console.log("this.BTCPriceInfo.data.rates[currentCurrency] = " + this.BTCPriceInfo.data.rates[currentCurrency]);
            console.log(this.prices[currentCurrency]);*/
        }
        //console.log(this.prices);
        this.emit('pricesFetched');
    }
}

module.exports = { blockObject : new ETCStatsFetcher()};
