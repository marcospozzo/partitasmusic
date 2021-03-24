const dotenv = require("dotenv").config();
const Contribution = require("../models/Contribution");
const Contributor = require("../models/Contributor");
const router = require("express").Router();
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const myBucket = "partitasmusic";
const signedUrlExpireSeconds = 60 * 60 * 12; // 12 hours

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

async function getTwoRandomContributorExcept(path) {
  const filter = { path: { $nin: [path] } };

  return new Promise((resolve, reject) => {
    Contributor.findRandom(filter, {}, { limit: 2 }, function (err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

async function getSignedContributions(contributions) {
  for (contribution of contributions) {
    const path = contribution.path;
    contribution.audio = await getS3TempUrl(path, contribution.audio);
    contribution.score = await getS3TempUrl(path, contribution.score);
  }
  return contributions;
}

async function getSignedContributor(contributor) {
  contributor.picture = await getS3TempUrl(
    contributor.path,
    contributor.picture
  );
  return contributor;
}

function getS3TempUrl(path, key) {
  return s3.getSignedUrlPromise("getObject", {
    Bucket: myBucket,
    Key: `${path}/${key}`,
    Expires: signedUrlExpireSeconds,
  });
}

router.post("/create-contribution", async (req, res, next) => {
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
});

router.post("/create-contributor", async (req, res, next) => {
  const { picture, name, country, contact, donate, category, path } = req.body;
  let savedContributor;

  try {
    const contributor = new Contributor({
      picture: picture,
      name: name,
      country: country,
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
});

module.exports = router;
module.exports.getContributor = getContributor;
module.exports.getContributions = getContributions;
module.exports.getSignedContributor = getSignedContributor;
module.exports.getSignedContributions = getSignedContributions;
module.exports.getTwoRandomContributorExcept = getTwoRandomContributorExcept;
