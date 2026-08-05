const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const wrapAsync = require("../utils/wrapAsync");

router.post("/signup", wrapAsync(userController.Signup));
router.post("/login", wrapAsync(userController.Login));

module.exports = router;
