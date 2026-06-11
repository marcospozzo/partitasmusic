const mongoose = require("mongoose");
const random = require("mongoose-simple-random");

const ContributorSchema = new mongoose.Schema(
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
    bio: {
      type: String,
      max: 1024,
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
    type: {
      type: String,
      enum: ["featured", "not-featured"],
    },
  },
  { timestamps: true }
);

ContributorSchema.index({ path: 1 });
ContributorSchema.index({ category: 1 });
ContributorSchema.index({ type: 1 });
ContributorSchema.index({ name: "text", bio: "text", country: "text" });

ContributorSchema.plugin(random);
const Contributor = mongoose.model("Contributor", ContributorSchema);
module.exports = Contributor;
