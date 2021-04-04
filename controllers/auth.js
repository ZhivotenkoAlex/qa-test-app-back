const jwt = require("jsonwebtoken");
const Users = require("../model/users");
const { HttpCode } = require("../helpers/constants");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

const register = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await Users.findByEmail(email);

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        data: "Conflict",
        message: "Email in use",
      });
    }

    const newUser = await Users.create(req.body);

    const id = newUser._id;

    const payload = { id };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

    await Users.updateToken(id, token);

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        token,
        user: {
          name: newUser.name,
          email: newUser.email,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findByEmail(email);

    if (!user || !(await user.validPassword(password))) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        data: "Unauthorized",
        message: "Email or password is wrong",
      });
    }

    const id = user._id;

    const payload = { id };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

    await Users.updateToken(id, token);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        token,
        user: {
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  const userID = req.user.id;

  await Users.updateToken(userID, null);

  return res.status(HttpCode.NO_CONTENT).json({});
};

module.exports = { register, login, logout };
