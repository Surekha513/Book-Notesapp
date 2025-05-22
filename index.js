require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Book = require("./models/Book"); // ✅ Correct import path
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // ✅ Support JSON body parsing

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Home Route - List Books
app.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ rating: -1 });
    res.render("index", { books });
  } catch (err) {
    console.error("❌ Error fetching books:", err);
    res.send("Error fetching books.");
  }
});

// ✅ Add New Book - Fixed Code
app.post("/books", async (req, res) => {
  try {
    let { title, author, rating, review, date_read, isbn } = req.body;

    // Ensure required fields exist
    if (!title || !author || !isbn) {
      return res.send("❌ Title, Author, and ISBN are required.");
    }

    // Convert rating to number
    rating = Number(rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      return res.send("❌ Rating must be a number between 0 and 5.");
    }

    // Validate and format date_read
    date_read = date_read ? new Date(date_read) : null;
    if (date_read && isNaN(date_read.getTime())) {
      return res.send("❌ Invalid date format.");
    }

    // Check for duplicate ISBN
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.send("❌ A book with this ISBN already exists.");
    }

    // Generate book cover URL
    const cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

    // Create new book entry
    const newBook = new Book({ title, author, rating, review, date_read, isbn, cover_url });

    await newBook.save();
    res.redirect("/");
  } catch (err) {
    console.error("❌ Error adding book:", err);
    res.send(`❌ Error adding book: ${err.message}`);
  }
});

// ✅ Delete a Book - Fixed Code
app.post("/books/delete/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.error("❌ Error deleting book:", err);
    res.send("❌ Error deleting book.");
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
