const dotenv = require("dotenv").config();
const Piece = require("../models/Piece");
const Contributor = require("../models/Contributor");
const aphorisms = require("../models/aphorism/aphorisms");
const router = require("express").Router();
const sendMail = require("../models/email/contact");
const {
  ensureAuthenticatedPieces,
  ensureAuthenticatedForm,
} = require("../config/auth");
const AWS = require("aws-sdk");
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

async function getPieces(path) {
  return Piece.find({ path: path }).exec();
}

async function getPiecesThatMatchQuery(query) {
  try {
    const pieces = await Piece.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    return pieces;
  } catch (err) {
    console.error(err);
  }
}

async function getContributorsThatMatchQuery(query) {
  try {
    const contributors = await Contributor.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { contact: { $regex: query, $options: "i" } },
        { donate: { $regex: query, $options: "i" } },
      ],
    });
    await getAllProfilePictures(contributors);
    return contributors;
  } catch (err) {
    console.error(err);
  }
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

async function getAllProfilePictures(array) {
  await Promise.all(
    array.map(async (element) => await getProfilePicture(element))
  );
}

router.get("/audio/:folder/:fileName", (req, res) => {
  const path = `${req.params.folder}/${req.params.fileName}`;
  const audio = getS3FileStream(path);
  res.attachment(path);
  audio.pipe(res);
});

router.get(
  "/scores/:folder/:fileName",
  ensureAuthenticatedPieces,
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
  try {
    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: myBucket,
      Key: `${path}/${key}`,
      Expires: signedUrlExpireSeconds,
    });
    return signedUrl;
  } catch (err) {
    console.log("Error getting S3 temp URL:", err);
    throw err;
  }
}

async function getPdfS3TempUrl(path, key) {
  try {
    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: myBucket,
      Key: `${path}/${key}`,
      Expires: signedUrlExpireSeconds,
      ResponseContentDisposition: "inline",
      ResponseContentType: "application/pdf",
      ResponseContentEncoding: "bytes",
      ResponseCacheControl: "no-cache",
    });
    return signedUrl;
  } catch (err) {
    console.log("Error getting PDF S3 temp URL:", err);
    throw err;
  }
}

