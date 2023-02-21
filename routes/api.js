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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const multer = require("multer");
const upload = multer();
const nodePath = require("path");

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
  const filter = { type: { $in: "featured" } };

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
    const score = await getPdfS3TempUrl(req.params.folder, req.params.fileName);
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

async function getPdfS3TempUrl(path, key) {
  return s3.getSignedUrlPromise("getObject", {
    Bucket: myBucket,
    Key: `${path}/${key}`,
    Expires: signedUrlExpireSeconds,
    ResponseContentDisposition: "inline",
    ResponseContentType: "application/pdf",
    ResponseContentEncoding: "bytes",
    ResponseCacheControl: "no-cache",
  });
}

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

// get pieces/contributions
router.get("/get-contributions/:path", async (req, res) => {
  const contributions = await getContributions(req.params.path);

  res.send(contributions);
});

// get contributors
router.get("/get-contributors", async (req, res) => {
  const contributors = await Contributor.find()
    .sort("sort")
    .select("name path")
    .exec();

  res.send(contributors);
});

// get contributor
router.get("/get-contributor/:path", async (req, res) => {
  const contributor = await Contributor.findOne({
    path: req.params.path,
  }).exec();

  if (contributor) {
    await getProfilePicture(contributor);
    res.send(contributor);
  } else {
    res.sendStatus(404);
  }
});

// cms login
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.sendStatus(404);
  }

  try {
    const user = await User.findOne({
      email: username,
    });
    if (!user || user.role !== "admin") {
      return res.sendStatus(404);
    } else {
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.sendStatus(404);
        }
        if (isMatch) {
          const token = jwt.sign(
            {
              id: user.id,
            },
            process.env.CMS_TOKEN,
            { expiresIn: "1w" }
          );
          const data = {
            accessToken: token,
          };
          return res.send(data);
        } else {
          return res.sendStatus(404);
        }
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(404);
  }
});

router.post(
  "/update-contributor/:path",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    const path = req.params.path;
    const imageFile = req.file;
    const { name, sortBy, country, bio, contact, donate, category } = req.body;

    try {
      let contributor = await Contributor.findOne({ path: path });
      contributor.name = name;
      contributor.sort = sortBy; // rename was needed on frontend side to differ from js sort function
      contributor.country = country;
      contributor.bio = bio;
      contributor.contact = contact;
      contributor.donate = donate;
      contributor.category = category;

      // update profile picture if present
      if (imageFile) {
        const fileExtension = nodePath.extname(imageFile.originalname);
        const imageFileName = `${path}${fileExtension}`;
        await uploadFileToS3(imageFile, path, imageFileName);
        contributor.picture = imageFileName;
      }
      await contributor.save();
    } catch (err) {
      console.error(err);
      return next(err);
    }
    res.sendStatus(200);
  }
);

function validateRequiredFields(req, res, next) {
  const requiredFields = ["title", "description"];
  const requiredFiles = ["audio", "score"];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res
        .status(400)
        .json({ error: `Missing required field: ${field}` });
    }
  }
  for (const file of requiredFiles) {
    if (!req.files || !req.files[file] || !req.files[file][0]) {
      return res.status(400).json({ error: `Missing required file: ${file}` });
    }
  }
  next();
}

router.post(
  "/create-contribution/:path",
  verifyToken,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "score", maxCount: 1 },
  ]),
  validateRequiredFields,
  async (req, res, next) => {
    const audioFile = req.files["audio"][0];
    const scoreFile = req.files["score"][0];
    const { title, description } = req.body;
    const path = req.params.path;

    try {
      // upload audio file
      const audioFileExtension = nodePath.extname(audioFile.originalname);
      const audioFileName =
        `${title.trim()}`.replace(/\s+/g, "-").toLowerCase() +
        `${audioFileExtension}`;
      await uploadFileToS3(audioFile, path, audioFileName);

      // upload score file
      const scoreFileExtension = nodePath.extname(scoreFile.originalname);
      const scoreFileName =
        `${title.trim()}`.replace(/\s+/g, "-").toLowerCase() +
        `${scoreFileExtension}`;
      await uploadFileToS3(scoreFile, path, scoreFileName);
      const contribution = new Contribution({
        title: title,
        description: description,
        audio: audioFileName,
        score: scoreFileName,
        path: path,
      });
      await contribution.save();
      res.status(200).json({ success: "Piece created" });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/update-contribution",
  verifyToken,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "score", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const { id, title, description } = req.body;
    let audioFile, scoreFile;
    if (req.files && req.files["audio"]) {
      audioFile = req.files["audio"][0];
    }
    if (req.files && req.files["score"]) {
      scoreFile = req.files["score"][0];
    }

    try {
      let contribution = await Contribution.findById(id);
      contribution.title = title;
      contribution.description = description;

      // update audio file if present
      if (audioFile) {
        const fileExtension = nodePath.extname(audioFile.originalname);
        const audioFileName =
          `${title.trim()}`.replace(/\s+/g, "-").toLowerCase() +
          `${fileExtension}`;
        await uploadFileToS3(audioFile, contribution.path, audioFileName);
        contribution.audio = audioFileName;
      }

      // update score file if present
      if (scoreFile) {
        const fileExtension = nodePath.extname(scoreFile.originalname);
        const scoreFileName =
          `${title.trim()}`.replace(/\s+/g, "-").toLowerCase() +
          `${fileExtension}`;
        await uploadFileToS3(scoreFile, contribution.path, scoreFileName);
        contribution.score = scoreFileName;
      }
      await contribution.save();
    } catch (err) {
      console.error(err);
      return next(err);
    }
    res.status(200).json({ success: "Piece saved" });
  }
);

async function uploadFileToS3(file, path, fileName) {
  const params = {
    Bucket: myBucket,
    Key: `${path}/${fileName}`,
    Body: file.buffer,
  };

  return s3
    .upload(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      }
      if (data) {
        console.log("Upload Success", data.Location);
      }
    })
    .promise();
}

// middleware
function verifyToken(req, res, next) {
  jwt.verify(
    req.header("x-access-token"),
    process.env.CMS_TOKEN,
    function (err, decoded) {
      return err ? res.sendStatus(498) : next();
    }
  );
}

router.get("/verifyToken", verifyToken, (req, res) => {
  return res.sendStatus(200);
});

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
