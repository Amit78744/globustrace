var env = require('../constants');

module.exports = {
    
    ////Signin User
    signinUser : (req,res) => {
        
        try {
          
          const data = env.Joi.object().keys({
            username : env.Joi.string().required(),
            password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required(),
            fcm_token : env.Joi.string().required()
          });
        
          env.Joi.validate(req.body,data, function (err, result)
          {
                if(err)
                {
                  env.fn.validation(err,res);
                }
                else
                {
                    var username = req.body.username;
                    var password = req.body.password;
                    var fcm_token = req.body.fcm_token;
    
                    req.session.email = req.body.username;
                    req.session.password = req.body.password;

                    var sql = "SELECT * FROM users WHERE email = ? OR phoneNumber = ?";

                    env.con.query(sql , [username,username],function (err, users, fields) 
                    {
                        if(users.length > 0)
                        {
                            if(users[0].verified != 1)
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"Email is not verified, plz verify now.",
                                    "isValid":false,
                                    status:0,
                                    "type":"FAILED"
                                });
                            }
                            else if(users[0].status != 1)
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"This user is Inactive.",
                                    "isValid":false,
                                    status:0,
                                    "type":"FAILED"
                                });
                            }
                            else if (users[0].verified != 1 && users[0].status != 1)
                            {
                                res.status(401).send({
                                    "data":[],
                                    "code":401,
                                    "message":"Email is not verified.",
                                    "isValid":false,
                                    status:0,
                                    "type":"FAILED"
                                });
                            }
                            else
                            {
                                if(env.hash.verify(password, users[0].password))
                                {
                                    const token = env.Jwt.sign({username}, 'login',{});
    
                                    var sql = "UPDATE users SET fcm_token=?,token=?,last_login=? WHERE email=? OR phoneNumber = ?";
            
                                    env.con.query(sql, [fcm_token,token, env.fn.getTime(), username,username],function (err, rows, fields)
                                    {
                                        if(!err)
                                        {
                                            var sql = "SELECT * FROM users WHERE email = ? OR phoneNumber = ?";

                                            env.con.query(sql , [username,username],async function (err, users, fields) 
                                            {
                                                var sharedDevices = await getDeviceInfo(users[0].user_id,"shared");

                                                var shared_devices = [];
                    
                                                if(sharedDevices.length > 0)
                                                {
                                                    for(i = 0; i < sharedDevices.length; i++)
                                                    {
                                                        shared_devices.push(sharedDevices[i].device_number);
                                                    }                                
                                                }

                                                var sql = "SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON d.deviceId = ld.deviceId  WHERE ld.user_id = ? AND ld.type = 'owner'";

                                                env.con.query(sql , [users[0].user_id],function (err, deviceData, fields) 
                                                {
                                                    if(deviceData.length > 0)
                                                    {
                                                        res.send({
                                                            "data": [
                                                                {
                                                                    "user_id": users[0].user_id,
                                                                    "profile_image": users[0].profile_image,
                                                                    "name": users[0].name,
                                                                    "email": users[0].email,
                                                                    "myDevices":[deviceData[0].device_number],
                                                                    "sharedDevices":shared_devices,
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
                                                            "message":"User signin successfully.",
                                                            "isValid":true,
                                                            status:1,
                                                            "type":"SUCCESS",
                                                        });
                                                    }
                                                    else
                                                    {
                                                        var sql = "SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON d.deviceId = ld.deviceId  WHERE ld.user_id = ? AND ld.type = 'shared'";

                                                        env.con.query(sql , [users[0].user_id],function (err, deviceData, fields) 
                                                        {
                                                            if(deviceData.length > 0)
                                                            {
                                                                res.send({
                                                                    "data": [
                                                                        {
                                                                            "user_id": users[0].user_id,
                                                                            "profile_image": users[0].profile_image,
                                                                            "name": users[0].name,
                                                                            "email": users[0].email,
                                                                            "myDevices":[],
                                                                            "sharedDevices":shared_devices,
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
                                                                    "message":"User signin successfully.",
                                                                    "isValid":true,
                                                                    status:1,
                                                                    "type":"SUCCESS",
                                                                });
                                                            }
                                                            else
                                                            {
                                                                res.send({
                                                                    "data": [
                                                                        {
                                                                            "user_id": users[0].user_id,
                                                                            "profile_image": users[0].profile_image,
                                                                            "name": users[0].name,
                                                                            "email": users[0].email,
                                                                            "myDevices":[],
                                                                            "sharedDevices":shared_devices,
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
                                                                    "message":"User signin successfully.",
                                                                    "isValid":true,
                                                                    status:1,
                                                                    "type":"SUCCESS",
                                                                });                                                                
                                                            }
                                                        });
                                                    }                                                  
                                                });                                             
                                            });
                                        }
                                    });                                
                                }
                                else
                                {
                                    res.status(401).send({
                                        "data":[],
                                        "code":401,
                                        "message":"Password incorrect.",
                                        "isValid":false,
                                        status:0,
                                        "type":"FAILED"
                                    });                            
                                }
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
          })    
        } catch (error) {
          res.send(error);
        }
    },

    ////Check email exists or not
    checkEmail : (req,res) => {

        try {
        
        const data = env.Joi.object().keys({
            username : env.Joi.string().required()
        });
        
        env.Joi.validate(req.body,data, function (err, result)
        {
                if(err)
                {
                    env.fn.validation(err,res);
                }
                else
                {
                    var username = req.body.username;

                    var sql = "SELECT * FROM users WHERE email = ? OR phoneNumber = ?";

                    env.con.query(sql , [username,username],function (err, users, fields) 
                    {
                        if(users.length > 0)
                        {
                            var otp = env.ran('0', 4);
                                                        
                            /////Send email to user
                            env.emailFunc.sendOTP(2, username, otp);
                                
                            res.send({
                                "data":[{"otp":otp}],
                                "code":res.statusCode,
                                "message":"Otp sent sucessfully.",
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

    ////Reset Password
    resetPassword : (req,res) => {

        try {
        
            const data = env.Joi.object().keys({
                username : env.Joi.string().required(),
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
                        var username = req.body.username;
                        var new_pass = req.body.new_password;
                        var new_password = env.fn.getHashValue(req,res,new_pass);
                        var cnf_password = req.body.cnf_password;

                        var sql = "SELECT * FROM users WHERE email = ? OR phoneNumber = ?";

                        env.con.query(sql , [username,username],function (err, users, fields) 
                        {
                            if(users.length > 0)
                            {
                                if(new_pass == cnf_password)
                                {
                                    var sql = "UPDATE users SET password=? WHERE email=? OR phoneNumber = ?";
            
                                    env.con.query(sql, [new_password, username,username],function (err, rows, fields)
                                    {
                                        if(!err)
                                        {
                                            var sql = "SELECT * FROM users WHERE email = ? OR phoneNumber = ?";

                                            env.con.query(sql , [username,username],function (err, users, fields) 
                                            {
                                                var sql = "SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON d.deviceId = ld.deviceId  WHERE ld.user_id = ? AND ld.type = 'owner'";

                                                env.con.query(sql , [users[0].user_id],function (err, deviceData, fields) 
                                                {
                                                    res.send({
                                                        "data": [
                                                            {
                                                                "user_id": users[0].user_id,
                                                                "profile_image": users[0].profile_image,
                                                                "name": users[0].name,
                                                                "email": users[0].email,
                                                                "deviceID": deviceData[0].device_number,
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
                                                        "message":"Password reset successfully.",
                                                        "isValid":true,
                                                        status:1,
                                                        "type":"SUCCESS",
                                                    });                                                    
                                                });                                               
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
                                    "message":"Email not found.",
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

}

async function getDeviceInfo(user_id,type){
	return new Promise( async(resolve, reject) => {

		env.con.query("SELECT d.device_number FROM linkeduser_devices ld LEFT JOIN devices d ON ld.deviceId = d.deviceId WHERE ld.invited_user_id = ? AND ld.type = ?",[user_id,type],function(err,resp){
			if(err){ console.log(err); }
      
            resolve(resp);
      
		});
	})
}