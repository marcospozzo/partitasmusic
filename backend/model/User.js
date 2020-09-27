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
