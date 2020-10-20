const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

function toLower(text) {
  return text.toLowerCase();
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
      set: toLower,
    },
    password: {
      type: String,
      max: 1024,
      required: false,
    },
    whoIs: {
      type: String,
      required: true,
      max: 1000,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['pending', 'rejected', 'approved', 'activated'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
const User = mongoose.model('User', UserSchema);
module.exports = User;
