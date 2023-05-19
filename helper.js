const bcrypt = require("bcryptjs");
const urlDatabase = {
  xLm7sQ: {
    longURL: "https://www.hotmail.com",
    userID: "user1RandomID",
  },
  zLmop8: {
    longURL: "https://www.gmail.com",
    userID: "user1RandomID",
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
  },
  s6UdGr: {
    longURL: "https://www.yahoo.com",
    userID: "user2RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.com",
    userID: "user3RandomID",
  },
  i3xlMr: {
    longURL: "https://www.lighthouselabs.ca/",
    userID: "user3RandomID",
  },
  

};

const users = {
  user1RandomID: {
    id: "user1RandomID",
    email: "user1@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "jamil@hotmail.com",
    password: bcrypt.hashSync("123", 10)
  }
};

const urlsForUser = (id) => {
  let userCreatedUrls = {};
  for (let ID in urlDatabase) {
    if (urlDatabase[ID]["userID"] === id) {
      userCreatedUrls[ID] = urlDatabase[ID];
    }
  } return userCreatedUrls;
};


const generateRandomString = () => {
  let shortId = '';
  let alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * alphanumeric.length);
    shortId += alphanumeric[index];
  }
  return shortId;
};


const getUserByEmail = (email, database) => {
  for (let entry in database) {
    if (email === database[entry].email) {
      return database[entry];
    }
  }
};


module.exports = { getUserByEmail, users, urlDatabase, urlsForUser, generateRandomString };