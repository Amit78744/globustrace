var env = require('../constants');

module.exports = {

    ////Get device location
    getDeviceLocation : (req,res) => {

        try {
        
        const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
            deviceId : env.Joi.string().required()
        });
        
        env.Joi.validate(req.body,data, function (err, result)
        {
                if(err)
                {
                    env.fn.validation(err,res);
                }
                else
                {
                    var user_id = req.body.user_id;
                    var deviceId = req.body.deviceId;

                    var sql = "SELECT * FROM users WHERE user_id = ?";

                    env.con.query(sql , [user_id],async function (err, users, fields) 
                    {
                        if(users.length > 0)
                        {

                            var sql = "SELECT * FROM devices WHERE device_number = ?";

                            env.con.query(sql , [deviceId],async function (err, deviceData, fields) 
                            {
                                if(deviceData.length > 0)
                                {
                                    res.send({
                                        "data":[{"location":deviceData[0].current_location,"action":deviceData[0].mode,"updated_at":deviceData[0].last_sync_time}],
                                        "code":res.statusCode,
                                        "message":"Device location get sucessfully.",
                                        "isValid":true,
                                        status:1,
                                        "type":"SUCCESS"
                                    });
                                }
                                else
                                {
                                    res.status(401).send({
                                        "data":[],
                                        "code":401,
                                        "message":"Device id not found.",
                                        "isValid":false,
                                        status:0,
                                        "type":"FAILED"
                                    });                                    
                                }
                            });
                        }
                        else
                        {
                            res.status(401).send({
                                "data":[],
                                "code":401,
                                "message":"User not found.",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                            });
                        }
                    });          
                }
        })    
        } catch (error) {
        res.send(error);
        }
    },

    ////Send test push notification
    sendTestPushNotification : (req,res) =>{
        try {
      
            var token = req.body.token;

            var notification = {
                title: "SOS",
                body: "Emergency SOS Activated.",
                //sound:'default'
            };
  
            var data = {
                type: 'SOS',
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }                      
      
            env.fcm_fn.sendNotification1(token,notification,data,req,res);
            
      
        } catch (error) {
          res.send(error);
        }
    },

    ////Send location to device from socket
    sendLocationMode : (req,res) => {

        try {
        
        const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
            deviceId : env.Joi.string().required(),
            action : env.Joi.string().required()
        });
        
        env.Joi.validate(req.body,data, function (err, result)
        {
                if(err)
                {
                    env.fn.validation(err,res);
                }
                else
                {
                    var user_id = req.body.user_id;
                    var deviceId = req.body.deviceId;
                    var action = req.body.action;
                    var mode;

                    var date = new Date();
                    let todayTime = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

                    // var sock = global.socket;
                    // console.log(global.clients);

                    if(global.clients[deviceId])
                    {
                        if(action == "start")
                        {
                            mode = "start_mode"
                        }
                        else
                        {
                            mode = "normal_mode"
                        }
                        
                        var sql = "SELECT * FROM users WHERE user_id = ?";
    
                        env.con.query(sql , [user_id],async function (err, users, fields) 
                        {
                            if(users.length > 0)
                            {
    
                                var sql = "SELECT * FROM devices WHERE device_number = ?";
    
                                env.con.query(sql , [deviceId],async function (err, deviceData, fields) 
                                {
                                    if(deviceData.length > 0)
                                    {
                                        ////Update device mode in database
                                        var sql = "UPDATE devices SET mode=?,live_tracking_time=? WHERE device_number=?";
                                        var values = [mode,env.fn.getTime(),deviceId];
                            
                                        env.con.query(sql, values,async function (err, results, fields) 
                                        {
                                            if(!err)
                                            {
                                                if(action == "start")
                                                {
                                                    global.clients[deviceId].write('*GIPL,LTSTART,$');
                                                    console.log(`Data send to client for start tracking on device : ${deviceData[0].device_number} on ${todayTime} `);
                                                }
                                                else
                                                {
                                                    global.clients[deviceId].write('*GIPL,LTSTOP,$');
                                                    console.log(`Data send to client for stop tracking on device : ${deviceData[0].device_number} on ${todayTime} `);
                                                }

                                                res.send({
                                                    "data":[],
                                                    "code":res.statusCode,
                                                    "message":"Send location mode to device sucessfully.",
                                                    "isValid":true,
                                                    status:1,
                                                    "type":"SUCCESS"
                                                });
                                            }                                        
                                        });
    
                                        ////Send push notification to other users
                                        // env.con.query("SELECT * FROM linkeduser_devices WHERE deviceId = ?",[deviceData[0].deviceId],function(err,linkeduser_devices){
                                        //     if(err){ console.log(err); }
                                      
                                        //     if(linkeduser_devices.length > 0)
                                        //     {
                                        //         var linked_user_id = [];
    
                                        //         for(i = 0; i < linkeduser_devices.length; i++)
                                        //         {
                                        //             if(linkeduser_devices[i].type == 'owner')
                                        //             {
                                        //                 linked_user_id.push(linkeduser_devices[i].user_id);
                                        //             }
                                        //             else
                                        //             {
                                        //                 linked_user_id.push(linkeduser_devices[i].invited_user_id);
                                        //             }
                                        //         }
    
                                        //         for(j = 0; j < linked_user_id.length; j++)
                                        //         {
                                        //             if(linked_user_id[j] != user_id)
                                        //             {
                                        //                 var sql = "SELECT * FROM users WHERE user_id = ?";
                                        
                                        //                 env.con.query(sql , [linked_user_id[j]],async function (err, usersData, fields) 
                                        //                 {
                                        //                     if(usersData.length > 0)
                                        //                     {
                                        //                         if(usersData[0].fcm_token != null)
                                        //                         {
                                        //                             var notification = {
                                        //                             title: action,
                                        //                             body: action,
                                        //                             //sound:'default'
                                        //                             };
                                                        
                                        //                             var data = {
                                        //                                 type: action,
                                        //                                 click_action: 'FLUTTER_NOTIFICATION_CLICK'
                                        //                             }
                                                        
                                        //                             env.fcm_fn.sendNotification(usersData[0].fcm_token,notification,data);
                                        //                         }
                                        //                         else
                                        //                         {
                                        //                             console.log("User fcm token is null")
                                        //                         }              
                                        //                     }
                                        //                     else
                                        //                     {
                                        //                         console.log("User not found for send push notification.")
                                        //                     }
                                        //                 });                                                    
                                        //             }                                               
                                        //         }
                                        //     }
                                        //     else
                                        //     {
                                        //         console.log("Device Id not linked with any user.")
                                        //     }
                                      
                                        // });                                    
                                    }
                                    else
                                    {
                                        res.status(401).send({
                                            "data":[],
                                            "code":401,
                                            "message":"Device id not found.",
                                            "isValid":false,
                                            status:0,
                                            "type":"FAILED"
                                        });                                    
                                    }
                                });
                            }
                            else
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"User not found.",
                                    "isValid":false,
                                    status:0,
                                    "type":"FAILED"
                                });
                            }
                        });
                    }
                    else
                    {
                        res.status(401).send({
                            "data":[],
                            "code":401,
                            "message":"socket not connected to device.",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                        });
                    }                              
                }
        })    
        } catch (error) {
            res.send(error);
        }
    },

}