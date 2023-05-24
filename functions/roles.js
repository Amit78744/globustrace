module.exports = {

	checkPermission:function(permissionName){

		if(userAccess.includes(permissionName)){
			return true;
		}else{
			return false;
		}
    
	}
}