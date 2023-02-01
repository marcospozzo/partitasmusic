const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 50,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
      max: 1024,
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
    },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
const User = mongoose.model("User", UserSchema);
module.exports = User;
