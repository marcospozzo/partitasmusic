const dotenv = require("dotenv").config();
const Contribution = require("../models/Contribution");
const Contributor = require("../models/Contributor");
const router = require("express").Router();
const passport = require("passport");
// const { forwardAuthenticated } = require('../config/auth');
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const myBucket = "partitasmusic";
const signedUrlExpireSeconds = 60 * 60 * 12; // 12 hours

function getThreeContributors(id) {
  return Contribution.find({}, async function (err, contributors) {
    if (err) {
      console.error(err);
    }
  }).exec();
}

async function getSignedContributors(contributors) {
  for (contributor of contributors) {
    const path = contributor.path;
    contributor.picture = await getS3TempUrl(path, contributor.picture);
    contributor.audio = await getS3TempUrl(path, contributor.audio);
    contributor.score = await getS3TempUrl(path, contributor.score);
  }
  return contributors;
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
  const { picture, name, country, contact, category, path } = req.body;
  let savedContributor;

  try {
    const contributor = new Contributor({
      picture: picture,
      name: name,
      country: country,
      contact: contact,
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
module.exports.getThreeContributors = getThreeContributors;
module.exports.getSignedContributors = getSignedContributors;
