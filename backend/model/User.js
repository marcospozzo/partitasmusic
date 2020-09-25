const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const randtoken = require('rand-token');

const TokenSchema = new mongoose.Schema({
  value: {
    type: String,
    default: function () {
      return randtoken.generate(16);
    },
  },
  duration: {
    type: Number,
    default: 60000, // 1440000 is one day: 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

TokenSchema.methods.isValid = function () {
  return Date.now() - Date.parse(this.createdAt) < this.duration;
};

function toLower(text) {
  return text.toLowerCase();
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: toLower,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    token: {
      type: TokenSchema,
      required: false,
      // default: () => ({}),
    },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
const User = mongoose.model('User', UserSchema);
const Token = mongoose.model('Token', TokenSchema);
module.exports = { User, Token };
