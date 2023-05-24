var env = require('../constants');

module.exports = {

    //////SignupUser
    signupUser : (req,res) => {
      try {

        var otp = env.ran('0', 4);

        const data = env.Joi.object().keys({
          name : env.Joi.string().required(),
          email : env.Joi.string().email().required(),
          phoneNumber : env.Joi.string().required(),
          deviceId : env.Joi.string().required(),
          password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required(),
          cnf_password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required(),
          fcm_token : env.Joi.string().required()
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
              var name = req.body.name;
              var email = req.body.email;
              var phoneNumber = req.body.phoneNumber;
              var deviceId = req.body.deviceId;
              var pass = req.body.password;
              var cnf_pass = req.body.cnf_pass;
              var password = env.fn.getHashValue(req,res,pass);
              var fcm_token = req.body.fcm_token;

              var sql = "SELECT * FROM users WHERE email = ?";

              env.con.query(sql, [email] ,function (err, rows, fields)
              {
                  if(rows.length > 0)
                  {
                      res.status(401).send({
                        "data":[],
                        "code":401,
                        "message":"Email already registered.",
                        "isValid":false,
                        status:0,
                        "type":"FAILED"
                      });
                  }
                  else
                  {
                      var sql = "SELECT * FROM users WHERE phoneNumber = ?";

                      env.con.query(sql, [phoneNumber] ,async function (err, rows, fields)
                      {
                          if(rows.length > 0)
                          {
                              res.status(401).send({
                                "data":[],
                                "code":401,
                                "message":"Phone Number already registered.",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                              });                       
                          }
                          else
                          {
                            var device_id = await getDeviceNumber(deviceId);

                            var sql = "SELECT * FROM linkeduser_devices WHERE deviceId = ?";

                            env.con.query(sql, [device_id] ,async function (err, rows, fields)
                            {
                                if(rows.length > 0)
                                {
                                    res.status(401).send({
                                      "data":[],
                                      "code":401,
                                      "message":"Device already linked with other user.",
                                      "isValid":false,
                                      status:0,
                                      "type":"FAILED"
                                    });                            
                                }
                                else
                                {
                                    var device_id = await getDeviceNumber(deviceId);

                                    if(device_id != "")
                                    {
                                        /////Send email to user'

                                        env.emailFunc.sendOTP(2, email, otp);
                                        
                                        res.send({
                                          "data":[{"otp":otp}],
                                          "code":res.statusCode,
                                          "message":"Email sent sucessfully.",
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
                                          "message":"Device Id not available.",
                                          "isValid":false,
                                          status:0,
                                          "type":"FAILED"
                                        });                                      
                                    }                                  
                                                                                                          
                                }
                            });
                          }
                      }); 
                                           
                  }
              });                                        
          }            
        });      

      }catch (error) {
          res.send(error);
      }
    },

    //////SaveUser
    saveUser : (req,res) => {
      try {

        const data = env.Joi.object().keys({
          name : env.Joi.string().required(),
          email : env.Joi.string().email().required(),
          phoneNumber : env.Joi.string().required(),
          deviceId : env.Joi.string().required(),
          password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required(),
          cnf_password : env.Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{1,100}$/).required(),
          fcm_token : env.Joi.string().required()
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
              var name = req.body.name;
              var email = req.body.email;
              var phoneNumber = req.body.phoneNumber;
              var deviceId = req.body.deviceId;
              var pass = req.body.password;
              var cnf_pass = req.body.cnf_pass;
              var password = env.fn.getHashValue(req,res,pass);
              var fcm_token = req.body.fcm_token;

              var sql = "SELECT * FROM users WHERE email = ?";

              env.con.query(sql, [email] ,function (err, rows, fields)
              {
                  if(rows.length > 0)
                  {
                      res.status(401).send({
                        "data":[],
                        "code":401,
                        "message":"Email already registered.",
                        "isValid":false,
                        status:0,
                        "type":"FAILED"
                      });
                  }
                  else
                  {
                      var sql = "SELECT * FROM users WHERE phoneNumber = ?";

                      env.con.query(sql, [phoneNumber] ,async function (err, rows, fields)
                      {
                          if(rows.length > 0)
                          {
                              res.status(401).send({
                                "data":[],
                                "code":401,
                                "message":"Phone Number already registered.",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                              });                            
                          }
                          else
                          {

                            var device_id = await getDeviceNumber(deviceId);

                            var sql = "SELECT * FROM linkeduser_devices WHERE deviceId = ?";

                            env.con.query(sql, [device_id] ,async function (err, deviceData, fields)
                            {
                                if(deviceData.length > 0)
                                {
                                    res.status(401).send({
                                      "data":[],
                                      "code":401,
                                      "message":"Device already linked with other user.",
                                      "isValid":false,
                                      status:0,
                                      "type":"FAILED"
                                    });                            
                                }
                                else
                                {

                                    var device_id = await getDeviceNumber(deviceId);

                                    if(device_id != "")
                                    {
                                        /////Save user in database
                                                                            
                                        const token = env.Jwt.sign({email}, 'login', {});
                                            
                                        var sql = "INSERT INTO users (name,email,phoneNumber,verified,password,token,fcm_token,status) VALUES ?";
                                        var values = [[name,email,phoneNumber,true,password,token,fcm_token,1]];

                                        env.con.query(sql, [values] ,function (err, rows, fields)
                                        {
                                            if(!err)
                                            {
                                                var sql = "SELECT * FROM users WHERE email = ? AND phoneNumber = ?";

                                                env.con.query(sql, [email,phoneNumber] ,async function (err, userdata, fields) {
                                                    if(!err)
                                                    {
                                                        var device_id = await getDeviceNumber(deviceId);

                                                        var sql = "INSERT INTO linkeduser_devices (user_id,deviceId,type) VALUES ?";
                                                        var values = [[userdata[0].user_id,device_id,"owner"]];
                                                        
                                                        env.con.query(sql, [values] ,function (err, rows, fields)
                                                        {
                                                            if(!err)
                                                            {
                                                                var sql = "UPDATE devices SET status=? WHERE device_number=?";
              
                                                                env.con.query(sql, ["Linked",deviceId],function (err, rows, fields)
                                                                {
                                                                    if(!err)
                                                                    {
                                                                        var sql = "SELECT * FROM users WHERE email = ?";
                            
                                                                        env.con.query(sql , [email],function (err, users, fields) 
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
                                                                                    "message":"User signed up sucessfully.",
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
                                                })
                                            }
                                        });
                                    }
                                    else
                                    {
                                        res.status(401).send({
                                          "data":[],
                                          "code":401,
                                          "message":"Device Id not available.",
                                          "isValid":false,
                                          status:0,
                                          "type":"FAILED"
                                        });                                      
                                    }                              
                                }
                            });
                          }
                      }); 
                                           
                  }
              });                                        
          }            
        });      

      }catch (error) {
          res.send(error);
      }
    },
}

async function getDeviceNumber(device_number){
	return new Promise( async(resolve, reject) => {

		env.con.query("SELECT * FROM devices WHERE device_number = ?",[device_number],function(err,resp){
			if(err){ console.log(err); }
      
      if(resp.length > 0)
      {
        resolve(resp[0].deviceId);
      }
      else
      {
        resolve("");
      }
      
		});
	})
}