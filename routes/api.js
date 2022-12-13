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
const { cloudchannel } = require("googleapis/build/src/apis/cloudchannel");
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const myBucket = "partitasmusic";
const signedUrlExpireSeconds = 60 * 1 * 1; // 60 seconds, 0 minute, 0 hour

async function getGroupContributors() {
  return Contributor.find({ category: "group" }).sort("sort").exec();
}

async function getIndividualContributors() {
  return Contributor.find({ category: "individual" }).sort("sort").exec();
}

async function getContributor(path) {
  return Contributor.findOne({ path: path }).exec();
}

async function getContributions(path) {
  return Contribution.find({ path: path }).exec();
}

async function getTwoRandomContributorsExcept(path) {
  const filter = { path: { $nin: [path] } };

  return new Promise((resolve, reject) => {
    Contributor.findRandom(filter, {}, { limit: 2 }, function (err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

async function getThreeRandomFeaturedContributors() {
  const featuredContributors = [
    "california-guitar-trio",
    "bigtime-trio",
    "berlin-guitar-ensemble",
    "zum",
    "the-league-of-crafty-guitarists",
    "guitar-ensemble-of-moscow",
    "los-gauchos-alemanes",
    "seattle-guitar-circle",
    "sarah-metivier",
    "steve-ball",
    "robert-fripp",
    "tony-geballe",
    "curt-golden",
    "alex-anthony-faide",
    "bert-lams",
  ];
  const filter = { path: { $in: featuredContributors } };

  return new Promise((resolve, reject) => {
    Contributor.findRandom(filter, {}, { limit: 3 }, function (err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

async function getProfilePicture(contributor) {
  contributor.picture = await getS3TempUrl(
    contributor.path,
    contributor.picture
  );
}

function getAllProfilePictures(array) {
  array.forEach((element) => getProfilePicture(element));
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

async function getS3TempUrl(path, key) {
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

/*

// search all
router.get("/search", async (req, res) => {
  const term = req.query.term;
  const results = [];

  results.push(await findContributors(term));
  // results.push(await findContributions(term));

  console.log(results);

  return results;
});

async function findContributors(term) {
  return Contributor.aggregate([
    {
      $search: {
        index: "contributors",
        text: {
          query: term,
          path: {
            wildcard: "*",
          },
        },
      },
    },
  ]);
}

async function findContributions(term) {
  return Contribution.find({ name: term }).sort("sort").exec();
}

*/

module.exports = router;
module.exports.getGroupContributors = getGroupContributors;
module.exports.getIndividualContributors = getIndividualContributors;
module.exports.getContributor = getContributor;
module.exports.getContributions = getContributions;
module.exports.getProfilePicture = getProfilePicture;
module.exports.getTwoRandomContributorsExcept = getTwoRandomContributorsExcept;
module.exports.getThreeRandomFeaturedContributors =
  getThreeRandomFeaturedContributors;
module.exports.getAllProfilePictures = getAllProfilePictures;
