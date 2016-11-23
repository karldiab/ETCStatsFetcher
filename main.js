
var priceTable = 'karldiab_coinStats.ETC_Price';
var statsTable = 'karldiab_coinStats.ETC_Stats';
var password = require("./password.js");
var pool = password[0];
var ETCStatsFetcher = require("./fetchStats.js");
var DBInserter = require("./insertToDB.js");
var mysql = require('mysql');
var startTime = new Date();



function fetchAndInsert() {
    console.log("Attempting to fetch and insert ETC data");
    /*connection.end(function(err) { 
        // The connection is terminated now 
    });*/
    /*connection.connect(function(err) { 
        if (err) { 
            console.error('error connecting: ' + err.stack);
        }
    })*/
    var fetcher = new ETCStatsFetcher();
    fetcher.ee.on('pricesFetched', function() {
        DBInserter(pool, produceInsertString(fetcher.prices, priceTable))
    })
    fetcher.ee.on('statsFetched', function() {
        DBInserter(pool, produceInsertString(fetcher.statsObject, statsTable))
    })
    setTimeout(fetchAndInsert, 300000);
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