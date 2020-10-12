const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const createError = require('http-errors');
// const expressLayouts = require('express-ejs-layouts');

// app.use(expressLayouts);
app.set('view engine', 'ejs');

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
  });

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('views'));

// middleware routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// 404 handler
app.use((req, res, next) => next(createError(404)));

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
