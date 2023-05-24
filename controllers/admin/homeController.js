var env = require('../../constants');

module.exports = {

	view: (req,res) => {

		env.con.query("SELECT * FROM users",function(err,appUsers){
			if(err){ console.log(err); }

			env.con.query("SELECT * FROM admin_users",function(err,adminUsers){
				if(err){ console.log(err); }

				env.con.query("SELECT * FROM devices WHERE status = 'Linked'",function(err,linkedDevices){
					if(err){ console.log(err); }

					env.con.query("SELECT * FROM devices WHERE status = 'Unlinked'",function(err,unlinkedDevices){
						if(err){ console.log(err); }
						
						res.render('home',{ title: 'Dashboard' , totalUsers : appUsers.length, totalAdminUsers : adminUsers.length, totalLinkedDevices : linkedDevices.length, totalUnlinkedDevices : unlinkedDevices.length});
						return;
					});
					
				});
				
			});
		});

		
		return;
	},
}