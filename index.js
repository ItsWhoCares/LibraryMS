if (process.env.NODE_ENV !== "production") {
  console.log("Loading dotenv");
  require("dotenv").config();
}

const express = require("express");
const app = express();
const { readFile } = require("fs").promises;
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const db = require("./dbinterface");
const passport = require("passport");

const initializePassport = require("./UserAuthentication");
initializePassport(passport, (stfname) => db.getUserByName(stfname));

app.set("view-engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
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

app.get("/", checkAuthenticated, async (Request, Response) => {
  user = db.getUserById(Request.session.passport.user);
  user.then(() => Response.render("index.ejs", { name: user.stfname }));
});

app.get("/login", checkNotAuthenticated, (Request, Response) => {
  Response.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (Request, Response) => {
  Response.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (Request, Response) => {
  await db.addUser(Request.body.stfname, Request.body.password);
  console.log(Request.body.stfname, Request.body.password);
});

app.delete("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000: http://localhost:3000");
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
