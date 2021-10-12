const nodemailer = require('nodemailer');

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (options) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // send mail with defined transport object
  const message = {
    from: `"${process.env.FROM_NAME}👻" <${process.env.FROM_EMAIL}>`,
    to: options.toEmail,
    subject: options.subject,
    text: options.text,
  };
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};
module.exports = sendEmail;
