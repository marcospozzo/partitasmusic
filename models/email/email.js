"use strict";
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// async..await is not allowed in global scope, must use a wrapper
async function email(data) {
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_EMAIL_ADDRESS,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  let info = await transporter.sendMail({
    from: `"Partitas Music" <${process.env.GOOGLE_EMAIL_ALIAS}>`, // sender address
    to: data.to, // list of receivers
    cc: data.cc,
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.html, // html body
  });
}

module.exports = email;
