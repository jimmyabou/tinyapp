let { users, urlDatabase } = require('./data');

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


module.exports = { getUserByEmail, urlsForUser, generateRandomString };