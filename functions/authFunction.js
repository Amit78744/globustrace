var ran = require('randomatic');
var hash = require('password-hash');
const env = require('../constants');
const date = require('date-and-time')

module.exports = {

    //////get random id
    getRandomId : (req,res,value) => {
        return (ran('Aa0', 12));
    },

    //////get upload image random name
    getRandomName : (req,res,value) => {
        return (ran('Aa0', 6));
    },

    //////get Hash Value
    getHashValue : (req,res,value) => {

        var password = hash.generate(value);

        return password;
    },

    getTime : () => {

        var dt = new Date();

        var format = date.format(dt,'Y/MM/DD HH:mm:ss');

        return format;
    },

    /////Validation Error Message Display
    validation : (err,res) => {

        res.status(401).send({
            "Error":err,
            "code":401,
            "message":"Please enter valid details.",
            "isValid":false,
            status:0,
            "type":"FAILED"
        });
    }
}