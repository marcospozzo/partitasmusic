const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
var cors = require("cors");

app.set("view engine", "ejs");

// Passport Config
require("./config/passport")(passport);

// db connect
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_CONNECT, {})
  .then(() => console.log("Connected to database"))
  .catch((error) => {
    console.log(error);
  });

// middleware
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      process.env.API_URL,
      process.env.API_URL_WWW,
      process.env.CMS_URL,
      process.env.CMS_URL_WWW,
      /netlify\.app/,
    ],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("views"));
app.enable("trust proxy");

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 24 * 60 * 60 * 1000 }, // 60 days
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());
app.use(function (req, res, next) {
  res.locals.flashSuccess = req.flash("flashSuccess");
  res.locals.flashError = req.flash("flashError");
  res.locals.error = req.flash("error");
  next();
});

// middleware routes
app.use("/", require("./routes/index"));
app.use("/api", require("./routes/api"));
app.use("/users", require("./routes/users"));

// 404 handler
app.use((req, res) => {
  res.redirect("/");
});

// error handler
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    },
  });
});

app.listen(PORT, () => console.log(`Server started at ${PORT}`));
