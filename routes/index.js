const router = require('express').Router();
const aphorisms = require('../models/aphorism/aphorisms');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// home
router.get(['/', '/home'], (req, res) =>
  res.render('home', {
    user: req.user,
  })
);

// login
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// profile
router.get('/profile', ensureAuthenticated, (req, res) =>
  res.render('profile', {
    user: req.user,
  })
);

// aphorism
router.get('/aphorism', (req, res) => {
  const aphorism = aphorisms.getAphorismOfTheWeek();
  res.send(aphorism);
});

module.exports = router;
