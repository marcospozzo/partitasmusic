module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    // const fullUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    // const referer = req.header("Referer");
    req.session.backUrl = `${req.protocol}://${req.headers.host}/contributions/${req.params.folder}`;
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
