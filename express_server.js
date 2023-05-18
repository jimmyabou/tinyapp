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
  // let userID = req.session.user_id;
  // let user = users[userID];
  // const templateVars = { urls: urlDatabase, username: user };
  //res.render("urls_new", templateVars);

  if (urlDatabase[req.params.id] === undefined) {
    res.send("the ID you typed does not exist");
  }
  else {const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);}
});

app.get("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, username: user };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.send("login first");
  }
  let deleteId = req.params.id;
  if (urlDatabase[deleteId] === undefined) {
    res.send("ID does not exist");
  }
  if (userID === urlDatabase[deleteId].userID) {
    delete urlDatabase[deleteId];
    //console.log(urlDatabase);
    res.redirect('/urls');
  }
  else {res.send("you dont have permission to delete IDs that you did not create");}
})
app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.send("login first");
  }
  let EditId = req.params.id;
  if (urlDatabase[EditId] === undefined) {
    res.send("ID does not exist");
  }
  if (userID === urlDatabase[EditId].userID) {
    urlDatabase[EditId].longURL = req.body.longURL;
    //console.log(urlDatabase);
    // res.redirect(`/urls/${EditId}`);
    res.redirect(`/urls`);
  }
  else {res.send("you dont have permission to edit IDs that you did not create");}
})


app.post("/login", (req, res) => {
  // let acquireIdCookie = req.body.user_id;//temporarily commented out 
  // res.cookie("user_id", username);//temporarily commented out 
  // let userEmailregistered=users[acquireIdCookie].email;
  let fromUser = req.body;
  let email=req.body["email"];
  let mailCheck = getUserByEmail (email,users);
  // console.log(mailCheck);
  if (mailCheck) {
    // bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword);
    if (bcrypt.compareSync(fromUser["password"],mailCheck.password)) {
      // res.cookie("user_id", mailCheck.id);////************************************** */
      req.session.user_id=mailCheck.id;
      res.redirect(`/urls`);
    } else { res.status(403).send("password does not match") }
  } else { res.status(403).send("user is not registered") }

})


app.post("/logout", (req, res) => {
  // res.clearCookie("session");
  // res.clearCookie("session.sig");
  req.session=null;
  res.redirect(`/login`);
})

app.get("/login", (req, res) => {
  // let user = req.cookies["username"];
  // const templateVars = { urls: urlDatabase, username: user };
  let userID = req.session.user_id;
  let user = users[userID];
  const templateVars = { urls: urlDatabase, username: user };
  if (userID) {
    res.redirect('/urls');
  }
  else {res.render("login", templateVars);}
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});