const router = require("express").Router();
const createError = require("http-errors");
const api = require("./api");
const {
  ensureAuthenticated,
  ensureAuthenticatedContributions,
  forwardAuthenticated,
} = require("../config/auth");

// home
router.get("/", (req, res) =>
  res.render("home", {
    title: "Home",
    user: req.user,
  })
);

// seven guitar craft themes book
router.get("/seven-guitar-craft-themes-book", (req, res) =>
  res.render("seven", {
    title: "Book",
    user: req.user,
  })
);

// forum
router.get("/forum", (req, res) =>
  res.render("forum", {
    title: "Forum / Q&A",
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
  })
);

// aphorisms
router.get("/aphorisms", (req, res) =>
  res.render("aphorisms", {
    title: "Aphorisms",
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
  })
);

// picks and strings
router.get("/picks-and-strings", (req, res) =>
  res.render("picks-and-strings", {
    title: "Picks & Strings",
    user: req.user,
  })
);

// login
router.get("/login", forwardAuthenticated, (req, res) =>
  res.render("login", {
    title: "Login",
  })
);

// contributors
router.get("/contributors", async (req, res) => {
  try {
    const groups = await api.getGroupContributors();
    const individuals = await api.getIndividualContributors();
    res.render("contributors", {
      title: "Contributors",
      user: req.user,
      groups: groups,
      individuals: individuals,
    });
  } catch (error) {
    console.error(error);
    createError(400, "Error");
  }
});

// contributions
router.get("/contributions/:path", async (req, res) => {
  try {
    const pathOne = req.params.path;
    let contributorOne = await api.getContributor(pathOne);
    contributorOne = await api.getProfilePicture(contributorOne);
    const contributionOne = await api.getContributions(pathOne);
    const firstContributor = {};
    firstContributor.contributor = contributorOne;
    firstContributor.contribution = contributionOne[0];

    const twoContributors = await api.getTwoRandomContributorsExcept(pathOne);

    const pathTwo = twoContributors[0].path;
    let contributorTwo = await api.getContributor(pathTwo);
    contributorTwo = await api.getProfilePicture(contributorTwo);
    const contributionTwo = await api.getContributions(pathTwo);
    const secondContributor = {};
    secondContributor.contributor = contributorTwo;
    secondContributor.contribution = contributionTwo[0];

    const pathThree = twoContributors[1].path;
    let contributorThree = await api.getContributor(pathThree);
    contributorThree = await api.getProfilePicture(contributorThree);
    const contributionThree = await api.getContributions(pathThree);
    const thirdContributor = {};
    thirdContributor.contributor = contributorThree;
    thirdContributor.contribution = contributionThree[0];

    res.render("contributions", {
      title: "Contributions",
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

module.exports = router;
