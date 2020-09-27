const User = require('../model/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sendMail = require('../email/email');
dotenv.config();

router.post('/signup', async (req, res) => {
  if ('email' in req.body && 'name' in req.body) {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
    });
    try {
      const savedUser = await user.save();
      sendUserForValidation(savedUser);
      res.sendStatus(200);
    } catch (err) {
      res.status(400).send(err);
    }
  }
});

router.get('/signup/:token', async (req, res) => {
  jwt.verify(req.params.token, process.env.STATUS_TOKEN, function (
    err,
    decoded
  ) {
    if (err) {
      res.sendStatus(404);
    } else {
      User.findById(decoded.id, async function (err, user) {
        if (err || user == null || user.status != 'pending') {
          res.sendStatus(404);
        } else {
          user.status = decoded.status;
          await user.save();
          sendStatusToUser(user);
          res.sendStatus(200);
        }
      });
    }
  });
});

// user sets password with provided token
router.post('/set-password', async (req, res) => {
  if ('token' in req.body && 'password' in req.body) {
    jwt.verify(req.body.token, process.env.RESET_TOKEN, function (
      err,
      decoded
    ) {
      if (err) {
        res.sendStatus(403);
      } else {
        User.findById(decoded.id, async function (err, user) {
          if (
            err ||
            user == null ||
            user.status == 'pending' ||
            user.status == 'rejected'
          ) {
            res.sendStatus(404);
          } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
            user.status = 'activated';
            await user.save();
            res.sendStatus(200);
          }
        });
      }
    });
  }
});

router.get('/login', async (req, res) => {
  User.findOne({ email: req.body.email }, async function (err, user) {
    if (err || user == null || user.status != 'activated') {
      res.sendStatus(404);
    } else {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    }
  });
});

// user requests password reset based on email
router.post('/reset-password', async (req, res) => {
  if ('email' in req.body) {
    User.findOne({ email: req.body.email }, async function (err, user) {
      if (err || user == null || user.status != 'activated') {
        res.sendStatus(404);
      } else {
        sentEmailWithToken(user);
        res.sendStatus(200);
      }
    });
  }
});

function sendUserForValidation(user) {
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

  const approvalURL = `http://localhost:3000/api/user/signup/${approvalToken}`;
  const rejectionURL = `http://localhost:3000/api/user/signup/${rejectionToken}`;

  const data = {
    to: 'info@partitasmusic.com',
    subject: `New account request by ${user.name}`,
    text: `Dear Partitas: \n\n${user.name} requested an account with the following email address: ${user.email}. \n\nClick on the following URL to APPROVE ${user.name}: ${approvalURL} \n\nClick on the following URL to REJECT ${user.name}: ${rejectionURL} \n\nBest regards.`,
    html: '',
  };
  sendMail(data).catch(console.error);
}

function sendStatusToUser(user) {
  if (user.status == 'approved') {
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.RESET_TOKEN,
      { expiresIn: '1w' }
    );
    const approvalURL = `http://localhost:3000/api/user/set-password/${token}`;

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
      text: `Dear ${user.name}: \n\nThank you for your interest in Partitas Music. Since we are on beta testing stages and because of copyright matters, we currently accept members of the GC community only. If Partitas Music opens up to the public at some point, we will let you know by sending you an email to this account.\n\nBest regards, \nPartitas Music.`,
      html: '',
    };
    sendMail(data).catch(console.error);
  }
}

function sentEmailWithToken(user) {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.RESET_TOKEN,
    { expiresIn: '1h' }
  );

  const resetlURL = `http://localhost:3000/api/user/set-password/${token}`;

  const data = {
    to: user.email,
    subject: 'Reset your password',
    text: `Dear ${user.name}: \n\nIf you requested a password reset you can do so here: ${resetlURL} \n\nIf you did not requested a password reset, please let us know by answering this email. \n\nBest regards, \nPartitas Music.`,
    html: '',
  };
  sendMail(data).catch(console.error);
}

module.exports = router;
