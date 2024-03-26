import nodemailer from "nodemailer";

export const sendMail = (email, email_token) => {
  const site_email = process.env.SITE_EMAIL;
  const site_password = process.env.SITE_PASSWORD;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: site_email,
      pass: site_password,
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
      console, log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
