const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

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
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
const User = mongoose.model("User", UserSchema);
module.exports = User;
