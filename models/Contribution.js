const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    picture: {
      type: String,
      max: 512,
      required: true,
    },
    name: {
      type: String,
      max: 100,
      required: true,
    },
    country: {
      type: String,
      max: 50,
      required: true,
    },
    title: {
      type: String,
      max: 100,
      required: true,
    },
    description: {
      type: String,
      max: 1024,
      required: true,
    },
    contact: {
      type: String,
      max: 512,
    },
    audio: {
      type: String,
      max: 512,
      required: true,
    },
    score: {
      type: String,
      max: 512,
      required: true,
    },
    path: {
      type: String,
      max: 512,
      required: true,
    },
  },
  { timestamps: true }
);

const Contribution = mongoose.model("Contribution", UserSchema);
module.exports = Contribution;
