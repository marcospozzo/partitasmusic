const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// routes import
const authRoute = require('./routes/auth');

// db connect
mongoose
  .connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log('Connected to database'))
  .catch((error) => console.log(error));

// middleware
app.use(express.json());

// routes middlewares
app.use('/api/user', authRoute);

app.listen(PORT || 3000, () => console.log(`Server started at ${PORT}`));
