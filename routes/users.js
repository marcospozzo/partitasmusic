const dotenv = require("dotenv").config();
const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../models/email/login");
const passport = require("passport");
const { validateUser } = require("../middleware");

// signup
router.post("/signup", validateUser, async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let savedUser;

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

  res.status(200);
  req.flash("flashSuccess", "Account created");
  res.redirect("/login");
});

// load set password view with token as parameter
router.get("/set-password/:token", async (req, res) => {
  res.render("set-password", {
    title: "Set password",
    token: req.params.token,
  });
});

// user sets password with provided token
router.post("/set-password/:token", async (req, res) => {
  const password = req.body.password;
  const token = req.params.token;

  jwt.verify(token, process.env.RESET_TOKEN, function (err, decoded) {
    if (err) {
      req.flash("flashError", "Invalid or expired token");
      return res.redirect("/login");
    } else {
      User.findById(decoded.id, async function (err, user) {
        if (err || user == null) {
          req.flash("flashError", "Error finding user");
          return res.redirect("/login");
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
          await user.save({ validateModifiedOnly: true }); // workaround for mongoose-unique-validator bug in version 3.0.0
        } catch (err) {
          // console.error(err);
          req.flash("flashError", "Error saving user");
          return res.redirect("/login");
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
    successRedirect: req.session.backUrl || "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// logout
router.get("/logout", (req, res) => {
  delete req.session.backUrl; // backUrl cleared so it does not go again
  delete req.session.body;
  req.logout(req.user, (err) => {
    if (err) return next(err);
    req.flash("flashSuccess", "You are logged out");
    res.redirect("/login");
  });
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

module.exports = router;
