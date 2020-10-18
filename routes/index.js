const router = require('express').Router();
const aphorisms = require('../models/aphorism/aphorisms');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// index
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// login
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// home
router.get('/home', ensureAuthenticated, (req, res) =>
  res.render('home', {
    user: req.user,
  })
);

// profile
router.get('/profile', ensureAuthenticated, (req, res) =>
  res.render('profile')
);

// aphorism
router.get('/aphorism', (req, res) => {
  const aphorism = aphorisms.getAphorismOfTheWeek();
  res.send(aphorism);
});

module.exports = router;
