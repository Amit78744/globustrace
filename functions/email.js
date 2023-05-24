const generalFunc = require('./general');
const env = require('../constants');
const con = require('../config/config');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: '465',
  secure: true,
  auth: {
      user: 'globustrace01@gmail.com',
      pass: 'qhagnhovbcxwekgt'
  }
});

module.exports = {

	userCredentials: async(templateId,name,email,phone,password) => {

		con.query("SELECT * FROM email_template WHERE id = ?",[templateId],function(err,template){
			
			var message = generalFunc.prepareMessage(template[0].message,{
    			name: name,
    			phoneNumber: phone,
    			email: email,
    			password: password
    		});

    		send(email, template[0].subject, message);
		});
	},

  sendOTP: async(templateId,email,otp) => {

		con.query("SELECT * FROM email_template WHERE id = ?",[templateId],function(err,template){
			
			var message = generalFunc.prepareMessage(template[0].message,{
    			otp: otp
    		});

    		send(email, template[0].subject, message);
		});
	},

  sendGeneralEmail: async(emails,subject,message) => {

    send(emails,subject,message);
  },

  sendEmail: async(email,subject,message) => {

    var mailOptions = {
      from: 'globustrace01@gmail.com',
      to: email,
      subject: subject,
      html: message
    };

    transporter.sendMail(mailOptions, function(error, info){});
  },

}

async function send(email,subject,message)
{
    var message = message.replace(/\n/g, "<br />");

    var mailOptions = {
        from: 'globustrace01@gmail.com',
        to: email,
        subject: subject,
        html: message
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) 
        {
            console.log(error);
        } 
        else 
        {
            console.log('Email sent to '+email+' : ' + info.response)
        }
      }); 
}