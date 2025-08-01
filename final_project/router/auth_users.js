const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require('express-session');
const regd_users = express.Router();

let users = [];


//check users if authenticated
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username && user.password === password);
  return !!user; // returns true if user exists with matching password
};


//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (authenticatedUser(username, password)) {
    //generate jwt access token
    let accessToken = jwt.sign({ data: username }, "access", {expiresIn: 3600});
     //store access token + username in session
  req.session.authorization = {
    accessToken, username
  }
  res.status(200).json({message: "Successfully logged in"});
  } else {
    res.status(400).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;
  if (isbn) {
    let book = books[isbn];
    let username = req.session.authorization?.username;
    //modify existing review by user
    if (book.reviews.hasOwnProperty(username)) {
      book.reviews[username].review = review;
      res.status(200).json({message: "Successfully modified your review!"});
    } 
    //add new review for the user
    else {
      book.reviews[username] = {
        username: username,
        review: review,
      };
      res.status(201).json({ message: "Added your review successfully!" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

//delete existing review by user
regd_users.delete("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (isbn) {
    let book = books[isbn];
    let username = req.session.authorization?.username;
    if (book.reviews.hasOwnProperty(username)) {
      delete book.reviews[username];
      res.status(200).json({ message: `Successfully deleted ${username} review` });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
