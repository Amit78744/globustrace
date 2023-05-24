var env = require('../../constants');
const password = require('../../functions/password');
const generalFunc = require('../../functions/general');

module.exports = {

	login: (req,res) => {
		if(req.session.loggedin){
	        res.redirect(prefix+'/');
	        return;
	    }

		res.status(200).render('signin',{ title: 'Login',message:''});
		return;
	},

	checkLogin: (req,res) => {

		let email = req.body.email;
		let pwd = req.body.password;

		env.con.query("SELECT * FROM admin_users WHERE email = '"+email+"'",function(err,result){
			if(err){ console.log(err); }
			if(result.length > 0){
				
				password.comparePassword(pwd,result[0].password, async function(hash){
					if(hash){
						if(result[0].status == 'Active'){
							req.session.loggedin = true;
							req.session.userId = result[0].id;
							req.session.name = result[0].firstName+' '+result[0].lastName;
							req.session.roleId = result[0].role;

							var userRoles = await getUserRoles(result[0].role);
							
							if(userRoles.length > 0){
								req.session.roleName = userRoles[0].name;
								req.session.roles = userRoles[0].roles.split(',');
								userAccess = userRoles[0].roles.split(',');
							}else{
								req.session.roleName = "";
								req.session.roles = [];
							}

							env.con.query("UPDATE admin_users SET lastLoggedIn = ? WHERE id = ?",[generalFunc.getDateTime(),result[0].id],function(error,resp){
								if(err){ console.log(err); }
								
								req.session.message = {status:'success',info:"SignIn successful."};

								res.status(200).redirect(prefix+'/');
								return;
							})
						}else{
							res.status(200).render('signin',{ title: 'Login',message:'Your account is inactive'});
						}
					}else{
						res.status(200).render('signin',{ title: 'Login',message:'Invalid password'});
					}
				});
			}else{
				res.status(200).render('signin',{ title: 'Login',message:'Invalid email id'});
			}
		});
	},

	changePassword: (req,res) => {
		res.status(200).render('change_password',{ title: 'Change password'});
		return;
	},

	checkChangePassword: (req,res) => {

		let pwd = req.body.password;
		var userId = req.session.userId;

		env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,result){
			if(userErr){ console.log(userErr); }

			password.createPassword(pwd,10,function(error,hash){
				
				env.con.query("UPDATE admin_users SET password = ? WHERE id = ?",[hash,userId],function(err,resp){
					if(err){ console.log(err); }

					req.session.loggedin = false;
					req.session.userId = "";
					req.session.name = "";

					req.session.message = {status:'success',info:"Password changed successfully."};
					res.status(200).redirect(prefix+'/login');
					return;

				})
			});
		});
	},

	logout: (req,res) => {

		env.con.query("SELECT * FROM admin_users WHERE id = ?",[req.session.userId],function(err,result){

			req.session.loggedin = false;
			req.session.userId = "";
			req.session.name = "";
			req.session.message = {status:'success',info:"SignOut successfully."};
			res.status(200).redirect(prefix+'/login');
			return;

		});		
	},

	webhook: (req,res) => {
	    var a = req.body;
		env.fs.appendFile('globustracelog.txt', a.toString(), function (err) {
			if (err) {   // append failed
			}else {   // done
			}
		});
	},
}

async function getUserRoles(roleId){
	return new Promise( async(resolve, reject) => {

		env.con.query("SELECT * FROM roles WHERE roleId = ?",[roleId],function(err,resp){
			if(err){ console.log(err); }
			resolve(resp);
		});
	})
}