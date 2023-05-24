const env = require('../constants');
var admin = require("firebase-admin");
var serviceAccount = require('../globustrace-firebase-firebase-adminsdk-ixdfi-e33355ae3c.json');

var axios = require("axios");

const { google } = require('googleapis');
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//////Firebase send notification function

// exports.sendNotification = function(token,notification,data){

//     admin.messaging().send({
//         token: token,
//         notification: {},
//         data: data,
        
//         // Set Android priority to "high"
//         // android: {
//         //   priority: "high",
//         //   notification: {
//         //    sound: "sos"
//         // }
//         // },
        
//         // Add APNS (Apple) config
//         apns: {
//           payload: {
//             aps: {
//               contentAvailable: true,
//               sound: "sos"
//             },
//           },
//           headers: {
//             //"apns-push-type": "background",
//             "apns-priority": "10", // Must be `5` when `contentAvailable` is set to true.
//           },
//         },
//       }).then(function(response) {
//         console.log("Successfully sent message:", response);
//         //res.send(response);
//     })
//     .catch(function(error) {
//         console.log("Error sending message:", error);
//         //res.send(error);
//     });
// }

// exports.sendNotification1 = function(token,notification,data,req,res){

//   admin.messaging().send({
//       token: token,
//       notification: notification,
//       data: data,
      
//       // Set Android priority to "high"
//       android: {
//         priority: "high",
//         notification: {
//          sound: "default"
//       }
//       },
      
//       // Add APNS (Apple) config
//       apns: {
//         payload: {
//           aps: {
//             contentAvailable: true,
//             sound: "default"
//           },
//         },
//         headers: {
//           //"apns-push-type": "background",
//           "apns-priority": "10", // Must be `5` when `contentAvailable` is set to true.
//         },
//       },
//     }).then(function(response) {
//       res.send({
//         "data":response,
//         "code":res.statusCode,
//         "message":"Push notification send sucessfully.",
//         "isValid":true,
//         status:1,
//         "type":"SUCCESS"
//       });
//   })
//   .catch(function(error) {
//       res.status(401).send({
//         "data":error,
//         "code":401,
//         "message":"Something went wrong.",
//         "isValid":false,
//         status:0,
//         "type":"FAILED"
//     });
//   });
// }

exports.sendNotification = function(token,notification,data){

  const key = require('../globustrace-firebase-firebase-adminsdk-ixdfi-e33355ae3c.json');
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES,
    null
  );
  jwtClient.authorize(function(err, tokens) {
    if (err) {
        console.log(err)
    }

  payload = {
    "message": {
      "token":token,
      "notification": {},
      "data": data,
      "apns": {
      "payload": {
        "aps": {
        "category" : "NEW_MESSAGE_CATEGORY",
        "sound": "sos"
        }
      }
      }
    }
  }

    axios.post('https://fcm.googleapis.com/v1/projects/globustrace-firebase/messages:send', payload,{
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Content-Type': 'application/json',
        "Accept": "application/json",
        "Authorization" : 'Bearer '+tokens.access_token,
      }
        }).then((response) => {
          console.log("Push notification sent : ",response.data);

    }).catch((error) => {
      console.log("Push notification error : ",error.response.data.error);
    })

  });  
}

exports.sendNotification1 = function(token,notification,data,req,res){

  const key = require('../globustrace-firebase-firebase-adminsdk-ixdfi-e33355ae3c.json');
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES,
    null
  );
  jwtClient.authorize(function(err, tokens) {
    if (err) {
        console.log(err)
    }

  payload = {
    "message": {
      "token":token,
      "notification": {},
      "data": data,
      "apns": {
      "payload": {
        "aps": {
        "category" : "NEW_MESSAGE_CATEGORY",
        "sound": "sos"
        }
      }
      }
    }
  }

    axios.post('https://fcm.googleapis.com/v1/projects/globustrace-firebase/messages:send', payload,{
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Content-Type': 'application/json',
        "Accept": "application/json",
        "Authorization" : 'Bearer '+tokens.access_token,
      }
        }).then((response) => {
          res.send({
            "data":response.data,
            "code":res.statusCode,
            "message":"Push notification send sucessfully.",
            "isValid":true,
            status:1,
            "type":"SUCCESS"
          });

    }).catch((error) => {
      res.status(401).send({
          "data":error.response.data.error,
          "code":401,
          "message":"Something went wrong.",
          "isValid":false,
          status:0,
          "type":"FAILED"
      });
    })

  });  
}