const User = require('../model/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');

router.get('/login', async (req, res) => {
  User.User.findOne({ email: req.body.email }, async function (err, user) {
    if (err || user == null) {
      res.status(404).send(err);
    } else {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        res.sendStatus(200);
      } else {
        res.status(404).send(err);
      }
    }
  });
});

router.post('/signup', async (req, res) => {
  if ('email' in req.body && 'name' in req.body) {
    const user = new User.User({
      name: req.body.name,
      email: req.body.email,
    });
    try {
      const savedUser = await user.save();
      res.send(savedUser);
    } catch (err) {
      res.status(400).send(err);
    }
  }
});

router.post('/reset-password', async (req, res) => {
  // user request password reset based on email
  if ('email' in req.body) {
    User.User.findOne({ email: req.body.email }, async function (err, user) {
      if (err || user == null) {
        res.status(404).send(err);
      } else {
        const token = new User.Token();
        user.token = token;
        await user.save();
        // sentEmailWithToken(req.body.email, token);
        res.sendStatus(200);
      }
    });
  }

  // user resets password with provided token
  if ('token' in req.body && 'password' in req.body) {
    User.User.findOne({ 'token.value': req.body.token }, async function (
      err,
      user
    ) {
      if (err || user == null) {
        res.status(404).send(err);
      } else {
        if (user.token.isValid()) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          user.password = hashedPassword;
          user.token = null;
          await user.save();
          res.sendStatus(200);
        } else {
          res.send('Token expired');
        }
      }
    });
  }
});

module.exports = router;
