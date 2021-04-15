const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const Users = require("../model/users");
const Sessions = require("../model/sessions");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

const params = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, async (payload, done) => {
    try {
      const user = await Users.findByID(payload.userID);

      if (!user) {
        return done(new Error("Not authorized"));
      }

      const session = await Sessions.findByID(payload.sessionID);

      const comparison =
        session.userID.toString().trim() === user._id.toString().trim();

      if (!session || !comparison) {
        return done(null, false);
      }

      return done(null, {
        user,
        session,
      });
    } catch (e) {
      done(e);
    }
  })
);
