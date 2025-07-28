const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// check user availability
const userAvailable = (username) => {
  let matchingUser = users.filter(user => user.username === username);
  if (matchingUser.length > 0) {
    return true;
  } else {
    return false;
  }
};

//register new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (username && password) {
    //check if user already exist
    if (!userAvailable(username)) {
      //add new user
      users.push({"username": username, "password": password});
      res.status(201).json({ message: `User successfuly registered, welcome ${username}` });
    } else {
      res.status(401).json({ message: "User already exist" });
    }
  }
  res.status(400).json({ message: "Unable to register user" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
 function getBooks() {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            resolve(books)
        }, 3000)
    })
};
  getBooks()
  .then((listOfBooks) => {
    res.status(200);
    res.send(JSON.stringify(listOfBooks, null, 4));
  })
  .catch((Error) => {
    res.status(500).json({ message: "An error occured" });
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve(book)
        } else {
          reject("No book found by this isbn")
        }
      }, 3000)
    });
    let getIsbn = req.params.isbn;
    getBookByISBN(getIsbn)
      .then((book) => {
        res.status(200);
        res.send(book);
      })
      .catch((Error) => {
        res.status(404).json({ message: "An error occured" });
      })
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let matchingBooks = []
            for(let isbn in books) {
                let book = books[isbn];
                if(book.author.toLowerCase().includes(author)) {
                    matchingBooks.push(book)
                }
            }
            if(matchingBooks.length > 0) {
                resolve(matchingBooks)
            }
            else {
                reject("No book found for this author")
            }
            
        }, 3000)
    })
};
  let getAuthor = req.params.author.toLocaleLowerCase();
  getBooksByAuthor(getAuthor)
  .then((bookByAuthor) => {
    res.status(200).send(bookByAuthor);
  })
  .catch((Error) => {
    res.status(404).json({ message: "An error occured" });
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
 function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let matchedBooks = []
            for(let isbn in books) {
                const book = books[isbn];
                if(book.title.toLowerCase().includes(title)) {
                    matchedBooks.push(book)
                }
            }
            if(matchedBooks.length > 0) {
                resolve(matchedBooks);
            }
            else {
                reject("No book found with this title")
            }
        })
    })
};
  let getTitle = req.params.title.toLocaleLowerCase();
  getBooksByTitle()
  .then((matchedBooks) => {
    res.status(200).send(matchedBooks);
  })
  .catch((Error) => {
    res.status(404).json({ message: "An error occured" });
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 let searchReview = req.params.isbn;
 let book = books[searchReview];
 if (book) {
  res.status(200);
  res.json(book.review);
 } else {
  res.status(400).json({ message: `Book with ISBN: ${searchReview} not found` });
 }
});

module.exports.general = public_users;
