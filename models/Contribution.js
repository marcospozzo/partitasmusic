const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
