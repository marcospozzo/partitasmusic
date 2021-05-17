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
    body: req.session.body,
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
    title: "The Tuning",
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
router.get("/contributors/:path", async (req, res) => {
  try {
    const pathOne = req.params.path;
    let contributorOne = await api.getContributor(pathOne);

    // invalid path returns to home
    if (!contributorOne) {
      return res.redirect("/");
    }

    contributorOne = await api.getProfilePicture(contributorOne);
    const contributionsOne = await api.getContributions(pathOne);

    if (contributionsOne.length > 1) {
      // clicked contributor has more than one contribution
      return res.render("multiple-contributor", {
        title: "Contributor",
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
      let contributorTwo = await api.getContributor(pathTwo);
      contributorTwo = await api.getProfilePicture(contributorTwo);
      const secondContributor = {};
      secondContributor.contributor = contributorTwo;
      secondContributor.contributions = await api.getContributions(pathTwo);

      const pathThree = twoContributors[1].path;
      let contributorThree = await api.getContributor(pathThree);
      contributorThree = await api.getProfilePicture(contributorThree);
      const thirdContributor = {};
      thirdContributor.contributor = contributorThree;
      thirdContributor.contributions = await api.getContributions(pathThree);

      res.render("contributions", {
        title: "Contributions",
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

module.exports = router;
