const passport = require("passport");
const { HttpCode } = require("./constants");

require("../config/passport");

const guard = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, data) => {
    // const token = req.get("Authorization")?.split(" ")[1];

    if (!data || err) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        data: "Unauthorized",
        message: "Not authorized",
      });
    }

    req.user = data.user;
    req.session = data.session;

    next();
  })(req, res, next);
};

module.exports = guard;
