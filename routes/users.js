const dotenv = require('dotenv').config();
const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('../models/email/login');
const createError = require('http-errors');
const passport = require('passport');
// const { forwardAuthenticated } = require('../config/auth');

// signup
router.post('/signup', async (req, res, next) => {
  const { name, email, whoIs } = req.body;
  let savedUser;

  if (!name || !email || !whoIs) {
    return next(createError(400, 'Missing fields'));
  }

  try {
    const user = new User({
      name: name,
      email: email,
      whoIs: whoIs,
    });
    savedUser = await user.save();
  } catch (err) {
    if (err.name === 'ValidationError' && err.errors.email.kind === 'unique') {
      const errors = { message: 'Email is already registered' };
      return res.render('login', { errors });
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
  let errors;
  jwt.verify(req.params.token, process.env.STATUS_TOKEN, function (
    err,
    decoded
  ) {
    if (err) {
      errors = { message: 'Invalid or expired token' };
      return res.render('status', { errors });
    } else {
      User.findById(decoded.id, async function (err, user) {
        if (err || user == null) {
          errors = { message: 'Error finding user' };
          return res.render('status', { errors });
        } else {
          if (user.status != 'pending') {
            errors = { message: 'User status is not pending' };
            return res.render('status', { errors });
          }
        }
        try {
          user.status = decoded.status;
          await user.save();
        } catch (err) {
          errors = { message: 'Error saving user' };
          return res.render('status', { errors });
        }
        sendMail.sendStatusToUser(user, req.headers.host);
        res.status(200);
        if (user.status == 'approved') {
          const success = { message: 'User approved correctly' };
          return res.render('status', { success });
        }
        if (user.status == 'rejected') {
          const errors = { message: 'User rejected correctly' };
          return res.render('status', { errors });
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
  let errors;

  jwt.verify(token, process.env.RESET_TOKEN, function (err, decoded) {
    if (err) {
      errors = { message: 'Invalid or expired token' };
      return res.render('set', {
        token,
        errors,
      });
    } else {
      User.findById(decoded.id, async function (err, user) {
        if (err || user == null) {
          errors = { message: 'Error finding user' };
          return res.render('set', {
            token,
            errors,
          });
        } else {
          if (user.status == 'pending' || user.status == 'rejected') {
            errors = { message: 'User has never been approved' };
            return res.render('set', {
              token,
              errors,
            });
          }
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
          user.status = 'activated';
          await user.save();
        } catch (err) {
          errors = { message: 'Error saving user' };
          return res.render('set', {
            token,
            errors,
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
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('flashSuccess', 'You are logged out');
  res.redirect('/login');
});

// user requests password reset based on email address
router.post('/reset-password', async (req, res) => {
  const email = req.body.email;
  let errors;

  User.findOne({ email: email }, async function (err, user) {
    if (err || user == null) {
      errors = { message: 'Error finding user' };
      return res.render('login', { errors });
    } else {
      if (user.status == 'pending' || user.status == 'rejected') {
        errors = { message: 'User is not activated' };
        return res.render('login', { errors });
      }
    }

    sendMail.sendEmailWithToken(user, req.headers.host);
    res.status(200);
    const success = { message: 'Follow email instructions' };
    return res.render('login', { success });
  });
});

module.exports = router;
