const mongoose = require("mongoose");
const Post = require("../models/posts");
const Comment = require("../models/comments");
const User = require("../models/users");

module.exports.createComment = async (req, res) => {
  const { content } = req.body.Comment;
  const { id } = req.params;

  const comment = new Comment({
    content: content,
    owner: req.user._id,
    post: id,
  });
  await comment.save();

  res.json({ msg: "comment created !" });
};

module.exports.editComment = async (req, res) => {
  const { commId } = req.params;
  const { content } = req.body.Comment;

  const comment = await Comment.findById(commId);

  if (!req.user._id.equals(comment.owner)) {
    return res.json({ msg: "comment cant be edited, forbidden" });
  }

  await Comment.findByIdAndUpdate(commId, { content });
  res.json({ msg: "comment edited" });
};

module.exports.destroyComment = async (req, res) => {
  const { commId } = req.params;
  const comment = await Comment.findById(commId);

  if (!req.user._id.equals(comment.owner)) {
    return res.json({ msg: "cant delete, forbidden" });
  }

  await comment.deleteOne();
  res.json({ msg: "deleted successfully" });
};
