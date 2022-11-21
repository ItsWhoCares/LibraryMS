const bcrypt = require("bcrypt");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("users.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the users database.");
});

//Adds a user to the database
exports.addUser = async function addUser(username, password) {
  if (await hasUser(username)) {
    console.log("User already exists");
  } else {
    try {
      hash = await bcrypt.hash(password, 10);
      db.run(
        "INSERT INTO staff (stfname, hash) VALUES (?, ?)",
        [username, hash],
        function (err) {
          if (err) {
            return console.log(err.message);
          }
          console.log(`user added`);
        }
      );
    } catch {
      console.log("Error");
    }
  }
};

//Checks if a user exists in the database
exports.hasUser = async function hasUser(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM staff WHERE stfname = ?", [username], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

//Checks if a user exists in the database and if the password is correct
exports.checkUser = async function checkUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM staff WHERE stfname = ?", [username], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row) {
        bcrypt.compare(password, row.hash, function (err, result) {
          if (err) {
            reject(err);
          }
          if (result) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  });
};
