module.exports = {

    authentication: (req, res, next) => {
   
        if(!req.session.loggedin){
            res.redirect(prefix+'/login');
            return;
        }

        next();
    },

    routeAuthentication: (roleName) => {
        return function(req, res, next) {
            if(!checkPermission(roleName)){
                req.session.message = {status:'error',info:"Access Denied."};
                res.redirect(prefix+'/');
                return;
            }
            next();
        }
        
    }
};