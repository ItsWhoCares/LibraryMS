const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserById) {
  const authenticateUser = async (id, password, done) => {
    const user = await getUserById(id);
    if (!user) {
      return done(null, false, { message: "No user with that email" });
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
