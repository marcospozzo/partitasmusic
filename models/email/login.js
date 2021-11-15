const sendMail = require("./email");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function notifyAccountCreation(user) {
  const data = {
    to: process.env.GOOGLE_EMAIL_ADDRESS,
    subject: `[New account] ${user.name}`,
    text: `New account creation: \nName: ${user.name} \nEmail: ${user.email}`,
    html: "",
  };
  sendMail(data).catch((err) => console.error(err));
}

function sendEmailWithToken(user, host) {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.RESET_TOKEN,
    { expiresIn: "15m" }
  );

  const resetlURL = `https://${host}/users/set-password/${token}`;

  const data = {
    to: user.email,
    subject: "Reset your password",
    text: `Dear ${user.name}! \n\nIf you requested a password reset, you can do so by clicking on the following link: \n\n${resetlURL} \n\nBest regards, \nPartitas Music.`,
    html: "",
  };
  sendMail(data).catch((err) => console.error(err));
}

module.exports.notifyAccountCreation = notifyAccountCreation;
module.exports.sendEmailWithToken = sendEmailWithToken;
