const nodemailer = require('nodemailer')

module.exports.sendMail = (email, subject, html) => {
  const transporter = nodemailer.createTransport({ // cấu hình để gửi email qua SMTP
    service: 'gmail',
    auth: {
      user: process.env.Email_USER,
      pass: process.env.Email_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.Email_USER,
    to: email,
    subject: subject,
    // text: "Hello world?", // plain text body
    html: html, // html body
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent ' + info.response)
    }
  });
}