const mongoose = require("mongoose");

const PieceSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

PieceSchema.index({ path: 1 });
PieceSchema.index({ title: "text", description: "text" });

const Piece = mongoose.model("Piece", PieceSchema);
module.exports = Piece;
