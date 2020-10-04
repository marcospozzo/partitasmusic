const router = require('express').Router();

router.get('/', (req, res) => {
  console.log(req.headers);
  res.render('index');
});

router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
