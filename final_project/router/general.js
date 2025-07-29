const express = require('express');
let books = require("./booksdb.js");
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
      return res.status(201).json({ message: `User successfully registered, welcome ${username}` });
    } else {
     return res.status(401).json({ message: "User already exist" });
    }
  }
   return res.status(400).json({ message: "Unable to register user" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 3000);
    });
  };

  getBooks().then((listOfBooks) => {
    res.status(200).send(JSON.stringify(listOfBooks, null, 4));
  }).catch((err) => {
    console.error("Error fetching books:", err);
    res.status(500).json({ message: "An error occurred while retrieving books" });
  });
});




// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve(book)
        } else {
          reject("No book found by this isbn")
        }
      }, 3000)
    })
  };
    let getIsbn = req.params.isbn;
    getBookByISBN(getIsbn)
      .then((book) => {
        res.status(200).send(book);
      })
      .catch((err) => {
  console.error(err);
  res.status(404).json({ message: "An error occurred" });
  });
});
  

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const getBooksByAuthor = (author) => {
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
  .catch((err) => {
  console.error(err);
  res.status(404).json({ message: "An error occurred" });
   });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const getBooksByTitle = (title) => {
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
        }, 3000);
    });
};
  let getTitle = req.params.title.toLocaleLowerCase();
  getBooksByTitle(getTitle)
  .then((matchedBooks) => {
    res.status(200).send(matchedBooks);
  })
  .catch((err) => {
  console.error(err);
  res.status(404).json({ message: "An error occurred" });
});

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 let searchReview = req.params.isbn;
 let book = books[searchReview];
 if (book) {
  res.status(200).send(book.review);
 } else {
  res.status(400).json({ message: `Book with ISBN: ${searchReview} not found` });
 }
});

module.exports.general = public_users;
