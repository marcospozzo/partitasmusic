const dotenv = require('dotenv').config();
const User = require('../model/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('../email/login');
const createError = require('http-errors');

// signup
router.post('/signup', async (req, res, next) => {
  const { name, email, whois } = req.body;
  let savedUser;

  if (!name || !email || !whois) {
    return next(createError(400, 'Missing fields'));
  }

  try {
    const user = new User({
      name: name,
      email: email,
      whois: whois,
    });
    savedUser = await user.save();
  } catch (err) {
    if (err.name === 'ValidationError' && err.errors.email.kind === 'unique') {
      const error = { message: 'Email is already registered' };
      return res.render('login', { error });
    } else {
      return next(err);
    }
  }

  sendMail.sendUserForValidation(savedUser, req.headers.host);
  res.status(200);
  const success = { message: 'Account requested successfully' };
  return res.render('registered', { success });
});

// admin approves or rejects account request
router.get('/signup/:token', async (req, res) => {
  let error;
  jwt.verify(req.params.token, process.env.STATUS_TOKEN, function (
    err,
    decoded
  ) {
    if (err) {
      error = { message: 'Invalid or expired token' };
      return res.render('status', { error });
    } else {
      User.findById(decoded.id, async function (err, user) {
        if (err || user == null) {
          error = { message: 'Error finding user' };
          return res.render('status', { error });
        } else {
          if (user.status != 'pending') {
            error = { message: 'User status is not pending' };
            return res.render('status', { error });
          }
        }
        try {
          user.status = decoded.status;
          await user.save();
        } catch (err) {
          error = { message: 'Error saving user' };
          return res.render('status', { error });
        }
        sendMail.sendStatusToUser(user, req.headers.host);
        res.status(200);
        if (user.status == 'approved') {
          const success = { message: 'User approved correctly' };
          return res.render('status', { success });
        }
        if (user.status == 'rejected') {
          const error = { message: 'User rejected correctly' };
          return res.render('status', { error });
        }
        return;
      });
    }
  });
});

// load set password view with token as parameter
router.get('/set-password/:token', async (req, res) => {
  res.render('set', {
    token: req.params.token,
  });
});

// user sets password with provided token
router.post('/set-password/:token', async (req, res) => {
  const password = req.body.password;
  const token = req.params.token;
  let error;

  jwt.verify(token, process.env.RESET_TOKEN, function (err, decoded) {
    if (err) {
      error = { message: 'Invalid or expired token' };
      return res.render('set', {
        token,
        error,
      });
    } else {
      User.findById(decoded.id, async function (err, user) {
        if (err || user == null) {
          error = { message: 'Error finding user' };
          return res.render('set', {
            token,
            error,
          });
        } else {
          if (user.status == 'pending' || user.status == 'rejected') {
            error = { message: 'User has never been approved' };
            return res.render('set', {
              token,
              error,
            });
          }
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
          user.status = 'activated';
          await user.save();
        } catch (err) {
          error = { message: 'Error saving user' };
          return res.render('set', {
            token,
            error,
          });
        }
        res.status(200);
        const success = { message: 'Password set correctly' };
        return res.render('login', { success });
      });
    }
  });
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const error = { message: 'User or password incorrect' };

  User.findOne({ email: email }, async function (err, user) {
    if (err || user == null) {
      return res.render('login', { error });
    } else {
      if (user.status != 'activated') {
        return res.render('login', { error });
      }
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.status(200);
      return res.render('dashboard');
    } else {
      return res.render('login', { error });
    }
  });
});

// user requests password reset based on email address
router.post('/reset-password', async (req, res) => {
  const email = req.body.email;
  let error;

  User.findOne({ email: email }, async function (err, user) {
    if (err || user == null) {
      error = { message: 'Error finding user' };
      return res.render('login', { error });
    } else {
      if (user.status != 'activated') {
        error = { message: 'User is not activated' };
        return res.render('login', { error });
      }
    }

    sendMail.sendEmailWithToken(user, req.headers.host);
    res.status(200);
    const success = { message: 'Follow email instructions' };
    return res.render('login', { success });
  });
});

module.exports = router;
