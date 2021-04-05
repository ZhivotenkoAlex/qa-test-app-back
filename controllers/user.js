const { findByToken } = require("../model/users");
const { HttpCode } = require("../helpers/constants");

const userInformation = async (req, res, next) => {
  try {
    const [, token] = req.get("Authorization").split(" ");

    const user = await findByToken(token);

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
