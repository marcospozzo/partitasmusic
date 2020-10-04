const sendMail = require('../email/email');
const jwt = require('jsonwebtoken');

function sendUserForValidation(user, host) {
  const approvalToken = jwt.sign(
    {
      id: user.id,
      status: 'approved',
    },
    process.env.STATUS_TOKEN,
    { expiresIn: '1w' }
  );

  const rejectionToken = jwt.sign(
    {
      id: user.id,
      status: 'rejected',
    },
    process.env.STATUS_TOKEN,
    { expiresIn: '1w' }
  );

  const approvalURL = `http://${host}/users/signup/${approvalToken}`;
  const rejectionURL = `http://${host}/users/signup/${rejectionToken}`;

  const data = {
    to: 'info@partitasmusic.com',
    subject: `New account request by ${user.name}`,
    text: `Dear Partitas: \n\nThere is a new account request: \nName: ${user.name} \nEmail: ${user.email} \nWho is: ${user.whois} \n\nClick on the following URL to APPROVE ${user.name}: ${approvalURL} \n\nClick on the following URL to REJECT ${user.name}: ${rejectionURL} \n\nBest regards.`,
    html: '',
  };
  sendMail(data).catch(console.error);
}

function sendStatusToUser(user, host) {
  if (user.status == 'approved') {
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.RESET_TOKEN,
      { expiresIn: '1w' }
    );
    const approvalURL = `http://${host}/users/set-password/${token}`;

    const data = {
      to: user.email,
      subject: 'Complete your registration',
      text: `Dear ${user.name}: welcome to Partitas Music! \n\nPlease set your password here: ${approvalURL} \n\nBest regards, \nPartitas Music.`,
      html: '',
    };
    sendMail(data).catch(console.error);
  }

  if (user.status == 'rejected') {
    const data = {
      to: user.email,
      subject: 'Thank you for your request',
      text: `Dear ${user.name}: \n\nThank you for your interest in Partitas Music. Since we are on beta testing stages and because of copyright matters, we currently accept members of the GC community only. If Partitas Music open up to the public at some point, we will let you know by sending you an email to this account.\n\nBest regards, \nPartitas Music.`,
      html: '',
    };
    sendMail(data).catch(console.error);
  }
}

function sendEmailWithToken(user, host) {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.RESET_TOKEN,
    { expiresIn: '15m' }
  );

  const resetlURL = `http://${host}/users/set-password/${token}`;

  const data = {
    to: user.email,
    subject: 'Reset your password',
    text: `Dear ${user.name}: \n\nIf you requested a password reset you can do so here: ${resetlURL} \n\nIf you did not request a password reset, please let us know by answering this email. \n\nBest regards, \nPartitas Music.`,
    html: '',
  };
  sendMail(data).catch(console.error);
}

module.exports.sendUserForValidation = sendUserForValidation;
module.exports.sendStatusToUser = sendStatusToUser;
module.exports.sendEmailWithToken = sendEmailWithToken;
