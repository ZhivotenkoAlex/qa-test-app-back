const { findByID } = require("../model/users");
const { HttpCode } = require("../helpers/constants");

const userInformation = async (req, res, next) => {
  try {
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
