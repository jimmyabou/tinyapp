
const express = require("express");
const bcrypt = require("bcryptjs");
let cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
const PORT = 8080; // default port 8080
app.set("view engine", "ejs") // Set ejs as the view engine.
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
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

////////////////////////////////////////////////////////////////////
const users = {
  userRandomID: {
    id: "userRandomID",
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
///////////////////////////////////////////////////////////////////
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

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("node ex");
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});


function checkEmailAdressExists(users, input) {
  for (let entry in users) {
    if (input["email"] === users[entry].email) {
      return users[entry];
    }
  }
  return false;
}

function checkEmptyFields(input) {
  if (!input["email"] || !input["password"]) {
    return true;
  }
  return false;
}

app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"];
  if (userID) {
    let user = users[userID];
    let userSpecificUrls = urlsForUser(userID);
    const templateVars = { urls: userSpecificUrls, username: user };
    res.render("urls_index", templateVars);
  }
  else{res.send("please login first");}
  // console.log(templateVars);
  // console.log(user);
});

//new branch 'feature/user-registration'below
app.post("/register", (req, res) => {
  // let user = req.cookies["username"];
  // const templateVars = { urls: urlDatabase, username: user };
  // res.render("form", templateVars);
  let fromUser = req.body;
  if (checkEmptyFields(fromUser)) {
    res.status(400).send("the fields can't be empty");
  } else if (checkEmailAdressExists(users, fromUser)) {
    res.status(400).send("Email already exists");
  } else {
    // console.log(fromUser);
    let senUserEmail = fromUser["email"];
    let senUserPassword = bcrypt.hashSync(fromUser["password"], 10);///******************************* */
    let generateNewUserId = generateRandomString();
    users[generateNewUserId] = { id: generateNewUserId, email: senUserEmail, password: senUserPassword };
    console.log(users);
    //
    res.cookie("user_id", generateNewUserId);
    res.redirect('/urls');
  }
});
app.get("/register", (req, res) => {

  let userID = req.cookies["user_id"];
  let user = users[userID];
  const templateVars = { urls: urlDatabase, username: user };
  if (userID) {
    res.redirect('/urls');
  }
  else {res.render("form", templateVars);}
});
//new branch 'feature/user-registration' above

//




app.get("/urls/new", (req, res) => {
  let userID = req.cookies["user_id"];
  let user = users[userID];
  const templateVars = { urls: urlDatabase, username: user };
  if (userID) {
    res.render("urls_new", templateVars);
  }
  else {res.redirect('/login');}
});
app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  let userID = req.cookies["user_id"];
  if (userID) {
    let shortId = generateRandomString();
    urlDatabase[shortId] = {};
    urlDatabase[shortId].longURL = req.body["longURL"];
    urlDatabase[shortId].userID = userID;
    let result = urlDatabase;
    res.redirect(`urls/${shortId}`);
    res.send(result); // Respond with 'Ok' (we will replace this)
  }
  else {res.send("you'd better not");}

});
app.get("/u/:id", (req, res) => {
  // let userID = req.cookies["user_id"];
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
  let userID = req.cookies["user_id"];
  let user = users[userID];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, username: user };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.cookies["user_id"];
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
  let userID = req.cookies["user_id"];
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
  let mailCheck = checkEmailAdressExists(users, fromUser);
  // console.log(mailCheck);
  if (mailCheck) {
    // bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword);
    if (bcrypt.compareSync(fromUser["password"],mailCheck.password)) {
      res.cookie("user_id", mailCheck.id);
      res.redirect(`/urls`);
    } else { res.status(403).send("password does not match") }
  } else { res.status(403).send("user is not registered") }

})


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
})

app.get("/login", (req, res) => {
  // let user = req.cookies["username"];
  // const templateVars = { urls: urlDatabase, username: user };
  let userID = req.cookies["user_id"];
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