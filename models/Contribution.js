const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 100,
    },
    country: {
      type: String,
      required: true,
      max: 50,
    },
    bio: {
      type: String,
      max: 2048,
      required: true,
    },
    profilePictureUrl: {
      type: String,
      max: 1024,
      required: true,
    },
    contactUrl: {
      type: String,
      max: 1024,
      required: true,
    },
    donateUrl: {
      type: String,
      max: 1024,
    },
    composers: {
      type: String,
      required: true,
      max: 100,
    },
    title: {
      type: String,
      required: true,
      max: 50,
    },
    description: {
      type: String,
      max: 20,
      required: true,
    },
    audioUrl: {
      type: String,
      max: 1024,
      required: true,
    },
    scoreUrl: {
      type: String,
      max: 1024,
      required: true,
    },
  },
  { timestamps: true }
);

const Contribution = mongoose.model("Contribution", UserSchema);
module.exports = Contribution;
