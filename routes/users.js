const dotenv = require("dotenv").config();
const User = require("../models/User");
const Contribution = require("../models/Contribution");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../models/email/login");
const createError = require("http-errors");
const passport = require("passport");
// const { forwardAuthenticated } = require('../config/auth');

// signup
router.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body;
  let savedUser;

  if (!name || !email || !password) {
    return next(createError(400, "Missing fields"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    savedUser = await user.save();
  } catch (err) {
    if (err.name === "ValidationError" && err.errors.email.kind === "unique") {
      req.flash("flashError", "Email is already registered");
      return res.redirect("/login");
    } else {
      return next(err);
    }
  }

  sendMail.notifyAccountCreation(savedUser);
  res.status(200);
  req.flash("flashSuccess", "Account created");
  res.redirect("/login");
});

// load set password view with token as parameter
router.get("/set-password/:token", async (req, res) => {
  res.render("set-password", {
    token: req.params.token,
  });
});

// user sets password with provided token
router.post("/set-password/:token", async (req, res) => {
  const password = req.body.password;
  const token = req.params.token;
  let errors;

  jwt.verify(token, process.env.RESET_TOKEN, function (err, decoded) {
    if (err) {
      errors = { message: "Invalid or expired token" };
      return res.render("set-password", {
        token,
        errors,
      });
    } else {
      User.findById(decoded.id, async function (err, user) {
        if (err || user == null) {
          errors = { message: "Error finding user" };
          return res.render("set-password", {
            token,
            errors,
          });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
          await user.save();
        } catch (err) {
          errors = { message: "Error saving user" };
          return res.render("set-password", {
            token,
            errors,
          });
        }
        res.status(200);
        req.flash("flashSuccess", "Password set correctly");
        res.redirect("/login");
      });
    }
  });
});

// login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("flashSuccess", "You are logged out");
  res.redirect("/login");
});

// user requests password reset based on email address
router.post("/reset-password", async (req, res) => {
  const email = req.body.email;

  User.findOne({ email: email }, async function (err, user) {
    if (err || user == null) {
      req.flash("flashError", "Error finding user");
      return res.redirect("/login");
    }

    sendMail.sendEmailWithToken(user, req.headers.host);
    res.status(200);
    req.flash("flashSuccess", "Follow email instructions");
    res.redirect("/login");
  });
});

// create-contribution
router.post("/create-contribution", async (req, res, next) => {
  const {
    name,
    country,
    bio,
    profilePictureUrl,
    contactUrl,
    donateUrl,
    composers,
    title,
    description,
    audioUrl,
    scoreUrl,
  } = req.body;
  let savedContribution;

  try {
    const contribution = new Contribution({
      name: name,
      country: country,
      bio: bio,
      profilePictureUrl: profilePictureUrl,
      contactUrl: contactUrl,
      donateUrl: donateUrl,
      composers: composers,
      title: title,
      description: description,
      audioUrl: audioUrl,
      scoreUrl: scoreUrl,
    });
    savedContribution = await contribution.save();
  } catch (err) {
    return next(err);
  }

  res.sendStatus(200);
});

module.exports = router;
