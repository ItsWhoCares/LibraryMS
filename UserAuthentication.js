const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

async function initialize(passport, getUserByName, getUserById) {
  const authenticateUser = async (stfname, password, done) => {
    const user = await getUserByName(stfname);
    if (user == null) {
      return done(null, false, { message: "No user with that Name" });
    }

    try {
      if (await bcrypt.compare(password, user.hash)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "stfname" }, authenticateUser)
  );
  passport.serializeUser((user, done) => done(null, user.stfid));
  passport.deserializeUser((stfid, done) => {
    return done(null, getUserById(stfid));
  });
}

module.exports = initialize;
