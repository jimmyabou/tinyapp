let { getUserByEmail, urlsForUser, generateRandomString } = require('./helper');
let { users, urlDatabase } = require('./data');
const express = require("express");
const bcrypt = require("bcryptjs");
let cookieSession = require('cookie-session');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ["encrypt1", "encrypt2"],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(express.urlencoded({ extended: true }));
const PORT = 8080;
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  let username = users[userID];
  if (!userID) {
    return res.send("please login first");
  }
  let urls = urlsForUser(userID);
  const templateVars = { urls, username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  const templateVars = { urls: urlDatabase, username: user };
  if (!userID) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let username = users[userID];
  let id = req.params.id;
  if (!userID) {
    return res.send("non logged in user: Please login first to view shortURL!");
  }
  if (!urlDatabase[id]) {
    return res.send("URL for the given ID does not exist!");
  }
  if (!urlsForUser(userID)[id]) {
    return res.send("User does not own the URL with the given ID!");
  }
  let longURL = urlDatabase[req.params.id].longURL;
  const templateVars = { id, longURL, username };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.json("The ID you typed does not exist");
  }
  if (!urlDatabase[req.params.id].longURL) {
    return res.json("The longURL is not assigned yet");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let username = users[userID];
  const templateVars = { urls: urlDatabase, username };
  if (!userID) {
    return res.render("registration_form", templateVars);
  }
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  let username = users[userID];
  const templateVars = { urls: urlDatabase, username };
  if (!userID) {
    return res.render("login", templateVars);
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let email = req.body["email"];
  let password = req.body["password"];
  let databaseUser = getUserByEmail(email, users);
  if (databaseUser) {
    if (bcrypt.compareSync(password, databaseUser.password)) {
      req.session.user_id = databaseUser.id;
      res.redirect(`/urls`);
    } else {
      res.status(403).send("password does not match");
    }
  } else {
    res.status(403).send("user is not registered");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session.user_id;
  let deleteId = req.params.id;
  if (!userID) {
    return res.send("login first");
  }

  if (!urlDatabase[deleteId]) {
    return res.send("ID does not exist");
  }
  if (userID === urlDatabase[deleteId].userID) {
    delete urlDatabase[deleteId];
    return res.redirect('/urls');
  }
  res.send("you dont have permission to delete IDs that you did not create");
});

app.post("/register", (req, res) => {
  let email = req.body["email"];
  let pass = req.body["password"];
  let id = generateRandomString();
  let password = bcrypt.hashSync(pass, 10);

  if (!pass || !email) {
    return res.status(400).send("the fields can't be empty");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exists");
  }
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  let shortId = generateRandomString();
  urlDatabase[shortId] = {};
  urlDatabase[shortId].longURL = req.body["longURL"];
  urlDatabase[shortId].userID = userID;
  if (!userID) {
    return res.send("you'd better not");
  }
  res.redirect(`/urls/${shortId}`);
});

app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let EditId = req.params.id;
  let longURL = req.body.longURL;
  if (!userID) {
    return res.send("login first");
  }
  if (!urlDatabase[EditId]) {
    return res.send("ID does not exist");
  }
  if (userID === urlDatabase[EditId].userID) {
    urlDatabase[EditId].longURL = longURL;
    return res.redirect(`/urls`);
  }
  res.send("you dont have permission to edit IDs that you did not create");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});