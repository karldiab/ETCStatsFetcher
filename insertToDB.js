var mysql = require('mysql');
var insertToDB = function(pool, insertText) {
    pool.getConnection(function(err, connection) {
        if(err) { 
        console.log(err); 
        return; 
        }
        connection.query(insertText, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                return;
            }
            console.log("Successfully inserted row to DB");
        });
    });
}
module.exports = insertToDB;