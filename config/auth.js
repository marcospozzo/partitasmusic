module.exports = {
  ensureAuthenticatedPieces: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    // const fullUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    req.session.backUrl = `${req.protocol}://${req.headers.host}/music-catalog/${req.params.folder}`;
    req.flash("flashSuccess", "Please login");
    res.redirect("/login");
  },
  ensureAuthenticatedForm: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.backUrl = req.header("Referer");
    req.session.body = req.body;
    req.flash("flashSuccess", "Please login");
    res.redirect("/login");
  },
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.backUrl = req.header("Referer");
    req.flash("flashSuccess", "Please login");
    res.redirect("/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  },
};
