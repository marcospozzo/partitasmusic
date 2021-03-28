const mongoose = require("mongoose");
const random = require("mongoose-simple-random");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      max: 100,
      required: true,
    },
    sort: {
      type: String,
      max: 50,
      required: true,
    },
    picture: {
      type: String,
      max: 512,
      required: true,
    },
    country: {
      type: String,
      max: 50,
      required: true,
    },
    contact: {
      type: String,
      max: 512,
    },
    donate: {
      type: String,
      max: 512,
    },
    category: {
      type: String,
      enum: ["group", "individual"],
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

UserSchema.plugin(random);
const Contributor = mongoose.model("Contributor", UserSchema);
module.exports = Contributor;
