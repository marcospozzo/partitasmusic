const sendMail = require("./email");

function sendContactForm(name, email, message) {
  const data = {
    to: "partitasmusic@gmail.com",
    subject: `[Form submit] ${name}`,
    text: `New contact message: \nName: ${name} \nEmail: ${email} \nMessage: ${message}`,
    html: "",
  };
  sendMail(data).catch(console.error);
}

module.exports.sendContactForm = sendContactForm;
