var mysql = require('mysql');

function handleDisconnect() {
  
  global.con = mysql.createPool({
    // host: "localhost",
    // user: "root",
    // password: "",
    // database: "globustracedb",
    // multipleStatements: true
    host: "sql.freedb.tech",
    user: "freedb_globustrace",
    password: "!5ke42TuTWf@Bte",
    database: "freedb_globustracedb",
    multipleStatements: true,
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
  });

  con.on('connection', function (connection) {
    console.log('DB Connection established');
  
    connection.on('error', function (err) {
      //console.error(new Date(), 'MySQL error', err);
      setTimeout(handleDisconnect, 5000);
    });
    connection.on('close', function (err) {
      console.error(new Date(), 'MySQL close', err);
    });
  
  });                                   

  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                        
    }else if(err.code === 'ECONNRESET'){
      handleDisconnect();
    }else if(err){
      handleDisconnect();
    }else {                                     
      console.log('db error', err);
    }
  });
  
  return con;
  
}

handleDisconnect();

module.exports = con;