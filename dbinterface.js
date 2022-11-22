const bcrypt = require("bcrypt");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("users.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the users database.");
});

//Adds a user to the database
exports.addUser = async function addUser(stfname, password) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM staff WHERE stfname = ?", [stfname], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        resolve(false);
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            db.run(
              "INSERT INTO users (stfname, hash) VALUES (?, ?)",
              [stfname, hash],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              }
            );
          }
        });
      }
    });
  });
};

// exports.addUser = async function addUser(stfname, password) {
//   if (await getUserByName(stfname)) {
//     return false;
//   } else {
//     try {
//       hash = await bcrypt.hash(password, 10);
//       db.run(
//         "INSERT INTO staff (stfname, hash) VALUES (?, ?)",
//         [stfname, hash],
//         function (err) {
//           if (err) {
//             return console.log(err.message);
//           }
//           console.log("user added");
//           return true;
//         }
//       );
//     } catch {
//       console.log("Error");
//     }
//   }
// };

//Checks if a user exists in the database
async function getUserByName(stfname) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM staff WHERE stfname = ?", [stfname], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row) {
        resolve(row);
      } else {
        resolve(null);
      }
    });
  });
}

exports.getUserByName = getUserByName;

exports.getUserById = async function getUserById(stfid) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM staff WHERE stfid = ?", [stfid], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row) {
        resolve(row);
      } else {
        resolve(false);
      }
    });
  });
};
// exports.getUserById = async function getUserById(id) {
//   return new Promise((resolve, reject) => {
//     db.get("SELECT * FROM staff WHERE stfid = ?", [id], (err, row) => {
//       if (err) {
//         reject(err);
//       }
//       if (row) {
//         resolve(true, row);
//       } else {
//         resolve(false);
//       }
//     });
//   });
// };

//Checks if a user exists in the database and if the password is correct
exports.checkUser = async function checkUser(stfname, password) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM staff WHERE stfname = ?", [stfname], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row) {
        bcrypt.compare(password, row.hash, function (err, result) {
          if (err) {
            reject(err);
          }
          if (result) {
            resolve(true, row);
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
