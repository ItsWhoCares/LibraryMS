if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const db = require("./dbinterface");
const path = require("path");

app.set("view-engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const initializePassport = require("./UserAuthentication");
const { stringify } = require("querystring");
const { redirect } = require("express/lib/response");
initializePassport(
  passport,
  (stfname) => db.getUserByName(stfname),
  (id) => db.getUserById(id)
);

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  req.user.then((user) => {
    res.render("index.ejs", { stfname: user.stfname });
  });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

//Authenticate user
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

//Add a new user to the database
app.post("/register", checkNotAuthenticated, async (req, res) => {
  await db.addUser(req.body.stfname, req.body.password).then((result) => {
    if (result) {
      res.redirect("/login");
    } else {
      req.flash("info", "User already exists");
      res.redirect("/register");
    }
  });
});

//Log out the user
app.delete("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/"); //Inside a callback… bulletproof!
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3000);
