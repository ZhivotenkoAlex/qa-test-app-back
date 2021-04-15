// const jwt = require("jsonwebtoken");
const { findByID } = require("../model/users");
const { HttpCode } = require("../helpers/constants");

// require("dotenv").config();
// const SECRET_KEY = process.env.JWT_SECRET;

const userInformation = async (req, res, next) => {
  try {
    // const [, token] = req.get("Authorization").split(" ");

    // const decoded = jwt.verify(token, SECRET_KEY);
    // console.log(decoded);

    const user = await findByID(req.user._id);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        email: user.email,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { userInformation };
