const mysql = require('mysql');
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'system',
    database : 'sun'
});

connection.connect();
module.exports.db = connection;
