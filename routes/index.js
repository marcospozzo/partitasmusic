const router = require('express').Router();
const aphorisms = require('../models/aphorism/aphorisms');

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

// aphorism
router.get('/aphorism', async (req, res) => {
  const aphorism = await aphorisms.getAphorismOfTheDay();
  res.send(aphorism);
});

module.exports = router;
