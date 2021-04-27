const jwt = require("jsonwebtoken");
const axios = require("axios");
const queryString = require("query-string");
const { v4: uuid } = require("uuid");
const Users = require("../model/users");
const Sessions = require("../model/sessions");
const { HttpCode } = require("../helpers/constants");
const EmailService = require("../services/email");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

const createTokens = async (userID) => {
  const newSession = await Sessions.create(userID);

  const payload = { userID, sessionID: newSession._id };

  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: 60 * 60 * 24 * 30,
  });
  const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: 60 * 30 });

  await Sessions.updateToken(newSession._id, refreshToken);

  return { refreshToken, accessToken };
};

const userSessionsControl = async (userID) => {
  const allUserSessions = await Sessions.findAllUserSessions(userID);

  if (allUserSessions.length >= 5) {
    await Sessions.deleteAllUserSessions(userID);
  }
};

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

    const verificationToken = uuid();

    const emailService = new EmailService();
    await emailService.sendEmail(verificationToken, email);

    const newUser = await Users.create({ ...req.body, verificationToken });

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        user: {
          email: newUser.email,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const verify = async (req, res, next) => {
  try {
    const user = await Users.findByVerificationToken(
      req.body.verificationToken
    );

    if (user) {
      await Users.updateVerificationToken(user.id, null);

      return res.status(HttpCode.OK).json({
        status: "success",
        code: HttpCode.OK,
        message: "Verification successful",
      });
    }

    return res.status(HttpCode.BAD_REQUEST).json({
      status: "error",
      code: HttpCode.BAD_REQUEST,
      data: "Bad request",
      message: "Link is not valid ",
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findByEmail(email);

    if (
      !user ||
      !(await user.validPassword(password)) ||
      user.verificationToken
    ) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        data: "Unauthorized",
        message: "Invalid credentials",
      });
    }

    await userSessionsControl(user._id);

    const { refreshToken, accessToken } = await createTokens(user._id);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        refreshToken,
        accessToken,
        user: {
          email: user.email,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  const sessionID = req.session._id;

  try {
    await Sessions.remove(sessionID);

    return res.status(HttpCode.NO_CONTENT).json({});
  } catch (e) {
    next(e);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const stringifiedParams = queryString.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "),
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
    );
  } catch (e) {
    next(e);
  }
};

const googleRedirect = async (req, res, next) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const urlObj = new URL(fullUrl);

    const urlParams = queryString.parse(urlObj.search);

    const code = urlParams.code;

    const tokenData = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: "post",
      data: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
        grant_type: "authorization_code",
        code,
      },
    });

    const userData = await axios({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
      method: "get",
      headers: {
        Authorization: `Bearer ${tokenData.data.access_token}`,
      },
    });

    let user = await Users.findByEmail(userData.data.email);

    if (!user) {
      user = await Users.createWithGoogle(userData.data.email);
    }

    await userSessionsControl(user._id);

    const { refreshToken, accessToken } = await createTokens(user._id);

    return res.redirect(
      `${process.env.FRONTEND_URL}/google-redirect?access=${accessToken}&token=${refreshToken}`
    );
  } catch (e) {
    next(e);
  }
};

const updateTokens = async (req, res, next) => {
  try {
    const [, token] = req.get("Authorization").split(" ");

    const user = await Users.findByID(req.user._id);
    const session = await Sessions.findByID(req.session._id);

    const comparison = session
      ? token.toString().trim() === session.refreshToken.toString().trim()
      : false;

    if (!user || !session || !comparison) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        data: "Unauthorized",
        message: "Not authorized",
      });
    }

    await Sessions.remove(session._id);

    const { refreshToken, accessToken } = await createTokens(user._id);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        refreshToken,
        accessToken,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  register,
  verify,
  login,
  logout,
  googleAuth,
  googleRedirect,
  updateTokens,
};
