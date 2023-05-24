var env = require('../constants');
const passwords = require('../functions/password');

module.exports = {

    ////Splash screen
    getSplashScreenData : (req,res) => {

        try {
        
        const data = env.Joi.object().keys({
            user_id : env.Joi.number().required()
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

                    var sql = "SELECT * FROM users WHERE user_id = ?";

                    env.con.query(sql , [user_id],async function (err, users, fields) 
                    {
                        if(users.length > 0)
                        {
                            var myDevices = await getDeviceInfo(user_id,"owner");

                            var my_devices = [];

                            if(myDevices.length > 0)
                            {
                                for(i = 0; i < myDevices.length; i++)
                                {
                                    my_devices.push(myDevices[i].device_number);
                                }                                
                            }

                            var sharedDevices = await getDeviceInfo(user_id,"shared");

                            var shared_devices = [];

                            if(sharedDevices.length > 0)
                            {
                                for(i = 0; i < sharedDevices.length; i++)
                                {
                                    shared_devices.push(sharedDevices[i].device_number);
                                }                                
                            }

                            res.send({
                                "data":[{"profile_image":users[0].profile_image,"name":users[0].name,"email":users[0].email,"phoneNumber":users[0].phoneNumber,"myDevices":my_devices,"sharedDevices":shared_devices}],
                                "code":res.statusCode,
                                "message":"User Profile get sucessfully.",
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

    ////Update profile
    updateProfile : (req,res) => {

        try {
  
          const data = env.Joi.object().keys({
            profile : env.Joi.object().allow(null, ''),
            user_id : env.Joi.number().required(),
            name : env.Joi.string().required(),
          });
        
          env.Joi.validate(req.body,data, async function (err, result)
          {
              if(err)
              {
                  env.fn.validation(err,res);
              }
              else
              {
                  var imageName = Date.now() + '_' + env.ran('Aa0', 10) + '.png';
  
                  if(req.files != null)
                  {
                    await req.files.profile.mv('./uploads/profile/'+imageName);
                  }
  
                  var user_id = req.body.user_id;
                  var name = req.body.name;                  
  
                  var sql = "SELECT * FROM users WHERE user_id = ?";
  
                  env.con.query(sql , [user_id],function (err, users, fields) 
                  {
                      if(users.length > 0)
                      {
                          if(req.files == null)
                          {
                                // if(users[0].profile_image != null)
                                // {
                                //     if(env.fs.existsSync('./uploads/profile/'+ users[0].profile_image))
                                //     {
                                //         env.fs.unlinkSync('./uploads/profile/'+users[0].profile_image);
                                //     }
                                //     else
                                //     {
                                //         console.log("File not found for profile");            
                                //     }
                                // }  

                                var sql = "UPDATE users SET name=? WHERE user_id=?";
                                var values = [name,user_id];
                    
                                env.con.query(sql, values,async function (err, results, fields) {
                                    if(!err)
                                    {
                                            var myDevices = await getDeviceInfo(user_id,"owner");

                                            var my_devices = [];
                
                                            if(myDevices.length > 0)
                                            {
                                                for(i = 0; i < myDevices.length; i++)
                                                {
                                                    my_devices.push(myDevices[i].device_number);
                                                }                                
                                            }
                
                                            var sharedDevices = await getDeviceInfo(user_id,"shared");
                
                                            var shared_devices = [];
                
                                            if(sharedDevices.length > 0)
                                            {
                                                for(i = 0; i < sharedDevices.length; i++)
                                                {
                                                    shared_devices.push(sharedDevices[i].device_number);
                                                }                                
                                            }
                
                                            var sql = "SELECT * FROM users WHERE user_id = ?";
        
                                            env.con.query(sql , [user_id],function (err, users, fields) 
                                            {
                                                if(!err)
                                                {
                                                    res.send({
                                                        "data":[{"profile_image":users[0].profile_image,"name":users[0].name,"email":users[0].email,"phoneNumber":users[0].phoneNumber,"myDevices":my_devices,"sharedDevices":shared_devices}],
                                                        "code":res.statusCode,
                                                        "message":"Profile updated successfully.",
                                                        "isValid":true,
                                                        status:1,
                                                        "type":"SUCCESS"
                                                    });                                                    
                                                }                                         
                                            });
                                    }else{
                                        res.send(err);
                                    }
                                })                                  
                          }
                          else
                          {
                              var profile_imagepath = env.imageUrl+"getProfileImage/"+imageName;
  
                              if(users[0].profile_image != null)
                              {
                                  if(env.fs.existsSync('./uploads/profile/'+ users[0].profile_image))
                                  {
                                    env.fs.unlinkSync('./uploads/profile/'+users[0].profile_image);
                                  }
                                  else
                                  {
                                    console.log("File not found for profile");            
                                  }
                              }
  
                              var sql = "UPDATE users SET profile_image=?,name=? WHERE user_id=?";
                              var values = [imageName,name,user_id];
                  
                              env.con.query(sql, values,async function (err, results, fields) {
                                  if(!err)
                                  {
                                          var myDevices = await getDeviceInfo(user_id,"owner");

                                          var my_devices = [];
              
                                          if(myDevices.length > 0)
                                          {
                                              for(i = 0; i < myDevices.length; i++)
                                              {
                                                  my_devices.push(myDevices[i].device_number);
                                              }                                
                                          }
              
                                          var sharedDevices = await getDeviceInfo(user_id,"shared");
              
                                          var shared_devices = [];
              
                                          if(sharedDevices.length > 0)
                                          {
                                              for(i = 0; i < sharedDevices.length; i++)
                                              {
                                                  shared_devices.push(sharedDevices[i].device_number);
                                              }                                
                                          }
              
                                          var sql = "SELECT * FROM users WHERE user_id = ?";
        
                                          env.con.query(sql , [user_id],function (err, users, fields) 
                                          {
                                              if(!err)
                                              {
                                                  res.send({
                                                      "data":[{"profile_image":users[0].profile_image,"name":users[0].name,"email":users[0].email,"phoneNumber":users[0].phoneNumber,"myDevices":my_devices,"sharedDevices":shared_devices}],
                                                      "code":res.statusCode,
                                                      "message":"Profile updated successfully.",
                                                      "isValid":true,
                                                      status:1,
                                                      "type":"SUCCESS"
                                                  });                                                    
                                              }                                         
                                          });                                          
                                  }else{
                                      res.send(err);
                                  }
                              })                              
                          }
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
                  })                      
                  
              }
          });      
  
        } catch (error) {
          res.send(error);
        }
    },

    /////Get profile image
    getProfileImage: (req,res) => {

        try {
            if(env.fs.existsSync('./uploads/profile/'+ req.params.name))
            {
                env.fs.createReadStream('./uploads/profile/'+ req.params.name).pipe(res);
            }
            else
            {
                res.send({
                    "code":res.statusCode,
                    "message":"File Not Found.",
                    "isValid":false,
                    status:0,
                    "type":"FAILED"
                })
            }
        } catch (error) {
            console.log(error);
        }
  
    },

    ////Change Password
    changePassword : (req,res) => {

        try {
        
            const data = env.Joi.object().keys({
                user_id : env.Joi.number().required(),
                old_password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required(),
                new_password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required(),
                cnf_password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required()
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
                        var old_password = req.body.old_password;
                        var new_pass = req.body.new_password;
                        var new_password = env.fn.getHashValue(req,res,new_pass);
                        var cnf_password = req.body.cnf_password;

                        var sql = "SELECT * FROM users WHERE user_id = ?";

                        env.con.query(sql , [user_id],function (err, users, fields) 
                        {
                            if(users.length > 0)
                            {
                                if(env.hash.verify(old_password,users[0].password))
                                {
                                    if(new_pass == cnf_password)
                                    {
                                        var sql = "UPDATE users SET password=? WHERE user_id=?";
                
                                        env.con.query(sql, [new_password, user_id],function (err, rows, fields)
                                        {
                                            if(!err)
                                            {
                                                res.status(200).send({
                                                    "data":[],
                                                    "code":200,
                                                    "message":"Password changed successfully.",
                                                    "isValid":true,
                                                    status:1,
                                                    "type":"SUCCESS"
                                                });
                                            }
                                        });
                                    }
                                    else
                                    {
                                        res.status(401).send({
                                            "data":[],
                                            "code":401,
                                            "message":"New passwrod and confirm password doesn't match.",
                                            "isValid":false,
                                            status:0,
                                            "type":"FAILED"
                                        });
                                    }
                                }
                                else
                                {
                                    res.status(401).send({
                                        "data":[],
                                        "code":401,
                                        "message":"Please enter correct old password.",
                                        "isValid":false,
                                        status:0,
                                        "type":"FAILED"
                                    });
                                }
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
            });

        } catch (error) {
        res.send(error);
        }
    },

    //////Add Emergency contact
    addEmergencyContact : (req,res) => {
        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
            name : env.Joi.string().required(),
            phoneNumber : env.Joi.string().required(),
            relation : env.Joi.string().required()
          });
        
          ///////Check validation of body
          env.Joi.validate(req.body,data, function (err, result)
          {
            if(err)
            {
              env.fn.validation(err,res);
            }
            else
            {
                var user_id = req.body.user_id;
                var name = req.body.name;
                var phoneNumber = req.body.phoneNumber;
                var relation = req.body.relation;

                var sql = "SELECT * FROM users WHERE user_id = ?";
  
                env.con.query(sql, [user_id] ,function (err, users, fields)
                {
                    if(users.length > 0)
                    {
                        /////Save emergency contact in database
                                                                    
                        var sql = "INSERT INTO emergency_contacts (user_id,name,phoneNumber,relation) VALUES ?";
                        var values = [[user_id,name,phoneNumber,relation]];

                        env.con.query(sql, [values] ,function (err, rows, fields)
                        {
                            if(!err)
                            {
                                res.send({
                                    "data": [],
                                    "code":res.statusCode,
                                    "message":"Emergency contact added sucessfully.",
                                    "isValid":true,
                                    status:1,
                                    "type":"SUCCESS",
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
          });      
  
        }catch (error) {
            res.send(error);
        }
    },

    //////Update Emergency contact
    updateEmergencyContact : (req,res) => {
        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
            contactId : env.Joi.number().required(),
            name : env.Joi.string().required(),
            phoneNumber : env.Joi.string().required(),
            relation : env.Joi.string().required()
          });
        
          ///////Check validation of body
          env.Joi.validate(req.body,data, function (err, result)
          {
            if(err)
            {
              env.fn.validation(err,res);
            }
            else
            {
                var user_id = req.body.user_id;
                var contactId = req.body.contactId;
                var name = req.body.name;
                var phoneNumber = req.body.phoneNumber;
                var relation = req.body.relation;

                var sql = "SELECT * FROM users WHERE user_id = ?";
  
                env.con.query(sql, [user_id] ,function (err, users, fields)
                {
                    if(users.length > 0)
                    {
                        var sql = "SELECT * FROM emergency_contacts WHERE contactId = ?";
  
                        env.con.query(sql, [contactId] ,function (err, contactData, fields)
                        {
                            if(contactData.length > 0)
                            {
                                /////Update emergency contact in database

                                var sql = "UPDATE emergency_contacts SET name=?,phoneNumber=?,relation=? WHERE contactId=?";
              
                                env.con.query(sql, [name,phoneNumber,relation,contactId],function (err, rows, fields)
                                {
                                    if(!err)
                                    {
                                        res.send({
                                            "data": [],
                                            "code":res.statusCode,
                                            "message":"Emergency contact updated sucessfully.",
                                            "isValid":true,
                                            status:1,
                                            "type":"SUCCESS",
                                        });                                        
                                    }
                                });                                
                            }
                            else
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"Emergency contact not found.",
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
          });      
  
        }catch (error) {
            res.send(error);
        }
    },
    
    //////Get all Emergency contact
    getEmergencyContact : (req,res) => {
        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required()
          });
        
          ///////Check validation of body
          env.Joi.validate(req.body,data, function (err, result)
          {
            if(err)
            {
              env.fn.validation(err,res);
            }
            else
            {
                var user_id = req.body.user_id;

                var sql = "SELECT * FROM users WHERE user_id = ?";
  
                env.con.query(sql, [user_id] ,function (err, users, fields)
                {
                    if(users.length > 0)
                    {
                        var sql = "SELECT * FROM emergency_contacts WHERE user_id = ?";
  
                        env.con.query(sql, [user_id] ,function (err, contactData, fields)
                        {
                            if(contactData.length > 0)
                            {
                                res.send({
                                    "data": contactData,
                                    "code":res.statusCode,
                                    "message":"Emergency contact get sucessfully.",
                                    "isValid":true,
                                    status:1,
                                    "type":"SUCCESS",
                                });                                
                            }
                            else
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"Emergency contact not found for this user.",
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
          });      
  
        }catch (error) {
            res.send(error);
        }
    },

    //////Delete Emergency contact
    deleteEmergencyContact : (req,res) => {
        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
            contactId : env.Joi.number().required()
          });
        
          ///////Check validation of body
          env.Joi.validate(req.body,data, function (err, result)
          {
            if(err)
            {
              env.fn.validation(err,res);
            }
            else
            {
                var user_id = req.body.user_id;
                var contactId = req.body.contactId;

                var sql = "SELECT * FROM users WHERE user_id = ?";
  
                env.con.query(sql, [user_id] ,function (err, users, fields)
                {
                    if(users.length > 0)
                    {
                        var sql = "SELECT * FROM emergency_contacts WHERE contactId = ?";
  
                        env.con.query(sql, [contactId] ,function (err, contactData, fields)
                        {
                            if(contactData.length > 0)
                            {
                                /////Delete emergency contact from database

                                var sql = "DELETE FROM emergency_contacts WHERE contactId = ?";
              
                                env.con.query(sql, [contactId],function (err, rows, fields)
                                {
                                    if(!err)
                                    {
                                        res.send({
                                            "data": [],
                                            "code":res.statusCode,
                                            "message":"Emergency contact deleted sucessfully.",
                                            "isValid":true,
                                            status:1,
                                            "type":"SUCCESS",
                                        });                                        
                                    }
                                });                                
                            }
                            else
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"Emergency contact not found.",
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
          });      
  
        }catch (error) {
            res.send(error);
        }
    },

    //////Invite A Friend
    inviteFriend : (req,res) => {
        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
            name : env.Joi.string().required(),
            phoneNumber : env.Joi.string().required()
          });
        
          ///////Check validation of body
          env.Joi.validate(req.body,data, function (err, result)
          {
            if(err)
            {
              env.fn.validation(err,res);
            }
            else
            {
                var user_id = req.body.user_id;
                var name = req.body.name;
                var phoneNumber = req.body.phoneNumber;
  
                var sql = "SELECT * FROM users WHERE user_id = ?";
  
                env.con.query(sql, [user_id] ,function (err, users, fields)
                {
                    if(users.length > 0)
                    {
                        var sql = "SELECT * FROM invited_users WHERE phoneNumber = ? AND user_id = ?";
  
                        env.con.query(sql, [phoneNumber,user_id] ,function (err, invitedUsersData, fields)
                        {
                            if(invitedUsersData.length > 0)
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"User already invited this phone number.",
                                    "isValid":false,
                                    status:0,
                                    "type":"FAILED"
                                });                                
                            }
                            else
                            {

                                var sql = "SELECT * FROM users WHERE phoneNumber = ?";
  
                                env.con.query(sql, [phoneNumber] ,function (err, usersData, fields)
                                {
                                    if(usersData.length > 0)
                                    {
                                        var sql = "SELECT * FROM linkeduser_devices WHERE user_id = ? AND type = 'owner'";
                
                                        env.con.query(sql, [user_id] ,async function (err, deviceInfo, fields) {
                                            if(!err)
                                            {
                                                if(deviceInfo.length > 0)
                                                {
                                                    var sql = "INSERT INTO linkeduser_devices (user_id,invited_user_id,deviceId,type) VALUES ?";
                                                    var values = [[user_id,usersData[0].user_id,deviceInfo[0].deviceId,"shared"]];
                                                    
                                                    env.con.query(sql, [values] ,function (err, result, fields)
                                                    {
                                                        if(!err)
                                                        {
                                                            var sql = "INSERT INTO invited_users (user_id,invited_user_id,name,phoneNumber) VALUES ?";
                                                            var values = [[user_id,usersData[0].user_id,name,phoneNumber]];
                                                            
                                                            env.con.query(sql, [values] ,function (err, rows, fields)
                                                            {
                                                                if(!err)
                                                                {
                                                                    var sql = "SELECT * FROM users WHERE phoneNumber = ?";
                        
                                                                    env.con.query(sql , [phoneNumber],function (err, users, fields) 
                                                                    {
                                                                        var sql = "SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON d.deviceId = ld.deviceId  WHERE ld.user_id = ? AND ld.type = 'shared'";
                
                                                                        env.con.query(sql , [users[0].user_id],function (err, deviceData, fields) 
                                                                        {
                                                                            res.send({
                                                                                "data": [
                                                                                    {
                                                                                        "user_id": users[0].user_id,
                                                                                        "profile_image": users[0].profile_image,
                                                                                        "name": users[0].name,
                                                                                        "email": users[0].email,
                                                                                        "phoneNumber": users[0].phoneNumber,
                                                                                        "verified": users[0].verified,
                                                                                        "password": users[0].password,
                                                                                        "token": users[0].token,
                                                                                        "fcm_token": users[0].fcm_token,
                                                                                        "status": users[0].status,
                                                                                        "current_location": users[0].current_location,
                                                                                        "created_at": users[0].created_at,
                                                                                        "last_login": users[0].last_login,
                                                                                        "updated_at": users[0].updated_at
                                                                                    }
                                                                                ],
                                                                                "code":res.statusCode,
                                                                                "message":"Invite a friend sucessfully.",
                                                                                "isValid":true,
                                                                                status:1,
                                                                                "type":"SUCCESS",
                                                                            });                                                    
                                                                        });                                                
                                                                    });                                                                    
                                                                }
                                                            });                                            
                                                        }else{
                                                          console.log(err)
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    res.status(401).send({
                                                        "data":[],
                                                        "code":401,
                                                        "message":"Device not found for this user.",
                                                        "isValid":false,
                                                        status:0,
                                                        "type":"FAILED"
                                                    });
                                                }                                        
                                                                                                    
                                            }
                                        })                                                                        
                                    }
                                    else
                                    {
                                        var pass = passwords.getRandomString(10);
                                        var password = env.fn.getHashValue(req,res,pass);
                
                                        var sql = "INSERT INTO users (name,phoneNumber,verified,password,status) VALUES ?";
                                        var values = [[name,phoneNumber,true,password,1]];
                
                                        env.con.query(sql, [values] ,function (err, rows, fields)
                                        {
                                            if(!err)
                                            {
                                                var sql = "SELECT * FROM linkeduser_devices WHERE user_id = ? AND type = 'owner'";
                
                                                env.con.query(sql, [user_id] ,async function (err, deviceInfo, fields) {
                                                    if(!err)
                                                    {
                                                        if(deviceInfo.length > 0)
                                                        {
                                                            var sql = "INSERT INTO linkeduser_devices (user_id,invited_user_id,deviceId,type) VALUES ?";
                                                            var values = [[user_id,rows.insertId,deviceInfo[0].deviceId,"shared"]];
                                                            
                                                            env.con.query(sql, [values] ,function (err, result, fields)
                                                            {
                                                                if(!err)
                                                                {
                                                                    var sql = "INSERT INTO invited_users (user_id,invited_user_id,name,phoneNumber) VALUES ?";
                                                                    var values = [[user_id,rows.insertId,name,phoneNumber]];
                                                                    
                                                                    env.con.query(sql, [values] ,function (err, rows, fields)
                                                                    {
                                                                        if(!err)
                                                                        {
                                                                            var sql = "SELECT * FROM users WHERE phoneNumber = ?";
                                
                                                                            env.con.query(sql , [phoneNumber],function (err, users, fields) 
                                                                            {
                                                                                var sql = "SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON d.deviceId = ld.deviceId  WHERE ld.user_id = ? AND ld.type = 'shared'";
                        
                                                                                env.con.query(sql , [users[0].user_id],function (err, deviceData, fields) 
                                                                                {
                                                                                    res.send({
                                                                                        "data": [
                                                                                            {
                                                                                                "user_id": users[0].user_id,
                                                                                                "profile_image": users[0].profile_image,
                                                                                                "name": users[0].name,
                                                                                                "email": users[0].email,
                                                                                                "phoneNumber": users[0].phoneNumber,
                                                                                                "verified": users[0].verified,
                                                                                                "password": users[0].password,
                                                                                                "token": users[0].token,
                                                                                                "fcm_token": users[0].fcm_token,
                                                                                                "status": users[0].status,
                                                                                                "current_location": users[0].current_location,
                                                                                                "created_at": users[0].created_at,
                                                                                                "last_login": users[0].last_login,
                                                                                                "updated_at": users[0].updated_at
                                                                                            }
                                                                                        ],
                                                                                        "code":res.statusCode,
                                                                                        "message":"Invite a friend sucessfully.",
                                                                                        "isValid":true,
                                                                                        status:1,
                                                                                        "type":"SUCCESS",
                                                                                    });                                                    
                                                                                });                                                
                                                                            });                                                                    
                                                                        }
                                                                    });                                            
                                                                }else{
                                                                  console.log(err)
                                                                }
                                                            });
                                                        }
                                                        else
                                                        {
                                                            res.status(401).send({
                                                                "data":[],
                                                                "code":401,
                                                                "message":"Device not found for this user.",
                                                                "isValid":false,
                                                                status:0,
                                                                "type":"FAILED"
                                                            });
                                                        }                                        
                                                                                                            
                                                    }
                                                })
                                            }
                                        });
                                    }
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
          });      
  
        }catch (error) {
            res.send(error);
        }
    },

    //////Get Invited Friend List
    getinviteFriendList : (req,res) => {
        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required()
          });
        
          ///////Check validation of body
          env.Joi.validate(req.body,data, function (err, result)
          {
            if(err)
            {
              env.fn.validation(err,res);
            }
            else
            {
                var user_id = req.body.user_id;
  
                var sql = "SELECT * FROM users WHERE user_id = ?";
  
                env.con.query(sql, [user_id] ,function (err, users, fields)
                {
                    if(users.length > 0)
                    {
                        var sql = "SELECT * FROM invited_users WHERE user_id = ?";
  
                        env.con.query(sql, [user_id] ,function (err, invitedUsersData, fields)
                        {
                            if(invitedUsersData.length > 0)
                            {

                                var data = [];

                                for(i = 0; i < invitedUsersData.length; i++)
                                {
                                    data.push({"id":invitedUsersData[i].invited_user_id,"name":invitedUsersData[i].name,"phoneNumber":invitedUsersData[i].phoneNumber});
                                }

                                res.send({
                                    "data": data,
                                    "code":res.statusCode,
                                    "message":"Get invited friend list sucessfully.",
                                    "isValid":true,
                                    status:1,
                                    "type":"SUCCESS",
                                });                              
                            }
                            else
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"Invited friend list not found for this user.",
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
          });      
  
        }catch (error) {
            res.send(error);
        }
    },

    /////Delete invited friend
    deleteInvitedFriend : (req,res) => {
        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
            invited_user_id : env.Joi.number().required()
          });
        
          ///////Check validation of body
          env.Joi.validate(req.body,data, function (err, result)
          {
            if(err)
            {
              env.fn.validation(err,res);
            }
            else
            {
                var user_id = req.body.user_id;
                var invited_user_id = req.body.invited_user_id;

                var sql = "SELECT * FROM users WHERE user_id = ?";
  
                env.con.query(sql, [user_id] ,function (err, users, fields)
                {
                    if(users.length > 0)
                    {
                        /////Delete invited friend from database

                        var sql = "DELETE FROM linkeduser_devices WHERE user_id = ? AND invited_user_id = ? AND type = ?";
              
                        env.con.query(sql, [user_id,invited_user_id,'shared'],function (err, rows, fields)
                        {
                            if(!err)
                            {
                                var sql = "DELETE FROM invited_users WHERE user_id = ? AND invited_user_id = ?";
              
                                env.con.query(sql, [user_id,invited_user_id],function (err, rows, fields)
                                {
                                    if(!err)
                                    {
                                        res.send({
                                            "data": [],
                                            "code":res.statusCode,
                                            "message":"Invited friend deleted sucessfully.",
                                            "isValid":true,
                                            status:1,
                                            "type":"SUCCESS",
                                        });                                        
                                    }
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
          });      
  
        }catch (error) {
            res.send(error);
        }
    },

    ////Logout
    logout : (req,res) => {

        try {
  
          const data = env.Joi.object().keys({
            user_id : env.Joi.number().required(),
          });
        
          env.Joi.validate(req.body,data, async function (err, result)
          {
              if(err)
              {
                  env.fn.validation(err,res);
              }
              else
              {
                  var user_id = req.body.user_id;
  
                  var sql = "SELECT * FROM users WHERE user_id = ?";
  
                  env.con.query(sql , [user_id],function (err, users, fields) 
                  {
                      if(users.length > 0)
                      {
                            var sql = "UPDATE users SET token=?,fcm_token=? WHERE user_id=?";
                            var values = ['','',user_id];
                
                            env.con.query(sql, values,function (err, results, fields) {
                                if(!err)
                                {
                                    res.send({
                                        "data":[],
                                        "code":res.statusCode,
                                        "message":"User logout successfully.",
                                        "isValid":true,
                                        status:1,
                                        "type":"SUCCESS"
                                    });
                                }else{
                                    res.send(err);
                                }
                            })                                                      
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
                  })                      
                  
              }
          });      
  
        } catch (error) {
          res.send(error);
        }
    },

}

async function getDeviceInfo(user_id,type){
	return new Promise( async(resolve, reject) => {

        var sql;
        
        if(type == "owner")
        {
            sql = "SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON ld.deviceId = d.deviceId WHERE ld.user_id = ? AND ld.type = ?"
        }
        else
        {
            sql = "SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON ld.deviceId = d.deviceId WHERE ld.invited_user_id = ? AND ld.type = ?"
        }

		env.con.query(sql,[user_id,type],function(err,resp){
			if(err){ console.log(err); }
      
            resolve(resp);
      
		});
	})
}