const express = require("express");
const app = express();
const { readFile } = require("fs").promises;
const path = require("path");

const { addUser } = require("./dbinterface");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.set("view-engine", "ejs");

app.get("/", async (Request, Response) => {
  Response.render("index.ejs");
});

app.get("/login", async (Request, Response) => {
  Response.render("login.ejs");
});

app.get("/register", async (Request, Response) => {
  Response.render("register.ejs");
});

app.post("/register", async (Request, Response) => {
  await addUser(Request.body.username, Request.body.password);
  console.log(Request.body.username, Request.body.password);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000: http://localhost:3000");
});
