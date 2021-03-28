const sendMail = require("./email");
const jwt = require("jsonwebtoken");

function notifyAccountCreation(user) {
  const data = {
    to: "partitasmusic@gmail.com",
    subject: `[New account] ${user.name}`,
    text: `New account creation: \nName: ${user.name} \nEmail: ${user.email}`,
    html: "",
  };
  sendMail(data).catch(console.error);
}

function sendEmailWithToken(user, urlProtocolWithHost) {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.RESET_TOKEN,
    { expiresIn: "15m" }
  );

  const resetlURL = `${urlProtocolWithHost}/users/set-password/${token}`;

  const data = {
    to: user.email,
    subject: "Reset your password",
    text: `Dear ${user.name}! \n\nIf you requested a password reset, you can do so by clicking on the following link: \n\n${resetlURL} \n\nBest regards, \nPartitas Music.`,
    html: "",
  };
  sendMail(data).catch(console.error);
}

module.exports.notifyAccountCreation = notifyAccountCreation;
module.exports.sendEmailWithToken = sendEmailWithToken;
