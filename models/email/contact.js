const sendMail = require("./email");

function sendContactForm(name, email, message) {
  const data = {
    to: email,
    cc: "partitasmusic@gmail.com",
    subject: `[Form submit] ${name}`,
    text: `New form submit: \nName: ${name} \nEmail: ${email} \nMessage: ${message}`,
    html: "",
  };
  sendMail(data).catch(console.error);
}

module.exports.sendContactForm = sendContactForm;
