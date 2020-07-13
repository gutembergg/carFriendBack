const nodemailer = require('nodemailer');


const { host, port, secure, user, pass } = require('../config/mailerConfig.json');


const transporter = nodemailer.createTransport({
    host,
    port,
    secure, 
    auth: { user, pass }
  });

  transporter.verify(function(error, success) {
    if (error) {
         console.log(error);
    } else {
         console.log('Server is ready to take our messages');
    }
 });

module.exports = transporter;