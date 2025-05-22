const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true },
  review: { type: String },
  date_read: { type: Date },
  isbn: { type: String, required: true, unique: true },
  cover_url: { type: String }
});

module.exports = mongoose.model("Book", BookSchema);
