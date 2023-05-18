const bcrypt = require("bcryptjs");
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user3",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  user3: {
    id: "user3",
    email: "jamil@hotmail.com",
    password:bcrypt.hashSync("123", 10)
  }
};

function urlsForUser(id) {
  let userCreatedUrls = {};
  for (let ID in urlDatabase) {
    if (urlDatabase[ID]["userID"] === id) {
      userCreatedUrls[ID] = urlDatabase[ID];
    }
  } return userCreatedUrls;
}


function generateRandomString() {
  let shortId = '';
  let alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * alphanumeric.length);
    shortId += alphanumeric[index];
  }
  return shortId;
}


function getUserByEmail(email,database) {
  for (entry in database){
    if (email === database[entry].email) {
      return database[entry];
    }}
}


module.exports={getUserByEmail,users,urlDatabase,urlsForUser,generateRandomString};