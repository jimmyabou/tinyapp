let {getUserByEmail,users,urlDatabase,urlsForUser,generateRandomString} = require('./helper');
const express = require("express");
const bcrypt = require("bcryptjs");
// let cookieParser = require('cookie-parser');
let cookieSession = require('cookie-session');
const app = express();
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["key1"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(express.urlencoded({ extended: true }));
const PORT = 8080; // default port 8080
app.set("view engine", "ejs") // Set ejs as the view engine.

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  let username = users[userID];
  let urls = urlsForUser(userID);
  const templateVars = { urls, username };
  if (!userID) {
    return res.send("please login first");
  }
    res.render("urls_index", templateVars);
});

app.post("/register", (req, res) => {
  let email=req.body["email"];
  let pass=req.body["password"];
  let id = generateRandomString();
  if (!pass||!email) {
    return res.status(400).send("the fields can't be empty");
  }
  if (getUserByEmail (email,users)) {
    return res.status(400).send("Email already exists");
  }
    let password = bcrypt.hashSync(pass, 10);
    users[id] = { id, email, password };
    req.session.user_id = id;
    res.redirect('/urls');
  }
);
app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let username = users[userID];
  const templateVars = { urls: urlDatabase, username };
  if (!userID) {
    return res.render("form", templateVars);
  }
    res.redirect('/urls');
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
app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  let shortId = generateRandomString();
    urlDatabase[shortId] = {};
    urlDatabase[shortId].longURL = req.body["longURL"];
    urlDatabase[shortId].userID = userID;
  if (!userID) {
    return res.send("you'd better not");
  }
    // let result = urlDatabase;
    res.redirect(`urls/${shortId}`);
    // res.send(urlDatabase); 
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!urlDatabase[req.params.id]) {
    return res.send("the ID you typed does not exist");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let id = req.params.id;
  let username = users[userID];
  let longURL=urlDatabase[req.params.id].longURL;
  const templateVars = { id, longURL, username };
  res.render("urls_show", templateVars);
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
  res.send("you dont have permission to delete IDs that you did not create");}
)
app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let EditId = req.params.id;
  let longURL=req.body.longURL
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
})

app.post("/login", (req, res) => {

  let email=req.body["email"];
  let password=req.body["password"];
  let databaseUser = getUserByEmail (email,users);
  if (databaseUser) {
    if (bcrypt.compareSync(password,databaseUser.password)) {
      req.session.user_id=databaseUser.id;
      res.redirect(`/urls`);
    } else { res.status(403).send("password does not match") }
  } else { res.status(403).send("user is not registered") }
})

app.post("/logout", (req, res) => {
  req.session=null;
  res.redirect(`/login`);
})

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  let username = users[userID];
  const templateVars = { urls: urlDatabase, username };
  if (!userID) {
    return res.render("login", templateVars);
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});