const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

app.set("view engine", "ejs");

// Passport Config
require("./config/passport")(passport);

// db connect
mongoose
  .connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to database"))
  .catch((error) => {
    console.log(error);
  });

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("views"));

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

app.listen(PORT || 3000, () => console.log(`Server started at ${PORT}`));
