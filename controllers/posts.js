const User = require("../models/users");
const Post = require("../models/posts");
const mongoose = require("mongoose");

module.exports.showAllPosts = async (req, res) => {
  const posts = await Post.find().populate("author", "name -_id");

  // below code is error bcus res.json can send only 1 thing not two objects. If u combine them into one still wont work bcus duplicate keys.
  // res.json(
  //   {
  //     title: posts[0].title,
  //     author: posts[0].author.name,
  //     content: posts[0].content,
  //   },
  //   {
  //     title: posts[1].title,
  //     author: posts[1].author.name,
  //     content: posts[1].content,
  //   },
  // );

  res.json(
    posts.map((post) => ({
      title: post.title,
      author: post.author.name,
      content: post.content,
    })),
  );

  //show real author name instead of just ID - done !
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
