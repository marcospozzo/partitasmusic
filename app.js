const express = require("express");
const app = express();
const PORT = process.env.PORT || 3002;
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

// Validate required environment variables at startup
const REQUIRED_ENV = [
  "DB_CONNECT",
  "SESSION_SECRET",
  "CMS_TOKEN",
  "RESET_TOKEN",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const crypto = require("crypto");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
var cors = require("cors");

app.set("view engine", "ejs");

// Passport Config
require("./config/passport")(passport);

// db connect
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_CONNECT, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    family: 4,
    retryWrites: true,
  })
  .then(() => console.log("Connected to database"))
  .catch((error) => {
    console.log(error);
  });

// Generate a fresh nonce for every request (used by CSP and EJS templates)
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  next();
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": [
          "'self'",
          "https://www.googletagmanager.com",
          (req, res) => `'nonce-${res.locals.nonce}'`,
        ],
        "script-src-attr": ["'none'"],
        "img-src": ["'self'", "data:", "https://*.amazonaws.com"],
        "connect-src": [
          "'self'",
          "https://www.google-analytics.com",
          "https://region1.google-analytics.com",
        ],
      },
    },
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("views"));
app.set("trust proxy", 1);

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_CONNECT,
      touchAfter: 24 * 3600, // only update session once per day unless data changes
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
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
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV !== "production";
  res.status(status).json({
    error: {
      status,
      message: isDev ? err.message : "Internal Server Error",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
  if (process.send) process.send("ready");
});
