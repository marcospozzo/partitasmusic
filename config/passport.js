const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log("[PASSPORT] strategy called for:", email);
          const user = await User.findOne({ email });
          console.log("[PASSPORT] user found:", !!user);
          const errorMessage = "Email or password incorrect";

          if (!user) return done(null, false, { message: errorMessage });

          const isMatch = await bcrypt.compare(password, user.password);
          console.log("[PASSPORT] password match:", isMatch);
          if (isMatch) return done(null, user);
          return done(null, false, { message: errorMessage });
        } catch (err) {
          console.log("[PASSPORT] error:", err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log("[DESERIALIZE] id:", id);
      const user = await User.findById(id).exec();
      console.log("[DESERIALIZE] user found:", !!user);
      done(null, user);
    } catch (err) {
      console.log("[DESERIALIZE] error:", err);
      done(err);
    }
  });
};
