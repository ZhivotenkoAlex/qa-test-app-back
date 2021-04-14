const jwt = require("jsonwebtoken");
const axios = require("axios");
const queryString = require("query-string");
const Users = require("../model/users");
const { HttpCode } = require("../helpers/constants");

require("dotenv").config();
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

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

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "2h" });
    const refreshToken =jwt.sign(payload,JWT_REFRESH_SECRET, {expiresIn:"30d"})

    await Users.updateToken(id, accessToken,refreshToken);

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        // We don`t need tokens when we registring 
        // accessToken,
        // refreshToken,
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

    const id = user._id;

    const payload = { id };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" })
    
    await Users.updateToken(id, accessToken, refreshToken);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        id,
        accessToken,
        refreshToken,
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
  const userID = req.user.id;

  try {
    await Users.updateToken(userID, null);

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
        Authorization: `Bearer ${tokenData.data.accessToken}`,
      },
    });

    let user = await Users.findByEmail(userData.data.email);

    if (!user) {
      user = await Users.createWithGoogle(userData.data.email);
    }

    const id = user._id;

    const payload = { id };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" })

    await Users.updateToken(id, accessToken,refreshToken);

    return res.redirect(`${process.env.FRONTEND_URL}/auth/google?token=${accessToken}`);
  } catch (e) {
    next(e);
  }
};

const token = async (req, res, next) => {
  try {
    const tokenUser = req.body.refreshToken;
    const user = await Users.findByRefreshToken(tokenUser);

    const id = user._id;

    const payload = { id };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" })
    
    await Users.updateToken(id, accessToken, refreshToken);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        accessToken,
        refreshToken,
        mes:user.email
      },
      message: "refresh"
      });
    
  } catch (error) {
    next(error);
  }
}

const GetAccessToken = async (req, res) => {
  const userID = req.user.id;
  
  const payload = { userID };
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" })
    return res.json({ status: true, message: 'login success.', data: { accessToken, refreshToken } })
}



module.exports = { register, login, logout, googleAuth, googleRedirect, GetAccessToken, token };
