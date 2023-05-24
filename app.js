const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require("path");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const useragent = require('express-useragent');
var con = require('./constants.js');
const { prefix } = require('./config/prefix');
var mymiddleware = require('./middleware/authMiddleware');
var dotenv = require("dotenv");
const cors = require('cors');
var routes = require("./routes/routes");
var adminRoutes = require("./routes/admin/adminRoutes");
const { checkPermission } = require('./functions/roles');
const { Server } = require('socket.io');
const net = require('net');
var env = require('./constants');
const e = require('express');

const app = express();

var server = require('http').createServer(app);

const io = new Server(server, {
  // Socket.IO options
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  credentials: true
});

dotenv.config({
  path: './.env'
})

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(fileUpload({useTempFiles : true, tempFileDir : '/tmp/'}));
app.use(useragent.express());
global.__basedir = __dirname;
global.prefix = prefix;
global.userAccess = "";
global.checkPermission = checkPermission;
global.clients = {};

// register the session with it's secret ID
app.use(session({cookieName : 'session' ,secret: 'globustrace' , saveUninitialized: true , resave:true},{
  cookie: { maxAge: null }
}));

const oneDay = 1000 * 60 * 60 * 24;

app.use(function(req, res, next) {
  res.locals.session = req.session;
  res.locals.message = req.session.message;
  res.locals.roles = req.session.roles;
  delete req.session.message

  res.header('Access-Control-Allow-Origin: *');
  res.header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS, post, get');
  res.header("Access-Control-Max-Age", "3600");
  res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Accept, Authorization');
  res.header("Access-Control-Allow-Credentials", "true");

  next()
});

app.use(cors({
  origin: '*'
}));

app.use(routes);
app.use(adminRoutes);



io.on('connection', socket => {
  console.log(`connect ${socket.id}`);

  socket.emit("ready", "world");

  global.socket = socket;

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    console.log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', function(reason) {
    console.log(`Peer or server disconnected. Reason: ${reason}.`);
    socket.broadcast.emit('bye');
  });

  socket.on('bye', function(room) {
    console.log(`Peer said bye on room ${room}.`);
  });
});


server.listen(6000, function() {
  console.log('Server is live on port ' + 6000);
});


//////////////TCP Server//////////

const socket = net.createServer(onClientConnection);

//Start listening on given port and host.
socket.listen(7000,function(){
   console.log(`Tcp server started on port 7000`); 
});

//the client handling callback
function onClientConnection(sock){
  //Log when a client connnects.
  console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`);
  
  global.socket = sock;

  //Handle the client data.
  sock.on('data',function(data){
      //Log data received from the client

      var date = new Date();
      let todayTime = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

      console.log(`Data received from client on ${todayTime} : ${data} `);
      "*GIPL,NR,864710056127433,A,291222,112703,14,28.592562,77.333763,31,0$"
      //var data = "*GIPL,NR,869630056362050,A,28.592388,77.333710,241122,110804,0$";

      var device_info = data.toString();

      var deviceData = device_info.split(',');

      var packet_type = deviceData[1];
      var deviceId = deviceData[2];
      var latitude = deviceData[7];
      var longitude = deviceData[8];
      var sos_type = deviceData[10];

      var location = latitude + ',' + longitude;
      
      if(packet_type == "NR")
      {
        //env.emailFunc.sendEmail("amitambaliya5@gmail.com", "Device", device_info);

        //console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`);

        //console.log(`Data received from client on ${todayTime} : ${data} `);

        global.clients[deviceId] = sock;
        
        var sql = "SELECT * FROM devices WHERE device_number = ?";

        env.con.query(sql , [deviceId],async function (err, device_data, fields) 
        {
            if(!err)
            {
              if(device_data.length > 0)
              {
                var sos;
                var sos_info = sos_type.charAt(0);
                
                if(sos_info == "0")
                {
                  sos = 0;
                }
                else if(sos_info == "1")
                {
                  sos = 1;
  
                  sendPushNotificationToUser(device_data[0].deviceId,device_data[0].device_number);
                }
  
                var sql = "UPDATE devices SET current_location=?,sos=?,last_sync_time=? WHERE device_number=?";
                var values = [location,sos,env.fn.getTime(),deviceId];
    
                env.con.query(sql, values,async function (err, results, fields) 
                {
                    if(!err)
                    {
                      console.log("Device location updated in database.")
                    }
                    else
                    {
                      console.log(err);
                    }
                });
              }
              else
              {
                console.log("Device Id not found.")
              }
            }
            else
            {
              console.log(err);
            }
        });
      }

    //prepare and send a response to the client 
    let serverResp = "Hello from the server"
    //sock.write(serverResp);
    
    //close the connection 
    //sock.end()        
  });
  
  //Handle error
  sock.on('error', function(ex) {
    //console.log(ex);
  });
}

/////Get linked device userid and send push notification
async function sendPushNotificationToUser(deviceId,device_number){
	return new Promise( async(resolve, reject) => {

		env.con.query("SELECT * FROM linkeduser_devices WHERE deviceId = ?",[deviceId],function(err,linkeduser_devices){
			if(err){ console.log(err); }
      
      if(linkeduser_devices.length > 0)
      {
          for(i = 0; i < linkeduser_devices.length; i++)
          {
            var linked_user_id;

            if(linkeduser_devices[i].type == 'owner')
            {
                linked_user_id = linkeduser_devices[i].user_id;
            }
            else
            {
                linked_user_id = linkeduser_devices[i].invited_user_id;
            }

            var sql = "SELECT * FROM users WHERE user_id = ?";

            env.con.query(sql , [linked_user_id],async function (err, usersData, fields) 
            {
                if(usersData.length > 0)
                {
                  if(usersData[0].fcm_token != null)
                  {
                    
                    var notification = {
                      title: "SOS",
                      body: "SOS for "+usersData[0].name+"'s device has been activated. Click to live track device location",
                      //sound:'default'
                    };
        
                    var data = {
                        "title": "SOS",
                        "body": "SOS for "+usersData[0].name+"'s device has been activated. Click to live track device location",
                        "deviceId":deviceId.toString(),
                        "device_number":device_number,
                        "type": 'SOS',
                        "click_action": 'FLUTTER_NOTIFICATION_CLICK',
                        "sound": "sos"
                    }
        
                    env.fcm_fn.sendNotification(usersData[0].fcm_token,notification,data);
                  }
                  else
                  {
                    console.log("User fcm token is null");
                  }              
                }
                else
                {
                  console.log("User not found for send push notification.")
                }
            });        
          }
      }
      else
      {
        console.log("Device Id not linked with any user.")
      }
      
		});
	})
}