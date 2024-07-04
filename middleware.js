const BLACKLISTED_DOMAINS = [
  "rightbliss.beauty",
  "silesia.life",
  "synaxarion.asia",
  "carnana.art",
  "flexduck.click",
  "spectrail.world",
  "sabletree.foundation",
  "paravane.biz",
  "chilgoza.buzz",
  "sandcress.xyz",
  "gemination.hair",
  "lustrum.cfd",
  "scranch.shop",
];

function validateUser(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(createError(400, "Missing fields"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(createError(400, "Invalid email format"));
  }

  const domain = email.split("@")[1];
  if (BLACKLISTED_DOMAINS.includes(domain)) {
    return res.sendStatus(403);
  }

  next();
}

module.exports.validateUser = validateUser;
