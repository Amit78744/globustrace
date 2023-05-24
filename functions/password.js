const bcrypt = require('bcryptjs');

module.exports = {

	createPassword:function($password,$saltRounds=10,callback){

		bcrypt.hash($password, $saltRounds, function(err, hash) {
		  if(err){ 
		  	callback(err, null); 
		  } else {
		  	callback(null, hash); 
		  }
		});
	},

	comparePassword:function($password,$hash,callback){

		bcrypt.compare($password, $hash, function(err, result) {
		    callback(result);
		});
	},

	getRandomString:(length) => {
	    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	    var result = '';
	    for ( var i = 0; i < length; i++ ) {
	        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
	    }
	    return result;
	}
}