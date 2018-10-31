const nodemailer = require('nodemailer');

const sendEmail = (email, query) => nodemailer.createTestAccount((err) => {

  if (err) {
    console.log(err);
    return;
  }

  if (!email || !query) return null;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  let mailOptions = {
    from: '"TODO List. Password reset" <todo.list.gql@gmail.com>',
    to: email,
    subject: 'Password reset',
    html: `<a href="https://todo-list-gql.herokuapp.com/reset-password?${query}" >Click here</a> to reset the password.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }

    console.log('info', info);

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
});

module.exports = sendEmail;
