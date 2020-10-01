const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');

app.set('view engine', 'ejs');

dotenv.config();

// db connect
mongoose
  .connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log('Connected to database'))
  .catch((error) => {
    console.log(error);
    // sendEmailAlert(error); TODO
  });

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  express.static('public', {
    extensions: ['html', 'htm'],
  })
);

// app.get('/', (req, res) => {
//   res.render('set');
// });

// routes middlewares
const authRoute = require('./routes/auth');
const { json } = require('express');
app.use('/api/user', authRoute);

//404 handler and pass to error handler
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error',
    },
  });
});

app.listen(PORT || 3000, () => console.log(`Server started at ${PORT}`));
