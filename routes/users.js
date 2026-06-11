const dotenv = require("dotenv").config();
const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../models/email/login");
const passport = require("passport");
const { validateUser } = require("../middleware");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts, please try again later.",
});

// signup
router.post("/signup", authLimiter, validateUser, async (req, res, next) => {
  if (req.body.website) return res.redirect("/login");
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
router.post("/set-password/:token", async (req, res, next) => {
  const { password } = req.body;
  const { token } = req.params;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.RESET_TOKEN);
  } catch (err) {
    req.flash("flashError", "Invalid or expired token");
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      req.flash("flashError", "Error finding user");
      return res.redirect("/login");
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save({ validateModifiedOnly: true }); // workaround for mongoose-unique-validator bug in version 3.0.0
    req.flash("flashSuccess", "Password set correctly");
    res.redirect("/login");
  } catch (err) {
    req.flash("flashError", "Error saving user");
    return res.redirect("/login");
  }
});

// login
router.post("/login", authLimiter, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("[LOGIN] err:", err);
    console.log("[LOGIN] user:", user ? user.email : null);
    console.log("[LOGIN] info:", info);
    if (err) return next(err);
    if (!user) {
      req.flash("error", info?.message || "Login failed");
      return res.redirect("/login");
    }
    req.login(user, (loginErr) => {
      console.log("[LOGIN] req.login error:", loginErr);
      console.log("[LOGIN] session after login:", req.session);
      console.log("[LOGIN] req.secure:", req.secure);
      console.log("[LOGIN] x-forwarded-proto:", req.headers["x-forwarded-proto"]);
      console.log("[LOGIN] redirecting to:", req.session.backUrl || "/");
      if (loginErr) return next(loginErr);
      return res.redirect(req.session.backUrl || "/");
    });
  })(req, res, next);
});

// logout
router.get("/logout", (req, res, next) => {
  delete req.session.backUrl; // backUrl cleared so it does not go again
  delete req.session.body;
  req.logout(req.user, (err) => {
    if (err) return next(err);
    req.flash("flashSuccess", "You are logged out");
    res.redirect("/login");
  });
});

// user requests password reset based on email address
router.post("/reset-password", authLimiter, async (req, res, next) => {
  if (req.body.website) return res.redirect("/login");
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("flashError", "Error finding user");
      return res.redirect("/login");
    }
    sendMail.sendEmailWithToken(user, req.headers.host);
    req.flash("flashSuccess", "Follow email instructions");
    res.redirect("/login");
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
