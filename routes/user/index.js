const express = require("express");
const router = express.Router();
const guard = require("../../helpers/guard");
const { userInformation } = require("../../controllers/user");

router.get("/info", guard, userInformation); 

module.exports = router;
