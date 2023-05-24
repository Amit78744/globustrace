var env = require('../../constants');
const generalFunc = require('../../functions/general');
const reader = require('xlsx');

module.exports = {

	view: (req,res) => {
		res.render('roles',{ title: 'Manage Roles'});
		return;
	},

	getRoles: async(req,res) => {
		var data = [];
		var param = [];
		var record = [];
		var recordsTotal = 0;
		var recordsFiltered = 0;

		var q = "SELECT * FROM roles WHERE 1=1";
		var q1 = "SELECT * FROM roles ORDER BY roleId DESC";
		
		recordsTotal = await getDatatableRecord(q1);
				
		if(req.body.keyword){
            q += " AND name LIKE '%"+req.body.keyword+"%'";
        }

        q += ' ORDER BY roleId DESC';

		recordsFiltered = await getDatatableRecord(q);

		if(req.body.length != -1){
            q += " LIMIT "+req.body.start+","+req.body.length;
        }

		env.con.query(q,function(err,result){
			if(err){ console.log(err); }

			if(result.length > 0){

				let i = 1;
				
				let wrapper = result.map(async(row,index) => {

					return new Promise( async(resolve, reject) => {

						var action = '<div class="btn-icon-list btn-list">';
						
						if(req.session.roles.includes('createRoles')){
							action += '<a href="'+prefix+'/editRole?id='+row.roleId+'" class="btn btn-icon btn-outline-primary"><i class="fe fe-edit"></i></a>';
							action += '<button type="button" class="btn btn-icon btn-outline-danger" onclick="deleteRole('+row.roleId+')"><i class="fe fe-trash"></i></button>';
						}
						
						action += '</div>';

						var account_roles = '<i class="fe fe-x text-danger font-size-20"></i>';
						var device_roles = '<i class="fe fe-x text-danger font-size-20"></i>';
						var system_roles = '<i class="fe fe-x text-danger font-size-20"></i>';

						var roles = row.roles;
						var roleList = roles.split(',');

						if(roleList.includes("viewUsers") || roleList.includes("viewClients")){
							account_roles = '<i class="fe fe-check text-success font-size-20"></i>';
						}

						if(roleList.includes("viewDevices")){
							device_roles = '<i class="fe fe-check text-success font-size-20"></i>';
						}

						if(roleList.includes("viewNotifications") || roleList.includes("viewFeedbacks") || roleList.includes("viewSettings") || roleList.includes("viewSystemLogs")){
							system_roles = '<i class="fe fe-check text-success font-size-20"></i>';
						}

					  	record.push({
							"role":row.name,
							"account":account_roles,
                            "device":device_roles,
                            "system":system_roles,
							"action":action
						});

						resolve(result);
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

	createRole: (req,res) => {
		res.render('create_role',{ title: 'Create Role'});
		return;
	},

	editRole: (req,res) => {

		var id = req.query.id;
		if(!id){
			req.session.message = {status:'error',info:"Invalid request."};
			res.redirect(prefix+'/roles');
			return;
		}else{

			env.con.query("SELECT * FROM roles WHERE roleId = ?",[id],function(err,result){
				if(err){ console.log(err); }

				if(result.length > 0){
					var roles = result[0].roles;
					var roleList = roles.split(',');

					res.render('edit_role',{ title: 'Update Role', data: { 
						'roleId' : id, 
						'roleName' : result[0].name, 
						'roles' : roleList
					}});
					return;
				}else{
					req.session.message = {status:'error',info:"Role not found."};
					res.redirect(prefix+'/roles');
					return;
				}

			})
		}
	},

	saveRole: (req,res) => {
		
		var param = req.body;
		if(!param.name || !param.roles){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/createRole');
			return;
		}else{
			let name = param.name;
			let roles = param.roles;
			var roleList = roles.join();
			var userId = req.session.userId;

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
				if(userErr){ console.log(userErr); }
			
				env.con.query("SELECT * FROM roles WHERE name = ?",[name],function(err,result){
					if(err){ console.log(err); }

					if(result.length <= 0){
						env.con.query("INSERT INTO roles(name,roles)VALUES(?,?)",[name,roleList],function(err,resp){
							
							if(err){
								req.session.message = {status:'error',info:"Error on creating role."};
								res.redirect(prefix+'/roles');
								return;
							}else{

								req.session.message = {status:'success',info:"Role created successfully."};
								res.redirect(prefix+'/roles');
								return;
							}
						})
					}else{
						req.session.message = {status:'error',info:"Role name already exist."};
						res.redirect(prefix+'/roles');
						return;
					}
				})
			})
		}
	},

	updateRole: (req,res) => {
		
		var param = req.body;
		if(!param.roleId || !param.name || !param.roles){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/createRole');
			return;
		}else{
			let id = param.roleId;
			let name = param.name;
			let roles = param.roles;
			var roleList = roles.join();
			var userId = req.session.userId;

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
				if(userErr){ console.log(userErr); }
			
				env.con.query("SELECT * FROM roles WHERE name = ? AND roleId != ?",[name,id],function(err,result){
					if(err){ console.log(err); }

					if(result.length <= 0){
						env.con.query("UPDATE roles SET name = ?,roles = ? WHERE roleId = ?",[name,roleList,id],function(err,resp){
							
							if(err){
								req.session.message = {status:'error',info:"Error on updating role."};
								res.redirect(prefix+'/roles');
								return;
							}else{

								req.session.message = {status:'success',info:"Role updated successfully."};
								res.redirect(prefix+'/roles');
								return;
							}
						})
					}else{
						req.session.message = {status:'error',info:"Role name already exist."};
						res.redirect(prefix+'/roles');
						return;
					}
				})
			})
		}
	},

	deleteRole : (req,res) => {
		var userId = req.session.userId;

		env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
			if(userErr){ console.log(userErr); }

			env.con.query("SELECT * FROM roles WHERE roleId = ?",[req.body.id],function(err,result){

				env.con.query("DELETE FROM roles WHERE roleId = ?",[req.body.id],function(err,resp){
					if(err){ console.log(err); }

					req.session.message = {status:'success',info:"Role deleted successfully."};
					res.send('success');
					return;
				})
			})
		})
	},

	exportRole : (req,res) => {

		var userId = req.session.userId;
		var userName = req.session.name;

		var roleQuery = "SELECT * FROM roles ORDER BY roleId DESC";
		env.con.query(roleQuery,function(roleErr,roleResult){
			if(roleErr){ console.log(roleErr); }

			var roleData = [];

			let wrapper = roleResult.map(async(row,index) => {

				return new Promise( async(resolve, reject) => {

					var roles = row.roles;
					var roleList = roles.split(',');

					var TAM_Users = "";
					if(roleList.includes("viewUsers")){	TAM_Users += 'View, '; }
					if(roleList.includes("createUsers")){ TAM_Users += 'Create/Delete, '; }

					var Subscribers = "";
					if(roleList.includes("viewClients")){ Subscribers += 'View, '; }
					if(roleList.includes("createClients")){ Subscribers += 'Create/Delete, '; }

					var Email_Management = "";
					if(roleList.includes("viewNotifications")){ Email_Management += 'View, '; }
					if(roleList.includes("sendNotifications")){ Email_Management += 'Send, '; }
					if(roleList.includes("downloadNotifications")){ Email_Management += 'Download, '; }

					var Settings = "";
					if(roleList.includes("viewSettings")){ Settings += 'View, '; }
					if(roleList.includes("downloadSettings")){ Settings += 'Download, '; }
					if(roleList.includes("updateSettings")){ Settings += 'Update, '; }
					
					var param = {
						'Role name' : row.name,
						'Globustrace Users' : TAM_Users.replace(/,\s*$/, ""),
						'All Subscribers' : Subscribers.replace(/,\s*$/, ""),
						'Email Management' : Email_Management.replace(/,\s*$/, ""),
						'Settings' : Settings.replace(/,\s*$/, ""),
						'Created At' : new Date(row.created_at),
						'Updated At' : new Date(row.updated_at),
					}

					roleData.push(param);
					resolve(roleData);
				})
			})

			Promise.all(wrapper).then((results) => {

				var work_sheet = reader.utils.json_to_sheet(roleData,{ cellDates: true, dateNF: 'YYYY-MM-DD HH:mm:ss' });
			    var work_book = reader.utils.book_new();
			    reader.utils.book_append_sheet(work_book, work_sheet, "Roles");
			    var buffer = reader.write(work_book, { bookType: 'csv', type: 'buffer' });

			    res.attachment('roles.csv');
    			return res.send(buffer);
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