const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth");
const { register, login } = require("./validation");
const guard = require("../../helpers/guard");

router.post("/register", register, authController.register);

router.post("/login", login, authController.login);

router.get("/google", authController.googleAuth);

router.get("/google-redirect", authController.googleRedirect);

router.get("/refresh-token", guard, authController.updateTokens);

router.post("/logout", guard, authController.logout);

module.exports = router;
