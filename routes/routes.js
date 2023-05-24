var express = require('express');
var router = express.Router();
var env = require('../constants');
var authMiddleware = require('../middleware/authMiddleware')
const signupController = require('../controllers/signupController');
const signinController = require('../controllers/signinController');
const settingsController = require('../controllers/settingsController');
const homeController = require('../controllers/homeController');


/////////////////////////////////////Sign up user/////////////////////////////////////////

////Signup User
router.post('/signupUser', signupController.signupUser);
router.post('/saveUser', signupController.saveUser);



/////////////////////////////////////Sign in user/////////////////////////////////////////

////Signin User
router.post('/signinUser', signinController.signinUser);

////Check email exists or not
router.post('/checkEmail', signinController.checkEmail);

////Reset Password
router.post('/resetPassword', signinController.resetPassword);



/////////////////////////////////////Splash screen////////////////////////////////////////

////Splash screen
router.post('/getSplashScreenData',authMiddleware.AuthMiddleware(), settingsController.getSplashScreenData);



/////////////////////////////////////Settings/////////////////////////////////////////

////Update Profile
router.post('/updateProfile',authMiddleware.AuthMiddleware(), settingsController.updateProfile);

/////Get profile image
router.get('/getProfileImage/:name', settingsController.getProfileImage);

////Change Password
router.post('/changePassword',authMiddleware.AuthMiddleware(), settingsController.changePassword);

//////Add Emergency contact
router.post('/addEmergencyContact',authMiddleware.AuthMiddleware(), settingsController.addEmergencyContact);

//////Update Emergency contact
router.post('/updateEmergencyContact',authMiddleware.AuthMiddleware(), settingsController.updateEmergencyContact);

//////Get all Emergency contact
router.post('/getEmergencyContact',authMiddleware.AuthMiddleware(), settingsController.getEmergencyContact);

//////Delete Emergency contact
router.post('/deleteEmergencyContact',authMiddleware.AuthMiddleware(), settingsController.deleteEmergencyContact);

//////Invite A Friend
router.post('/inviteFriend',authMiddleware.AuthMiddleware(), settingsController.inviteFriend);

//////Get Invited Friend List
router.post('/getinviteFriendList',authMiddleware.AuthMiddleware(), settingsController.getinviteFriendList);

/////Delete invited friend
router.post('/deleteInvitedFriend',authMiddleware.AuthMiddleware(), settingsController.deleteInvitedFriend);

////Logout
router.post('/logout', authMiddleware.AuthMiddleware() ,settingsController.logout);


/////////////////////////////////////Homescreen device api/////////////////////////////////////////

////Get Device Location
router.post('/getDeviceLocation',authMiddleware.AuthMiddleware(), homeController.getDeviceLocation);

////Send test push notification
router.post('/sendTestPushNotification', homeController.sendTestPushNotification);

////Send location to device from socket
router.post('/sendLocationMode',authMiddleware.AuthMiddleware(), homeController.sendLocationMode);


module.exports = router;