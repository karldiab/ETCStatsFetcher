var mysql = require('mysql');
var insertToDB = function(table, connection, insertText) {
    connection.connect();
    connection.query(insertText, function(err, result) {
        if (err) {
            console.log("Could not insert to DB. Trying one more time.");
            connection.query(insertText, function(err, result) {
                if (err) {
                    console.log("Failed to insert row to DB twice. Giving up.")
                }
                console.log("Successfully inserted row to DB after 1 failed try");
            });
        }
        console.log("Successfully inserted row to DB");
    });
    connection.end();
}

module.exports = { insertToDB : insertToDB };