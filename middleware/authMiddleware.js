const env = require('../constants');

module.exports = {
    
    AuthMiddleware : function(req,res){
        return function(req,res, next) {

            //console.log("AuthMiddleware middleware working");
    
            const token = req.headers["authorization"];

            if(typeof token !== 'undefined')
            {
                const bearer = token.split(" ");
                const bearerToken = bearer[1];
                req.token = bearerToken;
    
                env.Jwt.verify(req.token, 'login' , (err, authData) => {
                          if(err){
                                res.send(403,{
                                    "code":403,
                                    "message":"Token not valid.",
                                    "isValid":false,
                                    status:0,
                                    "type":"FAILED"
                                });
                           }else
                           {
                               var sql = "SELECT * FROM users WHERE user_id = ?";
                        
                                env.con.query(sql , [req.body.user_id],function (err, userData, fields)
                                {
                                    if(!err)
                                    {
                                        if(userData.length > 0)
                                        {
                                            var sql = "SELECT * FROM users WHERE user_id = ? AND token = ?";
                        
                                            env.con.query(sql , [req.body.user_id,req.token],function (err, rows, fields)
                                            {
                                                if(!err)
                                                {
                                                    if(rows.length > 0)
                                                    {
                                                        if(rows[0].verified == 0)
                                                        {
                                                            res.status(402).send({
                                                                "code":402,
                                                                "message":"This user email is not verified.",
                                                                "isValid":false,
                                                                status:0,
                                                                "type":"FAILED"
                                                            });
                                                        }
                                                        else if(rows[0].status == 0)
                                                        {
                                                            res.status(402).send({
                                                                "code":402,
                                                                "message":"This account has been deactivated.",
                                                                "isValid":false,
                                                                status:0,
                                                                "type":"FAILED"
                                                            });
                                                        }
                                                        else if(rows[0].token == req.token)
                                                        {
                                                            next();
                                                        }else{
                                                            res.status(405).send({
                                                                "code":405,
                                                                "message":"You are logged into another device.",
                                                                "isValid":false,
                                                                status:0,
                                                                "type":"FAILED"
                                                            });
                                                        }
                                                    }
                                                    else
                                                    {
                                                        res.status(405).send({
                                                            "code":405,
                                                            "message":"You are logged into another device.",
                                                            "isValid":false,
                                                            status:0,
                                                            "type":"FAILED"
                                                        });
                                                    }
                                                }
                                            });                                            
                                        }
                                        else
                                        {
                                            res.status(404).send({
                                                "code":404,
                                                "message":"User does not exist.",
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
            else
            {
                res.status(400).send({
                    "code":400,
                    "message":"Please provide authorization code.",
                    "isValid":false,
                    status:0,
                    "type":"FAILED"
                });
            }
    
        }
    },

}