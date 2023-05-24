var SI_SYMBOL = ["", "K", "M", "G", "T", "P", "E"];

module.exports = {

	prepareMessage:(string,obj) => {

	    var s = string;

		for(var prop in obj) {
			s = s.replace(new RegExp('{'+ prop +'}','g'), obj[prop]);
		}
		
		return s;
	},
	
	getDateTime:(date) => {

		if(date){
        	var date_ob = new Date(date);
        }else{
        	var date_ob = new Date();
        }

		var day = ("0" + date_ob.getDate()).slice(-2);
		var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
		var year = date_ob.getFullYear();
		var hours = date_ob.getHours();
		var minutes = date_ob.getMinutes();
		var seconds = date_ob.getSeconds();

		var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

		return dateTime;
	},

	getDate:() => {

        var date_ob = new Date();

		var day = ("0" + date_ob.getDate()).slice(-2);
		var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
		var year = date_ob.getFullYear();
		
		var dateTime = year + "-" + month + "-" + day;

		return dateTime;
	},	

	getTime:() => {

        var date_ob = new Date();

		var hours = date_ob.getHours();
		var minutes = date_ob.getMinutes();
		var seconds = date_ob.getSeconds();

		var dateTime = hours + ":" + minutes + ":" + seconds;

		return dateTime;
	},

	dateFormat:(date) =>{
	
		var date_ob = new Date(date);

		var day = ("0" + date_ob.getDate()).slice(-2);
		var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
		var year = date_ob.getFullYear();
		
		var dateTime = year + "-" + month + "-" + day;

		return dateTime;
	},
}