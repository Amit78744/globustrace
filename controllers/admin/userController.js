var env = require('../../constants');
const generalFunc = require('../../functions/general');
const password = require('../../functions/password');
const emailFunc = require('../../functions/email');
const reader = require('xlsx');

module.exports = {

	////Admin Users
	view: (req,res) => {

		env.con.query("SELECT * FROM roles ORDER BY name DESC",function(err,result){
			if(err){ console.log(err); }

			res.render('admin_users',{ title: 'Manage Globustrace Users',data: {roles:result}});
			return;
		})
	},

	getUsers: async(req,res) => {
		var data = [];
		var param = [];
		var record = [];
		var recordsTotal = 0;
		var recordsFiltered = 0;

		var q = "SELECT u.*, r.name FROM admin_users as u, roles as r WHERE u.role = r.roleId ";
		var q1 = "SELECT u.*, r.name FROM admin_users as u, roles as r ORDER BY u.id DESC";
		
		recordsTotal = await getDatatableRecord(q1);
				
		if(req.body.keyword){
            q += "AND (firstName LIKE "+env.con.escape('%'+req.body.keyword+'%')+" OR lastName LIKE "+env.con.escape('%'+req.body.keyword+'%')+" OR email LIKE "+env.con.escape('%'+req.body.keyword+'%')+" OR phoneNumber LIKE "+env.con.escape('%'+req.body.keyword+'%')+")";
        }

        if(req.body.status){
        	if(req.body.status != 'All'){
            	q += " AND u.status = '"+req.body.status+"' ";
        	}
        }

        if(req.body.role){
        	if(req.body.role != 'All'){
            	q += " AND u.role = '"+req.body.role+"' ";
        	}
        }

        q += ' ORDER BY u.id DESC';

		recordsFiltered = await getDatatableRecord(q);

		if(req.body.length != -1){
            q += " LIMIT "+req.body.start+","+req.body.length;
        }

		env.con.query(q,function(err,result){
			if(err){ console.log(err); }

			if(result.length > 0){

				var no = 1;

				for(i = 0; i < result.length; i++)
				{
					var menu = "";
					var isActive = "";
					var className = "";
					var submenu = "";
					var disabled = "";

					if(req.session.userId == result[i].id){
						disabled = "disabled";
					}

					if(result[i].status == 'Active'){
						isActive = "Active";
						className = 'btn-success';
						submenu = '<a class="dropdown-item" href="'+prefix+'/adminUserStatusChange?id='+result[i].id+'&status=Inactive">Inactive</a>';
					}else{
						isActive = "Inactive";
						className = 'btn-danger';
						submenu = '<a class="dropdown-item" href="'+prefix+'/adminUserStatusChange?id='+result[i].id+'&status=Active">Active</a>';
					}

					if(!checkPermission('createUsers')){
						disabled = "disabled";
					}

					menu += '<div class="dropdown">';
					menu += '<button type="button" '+disabled+' class="btn '+className+' btn-sm dropdown-toggle status-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+isActive+'</button>';
					if(req.session.roles.includes('createUsers')){
						menu += '<div class="dropdown-menu">'+submenu+'</div>';
					}
					menu += '</div>';

					var action = '<div class="btn-icon-list btn-list">';

					if(req.session.userId != result[i].id){
						if(req.session.roles.includes('createUsers')){
							action += '<a href="'+prefix+'/editUser?id='+result[i].id+'" class="btn btn-icon btn-outline-primary"><i class="fe fe-edit"></i></a>';
							action += '<button type="button" class="btn btn-icon btn-outline-danger" onclick="deleteUser('+result[i].id+')"><i class="fe fe-trash"></i></button>';
						}
					}

					action += '</div>';

					var countryCode = "";
					if(result[i].countryCode){
						countryCode = "+"+result[i].countryCode;
					}					

					var userData = {"firstName": result[i].firstName,"lastName":result[i].lastName,"email":result[i].email,"phoneNumber":countryCode+' '+result[i].phoneNumber,"role":result[i].name,"menu":menu,"lastLoggedIn":((result[i].lastLoggedIn) ? generalFunc.getDateTime(result[i].lastLoggedIn) : '-'),"action":action};

					data.push(userData);

				}
				
				let wrapper = data.map((row,index) => {

					return new Promise((resolve, reject) => {
     
					  	record.push({
							"firstName":row.firstName,
							"lastName":row.lastName,
							"email":row.email,
							"phone":row.phoneNumber,
							"role":row.role,
							"status":row.menu,
							"lastLoggedIn":row.lastLoggedIn,
							"action":row.action
						});

						resolve(record);
					});

				});

				Promise.all(wrapper).then((results) => {
					data = {
						"draw": req.body.draw,
						"recordsTotal": recordsTotal,
						"recordsFiltered": recordsFiltered,
						"data": record
					}
					res.json(data);
				})
			}else{

				data = {
					"draw": req.body.draw,
					"recordsTotal": recordsTotal,
					"recordsFiltered": recordsFiltered,
					"data": record
				}
	
				res.json(data);
			}
		});
	},

	createUser: (req,res) => {

		env.con.query("SELECT * FROM roles ORDER BY name",function(err,result){
			if(err){ console.log(err); }

			env.con.query("SELECT nicename, phonecode FROM country_code ORDER BY nicename",function(countryErr,countryResult){
				if(countryErr){ console.log(countryErr); }

				res.render('create_user',{ title: 'Create Globustrace',data: {
					roles:result,
					countries:countryResult
				}});
				return;
			})
		})
	},

	saveAdminUser: (req,res) => {
		
		var param = req.body;
		if(!param.firstName || !param.lastName || !param.email || !param.countryCode || !param.phone || !param.role){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/createUser');
			return;
		}else{
			let firstName = param.firstName;
			let lastName = param.lastName;
			let email = param.email;
			let countryCode = param.countryCode;
			let phone = param.phone;
			let role = param.role;
			let status = "Active";
			
			var userId = req.session.userId;

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
				if(userErr){ console.log(userErr); }
			
				env.con.query("SELECT * FROM admin_users WHERE email = ?",[email],function(err,result){
					if(err){ console.log(err); }

					if(result.length <= 0){
						var randomPassword = password.getRandomString(10);
						password.createPassword(randomPassword,10,function(error,hash){

							env.con.query("INSERT INTO admin_users(firstName,lastName,email,countryCode,phoneNumber,password,role,status)VALUES(?,?,?,?,?,?,?,?)",[firstName,lastName,email,countryCode,phone,hash,role,status],function(err,resp){
								
								if(err){
									req.session.message = {status:'error',info:"Error on creating Globustrace."};
									res.redirect(prefix+'/admin_users');
									return;
								}else{

									emailFunc.userCredentials(1, firstName+' '+lastName, email, '+'+countryCode+' '+phone,randomPassword);
									req.session.message = {status:'success',info:"Globustrace created successfully."};
									res.redirect(prefix+'/admin_users');
									return;
								}
							})
						})
					}else{
						req.session.message = {status:'error',info:"Email already exist."};
						res.redirect(prefix+'/createUser');
						return;
					}
				})
			})
		}
	},

	editUser: (req,res) => {

		var id = req.query.id;
		if(!id){
			req.session.message = {status:'error',info:"Invalid request."};
			res.redirect(prefix+'/admin_users');
			return;
		}else{

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[id],function(userErr,userResult){
				if(userErr){ console.log(userErr); }

				if(userResult.length > 0){
					env.con.query("SELECT * FROM roles ORDER BY name",function(err,result){
						if(err){ console.log(err); }

						env.con.query("SELECT nicename, phonecode FROM country_code ORDER BY nicename",function(countryErr,countryResult){
						if(countryErr){ console.log(countryErr); }

							res.render('edit_user',{ title: 'Update Globustrace',data: {
								user:userResult[0],
								roles:result,
								countries:countryResult
							}});
							return;
						})
					})
				}else{
					req.session.message = {status:'error',info:"Globustrace not found."};
					res.redirect(prefix+'/admin_users');
					return;
				}
			})
		}
	},

	updateUser: (req,res) => {
		
		var param = req.body;
		if(!param.id || !param.firstName || !param.lastName || !param.email || !param.countryCode  || !param.phone || !param.role || !param.status){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/editUser?id='+param.id);
			return;
		}else{
			let id = param.id;
			let firstName = param.firstName;
			let lastName = param.lastName;
			let email = param.email;
			let countryCode = param.countryCode;
			let phone = param.phone;
			let role = param.role;
			let status = param.status;
			
			var userId = req.session.userId;

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
				if(userErr){ console.log(userErr); }
			
				env.con.query("SELECT * FROM admin_users WHERE email = ? AND id != ?",[email,id],function(err,result){
					if(err){ console.log(err); }

					if(result.length <= 0){

						env.con.query("UPDATE admin_users SET firstName = ?, lastName = ?, email = ?, countryCode = ?, phoneNumber = ?, role = ?, status = ? WHERE id = ?",[firstName,lastName,email,countryCode,phone,role,status,id],function(err,resp){
							
							if(err){
								req.session.message = {status:'error',info:"Error on updating Globustrace."};
								res.redirect(prefix+'/admin_users');
								return;
							}else{

								req.session.message = {status:'success',info:"Globustrace updated successfully."};
								res.redirect(prefix+'/admin_users');
								return;
							}
						})
						
					}else{
						req.session.message = {status:'error',info:"Email already exist."};
						res.redirect(prefix+'/editUser?id='+param.id);
						return;
					}
				})
			})
		}
	},

	deleteUser : (req,res) => {
		var userId = req.session.userId;

		env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
			if(userErr){ console.log(userErr); }

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[req.body.id],function(err,result){

				env.con.query("DELETE FROM admin_users WHERE id = ?",[req.body.id],function(err,resp){
					if(err){ console.log(err); }

					req.session.message = {status:'success',info:"Globustrace deleted successfully."};
					res.send('success');
					return;
				})
			})
		})
	},

	adminUserStatusChange : (req,res) => {
		let id = req.query.id;
		let status = req.query.status;
		var userId = req.session.userId;

		env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
			if(userErr){ console.log(userErr); }
			
			env.con.query("SELECT * FROM admin_users WHERE id = ?",[id],function(err,result){
				
				env.con.query("UPDATE admin_users SET status = ? WHERE id = ?",[status,id],function(err,resp){
					if(err){ console.log(err); }

					req.session.message = {status:'success',info:"Globustrace status changed successfully."};
					res.redirect(prefix+'/admin_users');
					return;
				})
			})
		})
	},

	exportUser : (req,res) => {

		var keyword = req.query.keyword;
		var status = req.query.status;
		var role = req.query.role;
		var userId = req.session.userId;
		var userName = req.session.name;

		var userQuery = "SELECT u.*, r.name, u.createdAt as createdDate, u.updatedAt as updatedDate FROM admin_users as u, roles as r WHERE u.role = r.roleId ";

		if(keyword){
			userQuery += "AND (firstName LIKE "+env.con.escape('%'+keyword+'%')+" OR lastName LIKE "+env.con.escape('%'+keyword+'%')+" OR email LIKE "+env.con.escape('%'+keyword+'%')+" OR phoneNumber LIKE "+env.con.escape('%'+keyword+'%')+")";
		}

		if(status){
        	if(status != 'All'){
            	userQuery += " AND u.status = '"+status+"' ";
        	}
        }

        if(role){
        	if(role != 'All'){
            	userQuery += " AND u.role = '"+role+"' ";
        	}
        }
		
		userQuery += " ORDER BY u.firstName ASC";

		env.con.query(userQuery,function(userErr,userResult){
			if(userErr){ console.log(userErr); }

			var userData = [];

			let wrapper = userResult.map(async(row,index) => {

				return new Promise( async(resolve, reject) => {

					var param = {
						'First name' : row.firstName,
						'Last name' : row.lastName,
						'Email' : row.email,
						'Country code' : row.countryCode,
						'Phone number' : row.phoneNumber,
						'Role' : row.name,
						'Status' : row.status,
						'Last logged in' : row.lastLoggedIn,
						'Created date' : row.createdDate,
						'Updated date' : row.updatedDate
					}

					userData.push(param);
					resolve(userData);
				})
			})

			Promise.all(wrapper).then((results) => {

				var work_sheet = reader.utils.json_to_sheet(userData,{ cellDates: true, dateNF: 'YYYY-MM-DD HH:mm:ss' });
			    var work_book = reader.utils.book_new();
			    reader.utils.book_append_sheet(work_book, work_sheet, "Globustrace Users");
			    var buffer = reader.write(work_book, { bookType: 'csv', type: 'buffer' });

    			res.attachment('Globustrace_users.csv');
    			return res.send(buffer);
			})

		})
	},


	////App Users

	viewAppUser: (req,res) => {

		env.con.query("SELECT * FROM users ORDER BY user_id",function(err,result){
			if(err){ console.log(err); }

			res.render('users',{ title: 'Manage Users',data: {roles:result}});
			return;
		})
	},

	getAppUsers: async(req,res) => {
		var data = [];
		var param = [];
		var record = [];
		var recordsTotal = 0;
		var recordsFiltered = 0;

		var q = "SELECT * FROM users";
		var q1 = "SELECT * FROM users ORDER BY user_id DESC";
		
		recordsTotal = await getDatatableRecord(q1);
				
		if(req.body.keyword){
            q += " WHERE (name LIKE '%"+req.body.keyword+"%' OR email LIKE '%"+req.body.keyword+"%')";
        }

        if(req.body.status){
        	if(req.body.status != 'All' && req.body.keyword == ''){
            	q += " WHERE status = '"+req.body.status+"'";
        	}
			else if(req.body.status != 'All' && req.body.keyword != '')
			{
				q += " AND status = '"+req.body.status+"'";
			}
        }

        q += ' ORDER BY user_id DESC';

		recordsFiltered = await getDatatableRecord(q);

		if(req.body.length != -1){
            q += " LIMIT "+req.body.start+","+req.body.length;
        }

		env.con.query(q,async function(err,result){
			if(err){ console.log(err); }

			if(result.length > 0){

				var no = 1;

				for(i = 0; i < result.length; i++)
				{
					var isActive = "";
					var className = "";
					var submenu = "";

					if(result[i].status == 1){
						isActive = "Active";
						className = 'btn-success';
						submenu = '<a class="dropdown-item" href="'+prefix+'/userStatusChange?id='+result[i].user_id+'&status=0">Inactive</a>';
					}else{
						isActive = "Inactive";
						className = 'btn-danger';
						submenu = '<a class="dropdown-item" href="'+prefix+'/userStatusChange?id='+result[i].user_id+'&status=1">Active</a>';
					}

					let menu = '<div class="dropdown">';
					menu += '<button type="button" class="btn '+className+' btn-sm dropdown-toggle status-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+isActive+'</button>';
					menu += '<div class="dropdown-menu">'+submenu+'</div></div>';
   
					var linkedUser = await getLinkedUser(result[i].user_id);
					var device_number = "";

					if(linkedUser != "")
					{
						device_number = await getDeviceNumber(linkedUser);
					}					

					var userData = {"name": result[i].name,"email":result[i].email,"phoneNumber":result[i].phoneNumber,"device_number":device_number,"status":menu};

					data.push(userData);

				}
				
				let wrapper = data.map(async(row,index) => {

					return new Promise( async(resolve, reject) => {

					  	record.push({
							"name":row.name,
							"email":row.email,
							"phone_number":row.phoneNumber,
							"device_id":row.device_number,
							"status":row.status
						});

						resolve(record);
					});

				});

				Promise.all(wrapper).then((results) => {
					data = {
						"draw": req.body.draw,
						"recordsTotal": recordsTotal,
						"recordsFiltered": recordsFiltered,
						"data": record
					}
					res.json(data);
				})
			}else{

				data = {
					"draw": req.body.draw,
					"recordsTotal": recordsTotal,
					"recordsFiltered": recordsFiltered,
					"data": record
				}
	
				res.json(data);
			}
		});
	},

	userStatusChange : (req,res) => {
		let userId = req.query.id;
		let status = req.query.status;

		env.con.query("SELECT * FROM users WHERE user_id = ?",[userId],function(userErr,userResult){
			if(userErr){ console.log(userErr); }
			
			env.con.query("UPDATE users SET status = ? WHERE user_id = ?",[status,userId],function(err,resp){
				if(err){ console.log(err); }

				req.session.message = {status:'success',info:"User status changed successfully."};
				res.redirect(prefix+'/users');
				return;
			})
		})
	},
}

async function getDatatableRecord(query){
	return new Promise( async(resolve, reject) => {

		env.con.query(query,function(err,resp){
			if(err){ console.log(err); }
			resolve(resp.length);
		});
	})
}

async function getLinkedUser(user_id){
	return new Promise( async(resolve, reject) => {

		env.con.query("SELECT * FROM linkeduser_devices WHERE user_id = ?",[user_id],function(err,resp){
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

async function getDeviceNumber(deviceId){
	return new Promise( async(resolve, reject) => {

		env.con.query("SELECT * FROM devices WHERE deviceId = ?",[deviceId],function(err,resp){
			if(err){ console.log(err); }
			resolve(resp[0].device_number);
		});
	})
}