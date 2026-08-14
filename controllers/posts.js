const User = require("../models/users");
const Post = require("../models/posts");
const mongoose = require("mongoose");
const Comment = require("../models/comments");

module.exports.showAllPosts = async (req, res) => {
  // const posts = await Post.find({}).populate("author", "name -_id");
  // const comments = await Comment.find({ post: posts._id }).populate("owner");

  // res.json(
  //   posts.map((post) => ({
  //     title: post.title,
  //     author: post.author.name,
  //     content: post.content,
  //     comments: comments.content,
  //   })),
  // );

  const posts = await Post.find({}).populate("author", "name -_id");

  let result = await Promise.all(
    posts.map(async (post) => {
      const comments = await Comment.find({ post: post._id }).populate(
        "owner",
        "name -_id",
      );

      return {
        title: post.title,
        content: post.content,
        author: post.author.name,
        comments: comments.map((comment) => ({
          comment: comment.content,
          owner: comment.owner.name,
        })),
      };
    }),
  );

  res.json(result);
};

module.exports.createPost = async (req, res) => {
  const { title, content, tags } = req.body.Post;
  if (!req.body.Post || req.body.Post === null) {
    return res.json({ msg: "all details required" });
  }
  const post = await Post.create({
    title,
    content,
    tags,
    author: req.user._id,
  });
  res.json({ msg: "post created !" });
};

module.exports.showPost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  res.json(post);

  // show author, comment, and comment authors.
};

module.exports.editPost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!req.user._id.equals(post.author)) {
    return res.json({ msg: "403, forbidden" });
  }

  // await post.updateOne(req.body.Post);
  // or do this to get the updated doc in response tab as well.
  Object.assign(post, req.body.Post);
  await post.save();

  res.json({ msg: "edited!", post });
};

// IF A POST IS DELETED THEN ALL ITS COMMENTS MUST ALSO BE DELETED SO MAKE THAT USING A MIDDLEWARE
module.exports.destroyPost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return res.json({ msg: "no post found " });
  }

  if (!req.user._id.equals(post.author)) {
    return res.json({ msg: "403, forbidden" });
  }

  await post.deleteOne();
  res.json({ msg: "done" });
};
