
var priceTable = 'karldiab_coinStats.ETC_Price';
var statsTable = 'karldiab_coinStats.ETC_Stats';
var password = require("./password.js");
var connection = password[0];
var ETCStatsFetcher = require("./fetchStats.js");
var DBInserter = require("./insertToDB.js");

ETCStatsFetcher.on('pricesFetched', function() {
    console.log("The Prices were fetched! They are: ");
})
