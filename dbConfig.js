// This code sets up a connection to a MySQL database using the mysql module.
// It creates a connection object with the specified host, user, password, and database name.
// The connection is established using the connect method, and a message is logged to the console upon successful connection.
var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'webclass2db'
});

conn.connect(function(err) {
  if (err) throw err;
  console.log("Sucessuly Connected to the database!");
}); 
module.exports = conn;
