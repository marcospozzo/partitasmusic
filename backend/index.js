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
    useCreateIndex: true,
  })
  .then(() => console.log('Connected to database'))
  .catch((error) => {
    console.log(error);
    // sendEmailAlert(error); TODO
  });

// middleware
app.use(express.json());

// routes middlewares
app.use('/api/user', authRoute);

app.listen(PORT || 3000, () => console.log(`Server started at ${PORT}`));

// testground

// const User = require('./model/User');
// const Token = require('./model/User');
// const user = new User.User();
// const token = new Token.Token();
// console.log(user.token.isValid());
// const token = user.createToken();
// console.log(user);
// console.log(token);
// user.token = token;
// console.log(user);
// console.log(user.token.isValid());

// const mailing = require('./email/email');
// const data = {
//   to: 'info@partitasmusic.com',
//   subject: `New account request `,
//   text: `requested an account with the following email address:.\n\n
//             Click on the following URL to APPRO'\n''\n'
//             Click on the following URL to REJECT`,
//   html: '',
// };
// mailing(data).catch(console.error);
