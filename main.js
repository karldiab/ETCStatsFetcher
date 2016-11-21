
var priceTable = 'karldiab_coinStats.ETC_Price';
var statsTable = 'karldiab_coinStats.ETC_Stats';
var password = require("./password.js");
var connection = password[0];
var ETCStatsFetcher = require("./fetchStats.js");
var DBInserter = require("./insertToDB.js");
var mysql = require('mysql');


connection.connect();

function fetchAndInsert() {
    console.log("Attempting to fetch and insert ETC data");
    var fetcher = new ETCStatsFetcher();
    fetcher.ee.on('pricesFetched', function() {
        DBInserter(connection, produceInsertString(fetcher.prices, priceTable))
    })
    fetcher.ee.on('statsFetched', function() {
        DBInserter(connection, produceInsertString(fetcher.statsObject, statsTable))
    })
    setTimeout(fetchAndInsert, 60000);
}
fetchAndInsert();

//specific function to make insert string for ETC price data
function produceInsertString(data, table) {
    var date = new Date;
    var insertString = "INSERT INTO " + table + " VALUES(" + date.getTime()/1000 + ",";
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            insertString +=  data[key] + ",";
        }
       
    }
    insertString = insertString.slice(0,-1);
    insertString += ");";
    console.log(insertString);
    return insertString;
}