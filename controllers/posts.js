const User = require("../models/users");
const Post = require("../models/posts");
const mongoose = require("mongoose");
const Comment = require("../models/comments");

module.exports.showAllPosts = async (req, res) => {
  // regex search on title and author
  const { title, author } = req.query;
  if (title) {
    const posts = await Post.find({
      title: { $regex: title, $options: "i" },
    }).populate("author", "name -_id");
    res.json(
      posts.map((post) => ({ title: post.title, author: post.author.name })),
    );
  } else if (author) {
    /* method 1 
    const user = await User.find({ name: { $regex: author, $options: "i" } });
    const userIds = user.map((user) => user._id);

    const posts = await Post.find({ author: { $in: userIds } }).populate(
      "author",
      "name -_id",
    );
    */

    // method 2
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorData",
        },
      },
      {
        $match: {
          "authorData.name": {
            $regex: author,
            $options: "i",
          },
        },
      },
      // used unwind in order to have a consistent API response
      {
        $unwind: "$authorData",
      },
      {
        $project: {
          _id: 0,
          title: 1,
          author: "$authorData.name",
        },
      },
    ]);

    res.json(posts);
  } else {
    /*
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
            // no need to show comments over here.
          })),
        };
      }),
    );
    */

    const posts = await Post.find({}).populate("author", "name -_id");

    console.log(posts);
    let result = posts.map((post) => ({
      title: post.title,
      author: post.author.name,
    }));

    res.json(result);
  }
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
  const post = await Post.findById(id).populate("author", "name -_id");
  // res.json(post);

  // post : post._id
  const comments = await Comment.find({ post: id }).populate(
    "owner",
    "name -_id",
  );

  let result = {
    content: post.content,
    title: post.title,
    author: post.author,
    comments: comments.map((comment) => ({
      comment: comment.content,
      owner: comment.owner.name,
    })),
  };

  res.json(result);
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

/*
// showAllPosts controller but with pagination and no user verification middleware just for testing purpose
module.exports.getPaginatedPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const posts = await Post.find({}, { title: 1, content: 1, tags: 1 })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  // Since post id, author id from User model was also retrieved field projection is used to hide the sensitive info.

  const total = await Post.countDocuments();

  res.json({
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
};
*/

// paginate middleware used on below controller
module.exports.getPaginatedPosts = async (req, res) => {
  const { page, limit, offset } = req.pagination;

  const posts = await Post.find({}, { content: 1 }).skip(offset).limit(limit);

  const total = await Post.countDocuments();

  res.json({
    data: posts,
    pagination: {
      page,
      limit,
      offset,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
};
