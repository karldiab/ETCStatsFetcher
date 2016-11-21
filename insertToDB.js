var mysql = require('mysql');
var insertToDB = function(connection, insertText) {
    connection.query(insertText, function(err, result) {
        if (err) {
            console.log("Got this error: " + err + " Trying one more time.");
            connection.query(insertText, function(err, result) {
                if (err) {
                    console.log("Got this error: " + err + " Giving up")
                } else {
                    console.log("Successfully inserted row to DB after 1 failed try");
                }
            });
        } else {
            console.log("Successfully inserted row to DB");
        }

    });
    //connection.end();
}
module.exports = insertToDB;