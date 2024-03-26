import nodemailer from "nodemailer";

export const sendMail = (email, email_token) => {
  // const site_email = toString(process.env.SITE_EMAIL);
  // const site_password = toString(process.env.SITE_PASSWORD);
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SITE_EMAIL,
      pass: process.env.SITE_PASSWORD,
    },
  });

  const client_url = process.env.CLIENT_URL;

  const link = `${client_url}/auth/resetPassword/${email_token}`;
  console.log(link);

  var mailOptions = {
    from: "HoneyKeeperApp@gmail.com",
    to: email,
    subject: "HoneyKeeperApp Reset password Link",
    html: `<p>
      <strong>Reset Your Password on HoneyKeeperApp</strong><br>
      To reset your password, please click the link below:<br>
      <a href="${link}" target="_blank">Reset Password</a>
    </p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
