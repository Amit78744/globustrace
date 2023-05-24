var env = require('../../constants');
const reader = require('xlsx');

module.exports = {

	////Admin Users

	view: (req,res) => {

		env.con.query("SELECT * FROM devices ORDER BY deviceId DESC",function(err,result){
			if(err){ console.log(err); }

			res.render('devices',{ title: 'Manage Devices',data: {roles:result}});
			return;
		})
	},

	getDevices: async(req,res) => {
		var data = [];
		var param = [];
		var record = [];
		var recordsTotal = 0;
		var recordsFiltered = 0;
        var deviceLinked = 0;

		var q = "SELECT d.* FROM devices as d";
		var q1 = "SELECT d.* FROM devices as d ORDER BY d.deviceId DESC";
		
		recordsTotal = await getDatatableRecord(q1);
				
		if(req.body.keyword){
            q += " WHERE (device_number LIKE "+env.con.escape('%'+req.body.keyword+'%')+")";
        }

        q += ' ORDER BY d.deviceId DESC';

		recordsFiltered = await getDatatableRecord(q);

		if(req.body.length != -1){
            q += " LIMIT "+req.body.start+","+req.body.length;
        }

		env.con.query(q,async function(err,result){
			if(err){ console.log(err); }

			if(result.length > 0){

				var data = [];

				var no = 1;

				for(i = 0; i < result.length; i++)
				{
					var deviceLinked = await getLinkedUserRecord("SELECT * FROM linkeduser_devices WHERE deviceId = "+result[i].deviceId);

					var linkedUser;
						                    
                    var action = '<div class="btn-icon-list btn-list">';

					if(req.session.userId != result[i].id && deviceLinked == 0){
						if(req.session.roles.includes('createDevices')){
							//action += '<a href="'+prefix+'/editDevice?id='+row.deviceId+'" class="btn btn-icon btn-outline-primary"><i class="fe fe-edit"></i></a>';
							action += '<button type="button" class="btn btn-icon btn-outline-primary" onclick="editDevice('+result[i].deviceId+')"><i class="fe fe-edit"></i></button>';
							action += '<button type="button" class="btn btn-icon btn-outline-danger" onclick="deleteDevice('+result[i].deviceId+')"><i class="fe fe-trash"></i></button>';
						}
					}

					if(deviceLinked.length > 0)
					{
						linkedUser = await getUser(deviceLinked[0].user_id);
					}
					else
					{
						linkedUser = "";
					}	

					action += '</div>';

					var deviceData = {"no": no++,"device_number":result[i].device_number,"status":result[i].status,"user":linkedUser,"action":action};

					data.push(deviceData);

				}
				
				let wrapper = data.map(async(row,index) => {

					return new Promise( async(resolve, reject) => {

					  	record.push({
							"no":row.no,
							"device_number":row.device_number,
							"status":row.status,
							"user":row.user,
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

    createDevice: (req,res) => {

		res.render('create_device',{ title: 'Create Device'});
        return;

	},

    saveDevice: (req,res) => {
		
		var param = req.body;
		if(!param.deviceId){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.send({msg: "error"});
			return;
		}else{
			let deviceId = param.deviceId;
			
			var userId = req.session.userId;

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
				if(userErr){ console.log(userErr); }
			
				env.con.query("SELECT * FROM devices WHERE device_number = ?",[deviceId],function(err,result){
					if(err){ console.log(err); }

					if(result.length <= 0){
						env.con.query("INSERT INTO devices(device_number,status)VALUES(?,?)",[deviceId,"Unlinked"],function(err,resp){
								
                            if(err){
                                req.session.message = {status:'error',info:"Error on creating device."};
                                res.send({msg: "error"});
                                return;
                            }else{
                                req.session.message = {status:'success',info:"Device created successfully."};
								res.send({msg: "success"});
                                return;
                            }
                        })
					}else{
						req.session.message = {status:'error',info:"Device already exist."};
                        res.send({msg: "error"});
						return;
					}
				})
			})
		}
	},

    editDevice: (req,res) => {

		var id = req.query.id;
		if(!id){
			req.session.message = {status:'error',info:"Invalid request."};
			res.redirect(prefix+'/devices');
			return;
		}else{

			env.con.query("SELECT * FROM devices WHERE deviceId = ?",[id],function(deviceErr,deviceResult){
				if(deviceErr){ console.log(deviceErr); }

				if(deviceResult.length > 0){
					res.render('edit_device',{ title: 'Update Device',data: {
                        device:deviceResult[0],
                    }});
                    return;
				}else{
					req.session.message = {status:'error',info:"Device not found."};
					res.redirect(prefix+'/devices');
					return;
				}
			})
		}
	},

    updateDevice: (req,res) => {
		
		var param = req.body;
		if(!param.id || !param.deviceId){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/editDevice?id='+param.id);
			return;
		}else{
			let id = param.id;
			let deviceId = param.deviceId;
			
			var userId = req.session.userId;

			env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
				if(userErr){ console.log(userErr); }
			
				env.con.query("SELECT * FROM devices WHERE device_number = ? AND deviceId != ?",[deviceId,id],function(err,result){
					if(err){ console.log(err); }

					if(result.length <= 0){

						env.con.query("UPDATE devices SET device_number = ? WHERE deviceId = ?",[deviceId,id],function(err,resp){
							
							if(err){
								req.session.message = {status:'error',info:"Error on updating Device."};
								res.send({msg: "error"});
								return;
							}else{

								req.session.message = {status:'success',info:"Device updated successfully."};
								res.send({msg: "success"});
								return;
							}
						})
						
					}else{
						req.session.message = {status:'error',info:"Device already exist."};
						res.send({msg: "error"});
						return;
					}
				})
			})
		}
	},

    deleteDevice : (req,res) => {
		var userId = req.session.userId;

		env.con.query("SELECT * FROM admin_users WHERE id = ?",[userId],function(userErr,userResult){
			if(userErr){ console.log(userErr); }

			env.con.query("SELECT * FROM devices WHERE deviceId = ?",[req.body.deviceId],function(err,result){

				env.con.query("DELETE FROM devices WHERE deviceId = ?",[req.body.deviceId],function(err,resp){
					if(err){ console.log(err); }

					req.session.message = {status:'success',info:"Device deleted successfully."};
					res.send('success');
					return;
				})
			})
		})
	},

	exportDevice: (req,res) => {

		var fileData = [{
			'deviceId' : ''
		}];

		var ws = reader.utils.json_to_sheet(fileData);
		var wb = reader.utils.book_new();
		reader.utils.book_append_sheet(wb, ws, "Label");
		var wbout = reader.write(wb, { bookType: 'xlsx', type: 'buffer'});

		res.setHeader('Content-disposition', 'attachment; filename=devices.xlsx');
		res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			
		res.send(new Buffer(wbout));		
	},

	importDevice: async(req,res) => {

		var postData = req.body;

		console.log(postData)
		
		console.log(req.files)
		if(!req.files){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/devices');
			return;
		}else{

			const file = reader.readFile(req.files.deviceFile.tempFilePath);
  
			const sheets = file.SheetNames[0];
			
			const deviceData = reader.utils.sheet_to_json(file.Sheets[sheets])

			var fileData = [];

			var deviceIds = await getDevices();
			var values = [];
			
			  		
			var status = "Unlinked";

			deviceData.forEach((row) => {	

				if(deviceIds.includes(row.deviceId.toString())){
					
				}else{
					var param = [env.con.escape(row.deviceId),status];
					values.push(param);
				}
	   		})

			if(values.length > 0){
				env.con.query("INSERT INTO devices(device_number,status)VALUES ?",[values],function(err,resp){
						
					if(err){
						console.log(err)
						req.session.message = {status:'error',info:"Error on creating device."};
						res.redirect(prefix+'/devices');
						return;
					}else{
						req.session.message = {status:'success',info:"Device added successfully."};
						res.redirect(prefix+'/devices');
						return;
					}
				})
			}
			else
			{
				req.session.message = {status:'success',info:"Device added successfully."};
				res.redirect(prefix+'/devices');
				return;				
			}
	  		
		}
	},

	getDeviceNumber: (req,res) => {
		
		var param = req.body;
		if(!param.deviceId){
			res.send({msg: "error",data:[]});
			return;
		}else{
			let deviceId = param.deviceId;

			env.con.query("SELECT * FROM devices WHERE deviceId = ?",[deviceId],function(err,result){
				if(err){ console.log(err); }

				if(result.length > 0){
					if(err){
						res.send({msg: "error",data: []});
						return;
					}else{
						res.send({msg: "success",data: result});
						return;
					}
				}else{
					res.send({msg: "error"});
					return;
				}
			})			
		}
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

async function getLinkedUserRecord(query){
	return new Promise( async(resolve, reject) => {

		env.con.query(query,function(err,resp){
			if(err){ console.log(err); }
			resolve(resp);
		});
	})
}

async function getUser(user_id){
	return new Promise( async(resolve, reject) => {

		env.con.query("SELECT * FROM users WHERE user_id = ?",[user_id],function(err,resp){
			if(err){ console.log(err); }
			resolve(resp[0].email);
		});
	})
}

async function getDevices(){
	return new Promise( async(resolve, reject) => {

		var deviceIds = [];

		env.con.query("SELECT device_number FROM devices",function(err,resp){
			if(err){ console.log(err); }
			if(resp.length > 0)
			{
				resp.forEach(function(row,index){
					deviceIds.push(row.device_number);
				})
				resolve(deviceIds);
			}else{
				resolve(deviceIds);
			}
			
		});
	})
}