var env = require('../../constants');
const generalFunc = require('../../functions/general');
const email = require('../../functions/email');

module.exports = {

	view: async(req,res) => {

		res.render('email_management',{ title: 'Email Management', data: {} });
		return;
	},

	getTemplete: async(req,res) => {
		var data = [];
		var param = [];
		var record = [];
		var recordsTotal = 0;
		var recordsFiltered = 0;

		var q = "SELECT * FROM email_template ORDER BY id ASC ";
				
		recordsTotal = await getDatatableRecord(q);
		recordsFiltered = recordsTotal;

		if(req.body.length != -1){
            q += " LIMIT "+req.body.start+","+req.body.length;
        }

		env.con.query(q,function(err,result){
			if(err){ console.log(err); }

			if(result.length > 0){
				
				let wrapper = result.map(async(row,index) => {
					return new Promise( async(resolve, reject) => {
						                  
						var action = '<div class="btn-icon-list btn-list"><a href="'+prefix+'/editEmailTemplete?id='+row.id+'" class="btn btn-icon btn-outline-primary"><i class="fe fe-edit"></i></a></div>';

					  	record.push({
							"name":row.name,
							"subject":row.subject,
							"action":action
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

	editEmailTemplete: async(req,res) => {

		var id = req.query.id;
		if(!id){
			req.session.message = {status:'error',info:"Invalid request."};
			res.redirect(prefix+'/emailManagement');
			return;
		}else{

			env.con.query("SELECT * FROM email_template WHERE id = ?",[id], async function(emailErr,emailResult){
				if(emailErr){ console.log(emailErr); }
				
				if(emailResult.length > 0){
				
					res.render('edit_email_template',{ title: 'Update Email Template',data: {
						email:emailResult[0]
					}});
					return;					
				}else{
					req.session.message = {status:'error',info:"Email template not found."};
					res.redirect(prefix+'/emailManagement');
					return;
				}
			})
		}
	},

	updateEmailTemplate: (req,res) => {
		
		var param = req.body;
		if(!param.id || !param.name || !param.subject || !param.message){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/editEmailTemplete?id='+param.id);
			return;
		}else{
			
			var userId = req.session.userId;
			var userName = req.session.name;
			
			env.con.query("UPDATE email_template SET name = ?, subject = ?, message = ? WHERE id = ?",[param.name, param.subject, param.message, param.id],function(err,resp){
				
				if(err){
					req.session.message = {status:'error',info:"Error on updating templete."};
					res.redirect(prefix+'/emailManagement');
					return;
				}else{

					req.session.message = {status:'success',info:"Email templete updated successfully."};
					res.redirect(prefix+'/emailManagement');
					return;
				}
			})
		}
	},

	sendEmail: async(req,res) => {

		var emails = await getUserEmails('All',[],'all');
		res.render('send_email',{ title: 'Send Email', data: {
			"emails": emails
		}});
		return;
	},

	sendEmailNotification: async(req,res) => {
		param = req.body;
		console.log(param)
		if(!param.email || !param.subject || !param.message){
			req.session.message = {status:'error',info:"Missing arguments."};
			res.redirect(prefix+'/sendEmail');
			return;
		}else{
			var message = param.message.replace(/\n/g, "<br />")
			email.sendGeneralEmail(param.email, param.subject, message);
			req.session.message = {status:'success',info:"Email send successfully."};
			res.redirect(prefix+'/sendEmail');
		}
	},

	getFilteredEmail: async(req,res) => {
		var param = req.body;
		
		var accountStatus = param.accountStatus;
		
		var emails = [];
		
		emails = await getUserEmails('All',[],accountStatus);
		
		var options = '';
		emails.forEach(function(row,index){
			options += '<option value="'+row.email+'">'+row.name+' ('+row.email+')</option>';
		})

		res.send({'options':options});
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

async function getUserEmails(type,userId,accountStatus){
	return new Promise( async(resolve, reject) => {

		var query = "SELECT name,email FROM users ";

		if(userId.length > 0){
			query += "WHERE id IN ("+userId+")";
		}

		if(accountStatus != 'all'){
			query += "WHERE status = '"+accountStatus+"'";
		}

		query += " ORDER BY name";

		env.con.query(query,function(err,resp){
			if(err){ console.log(err); }
			resolve(resp);
		});
	})
}