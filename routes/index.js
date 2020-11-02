const router = require('express').Router();
const aphorisms = require('../models/aphorism/aphorisms');
const createError = require('http-errors');
const sendMail = require('../models/email/contact');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// home
router.get('/', (req, res) =>
  res.render('home', {
    user: req.user,
  })
);

// login
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// profile
router.get('/profile', (req, res) =>
  res.render('profile', {
    user: req.user,
  })
);

// profiles
router.get('/profiles', (req, res) =>
  res.render('profiles', {
    user: req.user,
  })
);

// seven guitar craft themes book
router.get('/seven-guitar-craft-themes-book', (req, res) =>
  res.render('seven', {
    user: req.user,
  })
);

// about us
router.get('/about-us', (req, res) =>
  res.render('about-us', {
    user: req.user,
  })
);

// contact
router.get('/contact', (req, res) =>
  res.render('contact', {
    user: req.user,
  })
);

// contact form
router.post('/contact', (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return next(createError(400, 'Missing fields'));
  }

  sendMail.sendContactForm(name, email, message);

  res.render('home', {
    user: req.user,
  });
});

// aphorism
router.get('/aphorism', async (req, res) => {
  const aphorism = await aphorisms.getAphorismOfTheDay();
  res.send(aphorism);
});

// aphorisms
router.get('/aphorisms', (req, res) =>
  res.render('aphorisms', {
    user: req.user,
  })
);

// contribute
router.get('/contribute', (req, res) =>
  res.render('contribute', {
    user: req.user,
  })
);

// picks and strings
router.get('/picks-and-strings', (req, res) =>
  res.render('picks-and-strings', {
    user: req.user,
  })
);

module.exports = router;
