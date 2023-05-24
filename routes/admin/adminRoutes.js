var express = require('express');
var router = express.Router();

/* Import Auth Middleware */
const {authentication, routeAuthentication} = require('../../functions/auth');

/* Import Controllers */
const homeController = require('../../controllers/admin/homeController');
const adminController = require('../../controllers/admin/adminController');
const roleController = require('../../controllers/admin/roleController');
const userController = require('../../controllers/admin/userController');
const emailController = require('../../controllers/admin/emailController');
const deviceController = require('../../controllers/admin/deviceController');


/* Routers */

// Authentication
router.get('/login', adminController.login);
router.post('/checkLogin', adminController.checkLogin);
router.get('/logout', authentication, adminController.logout);
router.get('/changePassword', authentication, adminController.changePassword);
router.post('/changePassword', authentication, adminController.checkChangePassword);

// Webhook url
router.post('/webhook', adminController.webhook);

// Home
router.get('/', authentication, homeController.view);

// Admin Users
router.get('/admin_users', [authentication, routeAuthentication('viewUsers')], userController.view);
router.post('/getUsers', authentication, userController.getUsers);
router.get('/createUser', [authentication, routeAuthentication('createUsers')], userController.createUser);
router.post('/saveAdminUser', authentication, userController.saveAdminUser);
router.get('/editUser', [authentication, routeAuthentication('createUsers')], userController.editUser);
router.post('/updateUser', authentication, userController.updateUser);
router.post('/deleteUser', authentication, userController.deleteUser);
router.get('/adminUserStatusChange', authentication, userController.adminUserStatusChange);
router.get('/exportUser', [authentication, routeAuthentication('createUsers')], userController.exportUser);

// App Users
router.get('/users', [authentication, routeAuthentication('viewClients')], userController.viewAppUser);
router.post('/getAppUsers', authentication, userController.getAppUsers);
router.get('/userStatusChange', authentication, userController.userStatusChange);

// Roles
router.get('/roles', [authentication, routeAuthentication('viewRoles')], roleController.view);
router.post('/getRoles', authentication, roleController.getRoles);
router.get('/createRole', [authentication, routeAuthentication('createRoles')], roleController.createRole);
router.post('/saveRole', authentication, roleController.saveRole);
router.get('/editRole', [authentication, routeAuthentication('createRoles')], roleController.editRole);
router.post('/updateRole', authentication, roleController.updateRole);
router.post('/deleteRole', authentication, roleController.deleteRole);
router.get('/exportRole', [authentication, routeAuthentication('createRoles')], roleController.exportRole);

// Device Management
router.get('/devices', [authentication, routeAuthentication('viewDevices')], deviceController.view);
router.post('/getDevices', authentication, deviceController.getDevices);
router.get('/createDevice', [authentication, routeAuthentication('createDevices')], deviceController.createDevice);
router.post('/saveDevice', authentication, deviceController.saveDevice);
router.get('/editDevice', [authentication, routeAuthentication('createDevices')], deviceController.editDevice);
router.post('/updateDevice', authentication, deviceController.updateDevice);
router.post('/deleteDevice', authentication, deviceController.deleteDevice);
router.get('/exportDevice', [authentication], deviceController.exportDevice);
router.post('/importDevice', [authentication], deviceController.importDevice);
router.post('/getDeviceNumber', [authentication], deviceController.getDeviceNumber);

// Email Management
router.get('/emailManagement', [authentication, routeAuthentication('viewNotifications')], emailController.view);
router.post('/getTemplete', authentication, emailController.getTemplete);
router.get('/editEmailTemplete', [authentication, routeAuthentication('viewNotifications')], emailController.editEmailTemplete);
router.post('/updateEmailTemplate', authentication, emailController.updateEmailTemplate);
router.get('/sendEmail', [authentication, routeAuthentication('viewNotifications')], emailController.sendEmail);
router.post('/sendEmailNotification', authentication, emailController.sendEmailNotification);
router.post('/getFilteredEmail', authentication, emailController.getFilteredEmail);

module.exports = router;