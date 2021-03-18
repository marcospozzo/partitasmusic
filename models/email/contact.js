const sendMail = require("./email");

function sendContactForm(name, email, message) {
  const data = {
    to: "partitasmusic@gmail.com",
    subject: `[Form submit] ${name}`,
    text: `Dear Partitas: \n\nThere is a new contact message: \nName: ${name} \nEmail: ${email} \nMessage: ${message} \n\nBest regards.`,
    html: "",
  };
  sendMail(data).catch(console.error);
}

module.exports.sendContactForm = sendContactForm;
