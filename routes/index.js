const router = require("express").Router();
const createError = require("http-errors");
const api = require("./api");
const {
  ensureAuthenticated,
  ensureAuthenticatedContributions,
  forwardAuthenticated,
} = require("../config/auth");

// home
router.get("/", async (req, res) => {
  try {
    const threeContributors = await api.getThreeRandomFeaturedContributors();

    const pathOne = threeContributors[0].path;
    const contributorOne = await api.getContributor(pathOne);
    api.getProfilePicture(contributorOne);
    const firstContributor = {};
    firstContributor.contributor = contributorOne;
    firstContributor.contributions = await api.getContributions(pathOne);

    const pathTwo = threeContributors[1].path;
    const contributorTwo = await api.getContributor(pathTwo);
    api.getProfilePicture(contributorTwo);
    const secondContributor = {};
    secondContributor.contributor = contributorTwo;
    secondContributor.contributions = await api.getContributions(pathTwo);

    const pathThree = threeContributors[2].path;
    const contributorThree = await api.getContributor(pathThree);
    api.getProfilePicture(contributorThree);
    const thirdContributor = {};
    thirdContributor.contributor = contributorThree;
    thirdContributor.contributions = await api.getContributions(pathThree);

    res.render("home", {
      title: "Home",
      user: req.user,
      firstContributor,
      secondContributor,
      thirdContributor,
    });
  } catch (error) {
    console.error(error);
    createError(400, "Error");
  }
});

// seven guitar craft themes book
router.get("/seven-guitar-craft-themes-book", (req, res) =>
  res.render("book", {
    title: "The Seven Guitar Craft Themes Book",
    user: req.user,
  })
);

// about us
router.get("/about-us", (req, res) =>
  res.render("about-us", {
    title: "About Us",
    user: req.user,
  })
);

// contact
router.get("/contact", (req, res) =>
  res.render("contact", {
    title: "Contact",
    user: req.user,
    body: req.session.body,
  })
);

// aphorisms
router.get("/aphorisms", (req, res) =>
  res.render("aphorisms", {
    title: "Guitar Craft Aphorisms",
    user: req.user,
  })
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
  })
);

// picks and strings
router.get("/picks-and-strings", (req, res) =>
  res.render("picks-and-strings", {
    title: "Picks & Strings",
    user: req.user,
  })
);

// the tuning
router.get("/the-tuning", (req, res) =>
  res.render("the-tuning", {
    title: "The Guitar Craft Tuning",
    user: req.user,
  })
);

// login
router.get("/login", forwardAuthenticated, (req, res) =>
  res.render("login", {
    title: "Login",
  })
);

router.get("/music-catalog", async (req, res) => {
  try {
    const groups = await api.getGroupContributors();
    api.getAllProfilePictures(groups);
    const individuals = await api.getIndividualContributors();
    api.getAllProfilePictures(individuals);

    // TODO -> very ugly
    await api.getContributor("");

    res.render("music-catalog", {
      title: "Music Catalog",
      user: req.user,
      groups: groups,
      individuals: individuals,
    });
  } catch (error) {
    console.error(error);
    createError(400, "Error");
  }
});

router.get("/music-catalog/:path", async (req, res) => {
  try {
    const pathOne = req.params.path;
    const contributorOne = await api.getContributor(pathOne);

    // invalid path returns to home
    if (!contributorOne) {
      return res.redirect("/");
    }

    await api.getProfilePicture(contributorOne);
    const contributionsOne = await api.getContributions(pathOne);

    const title = "Music Contributors";
    if (contributionsOne.length > 1) {
      // clicked contributor has more than one contribution
      return res.render("multiple-contributor", {
        title: title,
        user: req.user,
        contributor: contributorOne,
        contributions: contributionsOne,
      });
    } else {
      // clicked contributor has exactly one contribution
      const firstContributor = {};
      firstContributor.contributor = contributorOne;
      firstContributor.contributions = contributionsOne;

      const twoContributors = await api.getTwoRandomContributorsExcept(pathOne);

      const pathTwo = twoContributors[0].path;
      const contributorTwo = await api.getContributor(pathTwo);
      await api.getProfilePicture(contributorTwo);
      const secondContributor = {};
      secondContributor.contributor = contributorTwo;
      secondContributor.contributions = await api.getContributions(pathTwo);

      const pathThree = twoContributors[1].path;
      const contributorThree = await api.getContributor(pathThree);
      await api.getProfilePicture(contributorThree);
      const thirdContributor = {};
      thirdContributor.contributor = contributorThree;
      thirdContributor.contributions = await api.getContributions(pathThree);

      res.render("single-contributor", {
        title: title,
        user: req.user,
        firstContributor,
        secondContributor,
        thirdContributor,
      });
    }
  } catch (error) {
    console.error(error);
    createError(400, "Error");
  }
});

// redirect for social media legacy urls
router.get("/contributors/:path", async (req, res) => {
  res.redirect(`/music-catalog/${req.params.path}`);
});

module.exports = router;
