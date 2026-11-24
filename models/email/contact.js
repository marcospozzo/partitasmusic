const sendMail = require("./email");
const dotenv = require("dotenv");
dotenv.config();

function sendContactForm(name, email, message) {
  const data = {
    to: process.env.GOOGLE_EMAIL_ALIAS,
    cc: email,
    subject: `[Form submit] ${name}`,
    text: `Name: ${name} \nEmail: ${email} \nMessage: ${message}`,
    html: "",
  };
  // Callers await this to know whether the email actually went out.
  return sendMail(data);
}

module.exports.sendContactForm = sendContactForm;
