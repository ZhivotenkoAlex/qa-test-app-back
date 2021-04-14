const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth");
const { register, login } = require("./validation");
const guard = require("../../helpers/guard");
// const middleware=require('../../middlewares/middleware')

router.post("/register", register, authController.register);

router.post("/login", login, authController.login);

router.post("/token", authController.token);

router.get("/google", authController.googleAuth);

router.get("/google-redirect", authController.token);

router.post("/logout", guard, authController.logout);

module.exports = router;
