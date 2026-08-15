const express = require("express");
const router = express.Router();
const postController = require("../controllers/posts");
const wrapAsync = require("../utils/wrapAsync");
const { userVerification } = require("../middlewares/authMiddleware");
const paginate = require("../middlewares/paginate");

router.get("/posts", userVerification, wrapAsync(postController.showAllPosts));

router.post(
  "/createPost",
  userVerification,
  wrapAsync(postController.createPost),
);

router.get("/post/:id", userVerification, wrapAsync(postController.showPost));

router.patch("/post/:id", userVerification, wrapAsync(postController.editPost));

router.delete(
  "/post/:id",
  userVerification,
  wrapAsync(postController.destroyPost),
);

// router.get("/paginatePosts", wrapAsync(postController.getPaginatedPosts));
router.get(
  "/paginatePosts",
  paginate(),
  wrapAsync(postController.getPaginatedPosts),
);

module.exports = router;
