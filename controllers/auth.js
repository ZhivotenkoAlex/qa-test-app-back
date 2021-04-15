const jwt = require("jsonwebtoken");
const axios = require("axios");
const queryString = require("query-string");
const Users = require("../model/users");
const Sessions = require("../model/sessions");
const { HttpCode } = require("../helpers/constants");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

const userSessionsControl = async (userID) => {
  const quantityOfUserSessions = await Sessions.findAllUserSessions(userID);

  if (quantityOfUserSessions.length >= 5) {
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

    const newUser = await Users.create(req.body);

    const newSession = await Sessions.create(newUser._id);

    const payload = { userID: newUser._id, sessionID: newSession._id };

    const refreshToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
    });
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: 60 * 30 });

    await Sessions.updateToken(newSession._id, refreshToken);

    // await Users.updateToken(id, token);

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        refreshToken,
        accessToken,
        user: {
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

    await userSessionsControl(user._id);

    const newSession = await Sessions.create(user._id);

    const payload = { userID: user._id, sessionID: newSession._id };

    const refreshToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
    });
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: 60 * 30 });

    await Sessions.updateToken(newSession._id, refreshToken);

    // const id = user._id;

    // const payload = { id };

    // const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

    // await Users.updateToken(id, token);

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

    // const id = user._id;

    // const payload = { id };

    // const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

    await userSessionsControl(user._id);

    const newSession = await Sessions.create(user._id);

    const payload = { userID: user._id, sessionID: newSession._id };

    const refreshToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
    });
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: 60 * 30 });

    await Sessions.updateToken(newSession._id, refreshToken);

    // await Users.updateToken(id, token);

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

    const newSession = await Sessions.create(user._id);

    const payload = { userID: user._id, sessionID: newSession._id };

    const refreshToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
    });
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: 60 * 30 });

    await Sessions.updateToken(newSession._id, refreshToken);

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
  login,
  logout,
  googleAuth,
  googleRedirect,
  updateTokens,
};
