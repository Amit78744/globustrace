const mysql = require("mysql");

global.db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'media_intelligence'
});

env.con.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('Database Connected');
});