
const express = require("express");
let cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
const PORT = 8080; // default port 8080
app.set("view engine", "ejs") // Set ejs as the view engine.
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
 app.get("/urls", (req, res) => {
  let user=req.cookies["username"];
  const templateVars = { urls: urlDatabase ,username: user};
  res.render("urls_index", templateVars);
  console.log(templateVars);
  console.log(user);
  // res.render("urls_show", templateVars);
  // res.render("urls_new", templateVars);
  //res.render("./_header", templateVars);

});


app.get("/urls/new", (req, res) => {
  let user=req.cookies["username"];
  const templateVars = { urls: urlDatabase ,username: user};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortId=generateRandomString();
  urlDatabase[shortId]=req.body["longURL"];
  let result=urlDatabase;
  res.redirect(`urls/${shortId}`);
  res.send(result); // Respond with 'Ok' (we will replace this)
});
app.get("/u/:id", (req, res) => {
  let user=req.cookies["username"];
  const templateVars = { urls: urlDatabase ,username: user};
  res.render("urls_new", templateVars);
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let user=req.cookies["username"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],username: user };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id/delete", (req,res)=>{
  let deleteId=req.params.id;
  delete urlDatabase[deleteId];
  console.log(urlDatabase);
  res.redirect('/urls');
})
app.post("/urls/:id", (req,res)=>{
  let EditId=req.params.id;
  urlDatabase[EditId]=req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${EditId}`);
})
app.post("/login", (req,res)=>{
  let username=req.body.username;
  res.cookie("username",username);
  res.redirect(`/urls`);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});