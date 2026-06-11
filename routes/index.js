const router = require("express").Router();
const createError = require("http-errors");
const api = require("./api");
const {
  ensureAuthenticated,
  ensureAuthenticatedPieces,
  forwardAuthenticated,
} = require("../config/auth");

async function fetchContributorWithPieces(path) {
  const contributor = await api.getContributor(path);
  await api.getProfilePicture(contributor);
  const pieces = await api.getPieces(path);
  return { contributor, pieces };
}

// home
router.get("/", async (req, res, next) => {
  console.log("[HOME] req.user:", req.user ? req.user.email : null);
  console.log("[HOME] session:", req.session);
  console.log("[HOME] cookies:", req.headers.cookie);
  try {
    const threeContributors = await api.getThreeRandomFeaturedContributors();
    const paths = threeContributors.map((c) => c.path);

    const [firstContributor, secondContributor, thirdContributor] =
      await Promise.all(paths.map(fetchContributorWithPieces));

    res.render("home", {
      title: "Home",
      user: req.user,
      firstContributor,
      secondContributor,
      thirdContributor,
    });
  } catch (error) {
    return next(createError(400, error.message));
  }
});

// seven guitar craft themes book
router.get("/seven-guitar-craft-themes-book", (req, res) =>
  res.render("book", {
    title: "The Seven Guitar Craft Themes Book",
    user: req.user,
  }),
);

// about us
router.get("/about-us", (req, res) =>
  res.render("about-us", {
    title: "About Us",
    user: req.user,
  }),
);

// contact
router.get("/contact", (req, res) =>
  res.render("contact", {
    title: "Contact",
    user: req.user,
    body: req.session.body,
  }),
);

// aphorisms
router.get("/aphorisms", (req, res) =>
  res.render("aphorisms", {
    title: "Guitar Craft Aphorisms",
    user: req.user,
  }),
);

router.get("/discord", ensureAuthenticated, (req, res) => {
  res.redirect("https://discord.gg/a6FwyqUAKH");
});

// contribute
router.get("/contribute", (req, res) =>
  res.render("contribute", {
    title: "Contribute",
    user: req.user,
    body: req.session.body,
  }),
);

// scores picks and strings
router.get("/scores-picks-and-strings", (req, res) =>
  res.render("scores-picks-and-strings", {
    title: "Scores, Picks & Strings",
    user: req.user,
  }),
);

// the tuning
router.get("/the-tuning", (req, res) =>
  res.render("the-tuning", {
    title: "The Guitar Craft Tuning",
    user: req.user,
  }),
);

// search
router.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query;
    const pieces = await api.getPiecesThatMatchQuery(q);
    const contributors = await api.getContributorsThatMatchQuery(q);

    res.render("search", {
      title: "Search",
      user: req.user,
      pieces: pieces,
      contributors: contributors,
      query: q,
    });
  } catch (error) {
    return next(createError(400, error.message));
  }
});

// login
router.get("/login", forwardAuthenticated, (req, res) =>
  res.render("login", {
    title: "Login",
  }),
);

router.get("/music-catalog", async (req, res, next) => {
  try {
    const groups = await api.getGroupContributors();
    await api.getAllProfilePictures(groups);
    const individuals = await api.getIndividualContributors();
    await api.getAllProfilePictures(individuals);

    res.render("music-catalog", {
      title: "Music Catalog",
      user: req.user,
      groups: groups,
      individuals: individuals,
    });
  } catch (error) {
    return next(createError(400, error.message));
  }
});

router.get("/music-catalog/:path", async (req, res, next) => {
  try {
    const pathOne = req.params.path;
    const contributorOne = await api.getContributor(pathOne);

    // invalid path returns to home
    if (!contributorOne) {
      return res.redirect("/");
    }

    await api.getProfilePicture(contributorOne);
    const pieces = await api.getPieces(pathOne);

    const title = contributorOne.name;
    if (pieces.length > 1) {
      // clicked contributor has more than one piece
      return res.render("multiple-contributor", {
        title: title,
        user: req.user,
        contributor: contributorOne,
        pieces: pieces,
      });
    } else {
      // clicked contributor has exactly one piece
      const firstContributor = {};
      firstContributor.contributor = contributorOne;
      firstContributor.pieces = pieces;

      const twoContributors = await api.getTwoRandomContributorsExcept(pathOne);
      const sidePaths = twoContributors.map((c) => c.path);

      const [secondContributor, thirdContributor] =
        await Promise.all(sidePaths.map(fetchContributorWithPieces));

      res.render("single-contributor", {
        title: title,
        user: req.user,
        firstContributor,
        secondContributor,
        thirdContributor,
      });
    }
  } catch (error) {
    return next(createError(400, error.message));
  }
});

// redirect for social media legacy urls
router.get("/contributors/:path", async (req, res) => {
  res.redirect(`/music-catalog/${req.params.path}`);
});

module.exports = router;
