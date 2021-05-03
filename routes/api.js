const dotenv = require("dotenv").config();
const Contribution = require("../models/Contribution");
const Contributor = require("../models/Contributor");
const aphorisms = require("../models/aphorism/aphorisms");
const router = require("express").Router();
const sendMail = require("../models/email/contact");
const {
  ensureAuthenticated,
  ensureAuthenticatedContributions,
  ensureAuthenticatedForm,
  forwardAuthenticated,
} = require("../config/auth");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const myBucket = "partitasmusic";
const signedUrlExpireSeconds = 60 * 1 * 1; // 60 seconds, 0 minute, 0 hour

async function getGroupContributors() {
  return Contributor.find({ category: "group" }, function (err, contribution) {
    if (err) {
      console.error(err);
    }
  })
    .sort("sort")
    .exec();
}

async function getIndividualContributors() {
  return Contributor.find(
    { category: "individual" },
    function (err, contribution) {
      if (err) {
        console.error(err);
      }
    }
  )
    .sort("sort")
    .exec();
}

async function getContributor(path) {
  return Contributor.findOne({ path: path }, function (err, contributor) {
    if (err) {
      console.error(err);
    }
  }).exec();
}

async function getContributions(path) {
  return Contribution.find({ path: path }, function (err, contribution) {
    if (err) {
      console.error(err);
    }
  }).exec();
}

async function getTwoRandomContributorsExcept(path) {
  const filter = { path: { $nin: [path] } };

  return new Promise((resolve, reject) => {
    Contributor.findRandom(filter, {}, { limit: 2 }, function (err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

async function getProfilePicture(contributor) {
  contributor.picture = await getS3TempUrl(
    contributor.path,
    contributor.picture
  );
  return contributor;
}

router.get("/audio/:folder/:fileName", (req, res) => {
  const path = `${req.params.folder}/${req.params.fileName}`;
  const audio = getS3FileStream(path);
  res.attachment(path);
  audio.pipe(res);
});

router.get(
  "/scores/:folder/:fileName",
  ensureAuthenticatedContributions,
  async (req, res) => {
    // const path = `${req.params.folder}/${req.params.fileName}`;
    const score = await getS3TempUrl(req.params.folder, req.params.fileName);
    res.redirect(score);
  }
);

function getS3FileStream(path) {
  const file = s3
    .getObject({
      Bucket: myBucket,
      Key: path,
    })
    .createReadStream()
    .on("error", (error) => {
      console.error(error);
    });
  return file;
}

function getS3TempUrl(path, key) {
  return s3.getSignedUrlPromise("getObject", {
    Bucket: myBucket,
    Key: `${path}/${key}`,
    Expires: signedUrlExpireSeconds,
  });
}

router.post("/create-contribution", async (req, res, next) => {
  if (req.headers.authorization == process.env.SESSION_SECRET) {
    const { title, description, audio, score, path } = req.body;
    let savedContribution;

    try {
      const contribution = new Contribution({
        title: title,
        description: description,
        audio: audio,
        score: score,
        path: path,
      });
      savedContribution = await contribution.save();
    } catch (err) {
      return next(err);
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// aphorism
router.get("/aphorism", async (req, res) => {
  const aphorism = aphorisms.getAphorismOfTheDay();
  res.send(aphorism);
});

router.post("/create-contributor", async (req, res, next) => {
  if (req.headers.authorization == process.env.SESSION_SECRET) {
    const {
      name,
      sort,
      picture,
      country,
      bio,
      contact,
      donate,
      category,
      path,
    } = req.body;
    let savedContributor;

    try {
      const contributor = new Contributor({
        name: name,
        sort: sort,
        picture: picture,
        country: country,
        bio: bio,
        contact: contact,
        donate: donate,
        category: category,
        path: path,
      });
      savedContributor = await contributor.save();
    } catch (err) {
      return next(err);
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// contact form
router.post("/contact-form", ensureAuthenticatedForm, (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return next(createError(400, "Missing fields"));
  }

  sendMail.sendContactForm(name, email, message);
  delete req.session.body;
  req.flash("flashSuccess", "Message sent");
  res.redirect("/");
});

module.exports = router;
module.exports.getGroupContributors = getGroupContributors;
module.exports.getIndividualContributors = getIndividualContributors;
module.exports.getContributor = getContributor;
module.exports.getContributions = getContributions;
module.exports.getProfilePicture = getProfilePicture;
module.exports.getTwoRandomContributorsExcept = getTwoRandomContributorsExcept;
