const sendMail = require("./email");
const dotenv = require("dotenv");
dotenv.config();

function sendContactForm(name, email, message) {
  const data = {
    to: email,
    cc: process.env.GOOGLE_EMAIL_ALIAS,
    subject: `[Form submit] ${name}`,
    text: `New form submit: \nName: ${name} \nEmail: ${email} \nMessage: ${message}`,
    html: "",
  };
  sendMail(data).catch(console.error);
}

module.exports.sendContactForm = sendContactForm;
