const sendMail = require("./email");
const jwt = require("jsonwebtoken");

function notifyAccountCreation(user) {
  const data = {
    to: "info@partitasmusic.com",
    subject: `[New account] ${user.name}`,
    text: `Dear Partitas: \n\nThere was a new account creation: \nName: ${user.name} \nEmail: ${user.email} \n\nBest regards.`,
    html: "",
  };
  sendMail(data).catch(console.error);
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
    text: `Dear ${user.name}: \n\nIf you requested a password reset, you can do so here: ${resetlURL} \n\nBest regards, \nPartitas Music.`,
    html: "",
  };
  sendMail(data).catch(console.error);
}

module.exports.notifyAccountCreation = notifyAccountCreation;
module.exports.sendEmailWithToken = sendEmailWithToken;
