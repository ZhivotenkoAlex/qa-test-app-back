const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth");
const questionsController = require("../../controllers/questions");
const { register, login } = require("./validation");
const guard = require("../../helpers/guard");

router.post("/register", register, authController.register);

router.post("/login", login, authController.login);

router.post("/logout", guard, authController.logout);

router.post("/tech-questions");

module.exports = router;