// aphorism
router.get("/aphorism", async (req, res) => {
  const aphorism = aphorisms.getAphorismOfTheDay();
  res.send(aphorism);
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

// get pieces
router.get("/get-pieces/:path", async (req, res) => {
  const pieces = await getPieces(req.params.path);

  res.send(pieces);
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
  "/create-contributor",
  verifyToken,
  upload.single("image"),
  validateRequiredFields(
    ["name", "sortBy", "country", "category", "path", "type"],
    ["image"]
  ),
  async (req, res, next) => {
    const {
      name,
      sortBy,
      country,
      contact,
      donate,
      category,
      bio,
      type,
      path,
    } = req.body;
    const imageFile = req.file;

    try {
      const fileExtension = nodePath.extname(imageFile.originalname);
      const imageFileName = `${path}${fileExtension}`;
      await uploadFileToS3(imageFile, path, imageFileName);

      const contributor = new Contributor({
        name: name,
        sort: sortBy,
        picture: imageFileName,
        country: country,
        bio: bio,
        contact: contact,
        donate: donate,
        category: category,
        path: path,
        type: type,
      });
      await contributor.save();
      res.status(200).json({ success: "Contributor created" });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/update-contributor",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    const imageFile = req.file;
    const {
      name,
      sortBy,
      country,
      bio,
      contact,
      donate,
      category,
      path,
      type,
    } = req.body;

    try {
      let contributor = await Contributor.findOne({ path: path });
      contributor.name = name;
      contributor.sort = sortBy; // rename was needed on frontend side to differ from js sort function
      contributor.country = country;
      contributor.bio = bio;
      contributor.contact = contact;
      contributor.donate = donate;
      contributor.category = category;
      (type === "featured" || type === "not-featured") &&
        (contributor.type = type);

      // update profile picture if present
      if (imageFile) {
        const fileExtension = nodePath.extname(imageFile.originalname);
        const imageFileName = `${path}${fileExtension}`;
        await uploadFileToS3(imageFile, path, imageFileName);
        contributor.picture = imageFileName;
      }
      await contributor.save();
      res.status(200).json({ success: "Contributor updated" });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
);

router.post(
  "/create-Piece/:path",
  verifyToken,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "score", maxCount: 1 },
  ]),
  validateRequiredFields(["title", "description"], ["audio", "score"]),
  async (req, res, next) => {
    const audioFile = req.files["audio"][0];
    const scoreFile = req.files["score"][0];
    const { title, description } = req.body;
    const path = req.params.path;

    try {
      // upload audio file
      const audioFileExtension = nodePath.extname(audioFile.originalname);
      const audioFileName = convertToSlug(title) + `${audioFileExtension}`;
      await uploadFileToS3(audioFile, path, audioFileName);

      // upload score file
      const scoreFileExtension = nodePath.extname(scoreFile.originalname);
      const scoreFileName = convertToSlug(title) + `${scoreFileExtension}`;
      await uploadFileToS3(scoreFile, path, scoreFileName);
      const piece = new Piece({
        title: title,
        description: description,
        audio: audioFileName,
        score: scoreFileName,
        path: path,
      });
      await piece.save();
      res.status(200).json({ success: "Piece created" });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/update-piece",
  verifyToken,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "score", maxCount: 1 },
  ]),
  validateRequiredFields(["id", "title", "description"], []),
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
      let piece = await Piece.findById(id);
      piece.title = title;
      piece.description = description;

      // update audio file if present
      if (audioFile) {
        const fileExtension = nodePath.extname(audioFile.originalname);
        const audioFileName = convertToSlug(title) + `${fileExtension}`;
        await uploadFileToS3(audioFile, piece.path, audioFileName);
        piece.audio = audioFileName;
      }

      // update score file if present
      if (scoreFile) {
        const fileExtension = nodePath.extname(scoreFile.originalname);
        const scoreFileName = convertToSlug(title) + `${fileExtension}`;
        await uploadFileToS3(scoreFile, piece.path, scoreFileName);
        piece.score = scoreFileName;
      }
      await piece.save();
    } catch (err) {
      console.error(err);
      return next(err);
    }
    res.status(200).json({ success: "Piece updated" });
  }
);

async function uploadFileToS3(file, path, fileName) {
  const params = {
    Bucket: myBucket,
    Key: `${path}/${fileName}`,
    Body: file.buffer,
  };

  try {
    const data = await new Upload({
      client: s3,
      params,
    }).done();
    console.log("Upload Success", data.Location);
    return data;
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
}

router.get("/verifyToken", verifyToken, (req, res) => {
  return res.sendStatus(200);
});

// middleware
function verifyToken(req, res, next) {
  jwt.verify(
    req.header("x-access-token"),
    process.env.CMS_TOKEN,
    function (err) {
      return err ? res.sendStatus(498) : next();
    }
  );
}

// middleware
function validateRequiredFields(fieldsArray, filesArray) {
  return (req, res, next) => {
    for (const field of fieldsArray) {
      if (!req.body[field] || req.body[field] === "undefined") {
        return res
          .status(400)
          .json({ error: `Missing required field: ${field}` });
      }
    }
    if (filesArray.length === 1) {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: `Missing required file: ${filesArray[0]}` });
      }
    } else {
      for (const file of filesArray) {
        if (!req.files || !req.files[file] || !req.files[file][0]) {
          return res
            .status(400)
            .json({ error: `Missing required file: ${file}` });
        }
      }
    }
    next();
  };
}

function convertToSlug(string) {
  return string.trim().replace(/\s+/g, "-").replace(/-+/g, "-").toLowerCase();
}

module.exports = router;
module.exports.getGroupContributors = getGroupContributors;
module.exports.getIndividualContributors = getIndividualContributors;
module.exports.getContributor = getContributor;
module.exports.getPieces = getPieces;
module.exports.getProfilePicture = getProfilePicture;
module.exports.getTwoRandomContributorsExcept = getTwoRandomContributorsExcept;
module.exports.getThreeRandomFeaturedContributors =
  getThreeRandomFeaturedContributors;
module.exports.getAllProfilePictures = getAllProfilePictures;
module.exports.getPiecesThatMatchQuery = getPiecesThatMatchQuery;
module.exports.getContributorsThatMatchQuery = getContributorsThatMatchQuery;
