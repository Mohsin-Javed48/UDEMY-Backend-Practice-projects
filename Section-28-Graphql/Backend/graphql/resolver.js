const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Post = require("../models/post");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];

    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-Mail is invalid." });
    }

    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password too short!" });
    }

    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      errors.push({ message: "User already exists." });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      name: userInput.name,
      email: userInput.email,
      password: hashedPassword,
    });

    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async function ({ email, password }, req) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("Password is incorrect.");
      error.statusCode = 401;
      throw error;
    } else {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      return { userId: user._id.toString(), token: token };
    }
  },

  createPost: async function ({ postInput }, req) {
    const errors = [];

    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }
    if (validator.isEmpty(postInput.imageUrl)) {
      errors.push({ message: "Image URL is invalid." });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid user.");
      error.statusCode = 401;
      throw error;
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });

    const createdPost = await post.save();
    await createdPost.populate("creator");

    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      creator: {
        ...createdPost.creator._doc,
        _id: createdPost.creator._id.toString(),
      },
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  getPosts: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    const posts = await Post.find().populate("creator");
    console.log("POSTS", posts);
    console.log("REQ.USERID IN GETPOSTS", req.isAuth);

    return posts.map((post) => {
      return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    });
  },

  getSinglePost: async function ({ postId }, req, res) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 404;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
    };
  },

  updatePost: async function ({ postId, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
    post.title = postInput.title;
    post.content = postInput.content;
    if (post.imageUrl !== "undefined") {
      post.imageUrl = postInput.imageUrl;
    }

    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },

  deletePost: async function ({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized to Delete this post!");
      error.statusCode = 403;
      throw error;
    }

    await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    return true;
  },
};
