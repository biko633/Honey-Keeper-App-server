import nodemailer from "nodemailer";

export const sendMail = (email, email_token) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "HoneyKeeperApp@gmail.com",
      pass: "rzsdruuqqtrkdocm",
    },
  });

  const client_url = process.env.CLIENT_URL;

  const link = `${client_url}/auth/resetPassword/${email_token}`;
  console.log(link);

  var mailOptions = {
    from: "HoneyKeeperApp@gmail.com",
    to: email,
    subject: "HoneyKeeperApp Reset password Link",
    html: `<h1>Welcome</h1><h2>${link}</h2><p>That was easy!</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      error;
    } else {
      "Email sent: " + info.response;
    }
  });
};
