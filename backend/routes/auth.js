const User = require('../model/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

router.post('/signup', async (req, res) => {
  if ('email' in req.body && 'name' in req.body) {
    const user = new User({
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

// user requests password reset based on email
router.post('/reset-password', async (req, res) => {
  if ('email' in req.body) {
    User.findOne({ email: req.body.email }, async function (err, user) {
      if (err || user == null || user.status != 'activated') {
        res.sendStatus(404);
      } else {
        const token = jwt.sign(
          {
            id: user.id,
          },
          process.env.EMAIL_TOKEN,
          { expiresIn: '1h' }
        );
        // sentEmailWithToken(req.body.email, token);
        res.send(token);
      }
    });
  }
});

// user resets password with provided token
router.post('/set-password', async (req, res) => {
  if ('token' in req.body && 'password' in req.body) {
    jwt.verify(req.body.token, process.env.EMAIL_TOKEN, function (
      err,
      decoded
    ) {
      if (err) {
        res.sendStatus(403);
      } else {
        User.findById(decoded.id, async function (err, user) {
          if (err || user == null) {
            res.sendStatus(404);
          } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
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

module.exports = router;
