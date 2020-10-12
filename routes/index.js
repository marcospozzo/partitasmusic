const router = require('express').Router();

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// index Page
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// dashboard
router.get('/home', ensureAuthenticated, (req, res) =>
  res.render('home', {
    user: req.user,
  })
);

module.exports = router;
