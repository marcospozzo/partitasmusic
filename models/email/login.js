const sendMail = require("./email");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function notifyAccountCreation(user) {
  const data = {
    to: process.env.GOOGLE_EMAIL_ALIAS,
    subject: `[New account] ${user.name}`,
    text: `New account creation: \nName: ${user.name} \nEmail: ${user.email}`,
    html: "",
  };
  sendMail(data).catch((err) => console.error(err));
}

// Returns the send promise so the caller can tell the user if it failed.
function sendEmailWithToken(user) {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.RESET_TOKEN,
    { expiresIn: "15m" }
  );

  // Built from config, never from the request's Host header: a forged Host
  // would otherwise send the user a reset link (with a valid token) to an
  // attacker's domain.
  const siteUrl = (process.env.API_URL || "https://partitasmusic.com").replace(
    /\/+$/,
    ""
  );
  const resetlURL = `${siteUrl}/users/set-password/${token}`;

  const data = {
    to: user.email,
    subject: "Reset your password",
    text: `Dear ${user.name}! \n\nIf you requested a password reset, you can do so by clicking on the following link: \n\n${resetlURL} \n\nBest regards, \nPartitas Music.`,
    html: "",
  };
  return sendMail(data);
}

module.exports.notifyAccountCreation = notifyAccountCreation;
module.exports.sendEmailWithToken = sendEmailWithToken;
