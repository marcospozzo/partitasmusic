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
const signedUrlExpireSeconds = 60 * 5;

// /api
router.get("/", (req, res) => {
  Contribution.find({}, function (err, contributors) {
    if (err) {
      console.error(err);
    }
    const contributor = contributors[0];
    contributor.profilePictureUrl = getS3TempUrl(
      `profile-pictures/${contributor.profilePictureUrl}`
    );
    contributor.audioUrl = getS3TempUrl(`audio/${contributor.audioUrl}`);
    contributor.scoreUrl = getS3TempUrl(`scores/${contributor.scoreUrl}`);
    res.send(contributor);
  });
});

function getS3TempUrl(key) {
  const url = s3.getSignedUrl("getObject", {
    Bucket: myBucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
  return url;
}

// scores
router.get("/scores/:id", (req, res) => {
  const id = req.params.id;
  Contribution.findById(id, function (err, contribution) {
    res.send(contributors[0]);
  });
});

// create-contribution
router.post("/create-contribution", async (req, res, next) => {
  const {
    name,
    country,
    bio,
    profilePictureUrl,
    contactUrl,
    donateUrl,
    composers,
    title,
    description,
    audioUrl,
    scoreUrl,
  } = req.body;
  let savedContribution;

  try {
    const contribution = new Contribution({
      name: name,
      country: country,
      bio: bio,
      profilePictureUrl: profilePictureUrl,
      contactUrl: contactUrl,
      donateUrl: donateUrl,
      composers: composers,
      title: title,
      description: description,
      audioUrl: audioUrl,
      scoreUrl: scoreUrl,
    });
    savedContribution = await contribution.save();
  } catch (err) {
    return next(err);
  }

  res.sendStatus(200);
});

module.exports = router;
