const router = require('express').Router();

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// index
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// artist
router.get('/artist', ensureAuthenticated, (req, res) => res.render('artist'));

// login
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// home
router.get('/home', ensureAuthenticated, (req, res) =>
  res.render('home', {
    user: req.user,
  })
);

module.exports = router;
