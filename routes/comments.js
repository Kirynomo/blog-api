const express = require("express");
const router = express.Router();
const { userVerification } = require("../middlewares/authMiddleware");
const wrapAsync = require("../utils/wrapAsync");
const commentController = require("../controllers/comments");

router.post(
  "/post/:id/comment",
  userVerification,
  wrapAsync(commentController.createComment),
);
router.patch(
  "/post/:id/comment/:commId",
  userVerification,
  wrapAsync(commentController.editComment),
);
router.delete(
  "/post/:id/comment/:commId",
  userVerification,
  wrapAsync(commentController.destroyComment),
);

module.exports = router;
