const nodemailer = require('nodemailer');

var SMTP_HOST = 'smtp.gmail.com';
var SMTP_POST = '465';
var SMTP_USER = 'globustrace01@gmail.com';
var SMTP_PASSWORD = 'qhagnhovbcxwekgt';

module.exports = {

    SMTP_HOST: 'smtp.gmail.com',
    SMTP_POST: '465',
    SMTP_USER: 'globustrace01@gmail.com',
    SMTP_PASSWORD:'qhagnhovbcxwekgt',
    

    transporter : nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_POST,
        secure: true,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD
        }
    }),

    fn : require('./functions/authFunction'),
    generalFunc : require('./functions/general'),
    fcm_fn : require('./functions/notification'),
    emailFunc : require('./functions/email'),
    con : require('./config/config'),
    Jwt : require('jsonwebtoken'),
    Joi : require('@hapi/joi'),
    hash : require('password-hash'),
    nodemailer : require('nodemailer'),
    fs : require("fs"),
    path : require('path'),
    ran : require('randomatic'),
    date : require('date-and-time'),
    imageUrl : "http://192.168.238.1:6000/",
    
};