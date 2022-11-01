const express = require("express");
const app = express();
const User = require("./model/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

mongoose
  .connect("mongodb://10.166.0.199:27017/authDemo")
  .then(() => {
    console.log("Mongo Connection Open!!");
  })
  .catch((e) => {
    console.log("Oh no Mongo error");
    console.log(e);
  });

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "notagoodsecrete" }));

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/", (req, res) => {
  res.send("This is the homepage");
});

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const user = new User({ username, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { password, username } = req.body;
  const foundUser = await User.findAndValidate(username, password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  // req.session.destroy();
  res.redirect("/login");
});

app.get("/secret", requireLogin, (req, res) => {
  res.render("secret");
});

app.get("/topsecret", requireLogin, (req, res) => {
  res.send("TOP secret");
});

app.listen(8080, () => {
  console.log("Serving the APP");
});
