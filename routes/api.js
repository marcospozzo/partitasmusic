const dotenv = require("dotenv").config();
const Contribution = require("../models/Contribution");
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
  const {
    picture,
    name,
    country,
    title,
    description,
    contact,
    audio,
    score,
    path,
  } = req.body;
  let savedContribution;

  try {
    const contribution = new Contribution({
      picture: picture,
      name: name,
      country: country,
      title: title,
      description: description,
      contact: contact,
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

module.exports = router;
module.exports.getThreeContributors = getThreeContributors;
module.exports.getSignedContributors = getSignedContributors;
