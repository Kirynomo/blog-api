const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const wrapAsync = require("../utils/wrapAsync");
const { userVerification } = require("../middlewares/authMiddleware");
const authLimiter = require("../middlewares/rateLimiter");

router.post("/signup", authLimiter, wrapAsync(userController.Signup));
router.post("/login", authLimiter, wrapAsync(userController.Login));
router.post("/logout", wrapAsync(userController.Logout));
router.post("/refresh", wrapAsync(userController.Refresh));
router.get("/profile", userVerification, wrapAsync(userController.profile));

module.exports = router;
