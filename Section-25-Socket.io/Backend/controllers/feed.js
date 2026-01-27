const express = require("express");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const socket = require("../socket");

exports.getPosts = (req, res, next) => {
  Post.find()
    .sort({ createdAt: -1 })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    return next(error);
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    return next(error);
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = "images/" + req.file.filename;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  let creator;
  post
    .save()
    .then((result) => {
      console.log("REQ.USERID", req.userId);
      return User.findById(req.userId);
    })
    .then((user) => {
      console.log("USER", user);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      socket.getIO().emit("posts", {
        action: "create",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);

  let imageUrl = req.body.image;
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    return next(error);
  }
  if (req.file) {
    imageUrl = "images/" + req.file.filename;
  }
  if (!imageUrl) {
    const error = new Error("We could not find image to udpate!");
    error.statusCode = 422;
    return next(error);
  }
  Post.findById(postId)
    .populate("creator")
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        return next(error);
      }
      console.log("POST CREATOR", post.creator[0]._id.toString());
      console.log("REQ.USERID", req.userId);

      if (post.creator[0]._id.toString() !== req.userId) {
        const error = new Error("Not authorized to edit this post.");
        error.statusCode = 403;
        return next(error);
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((post) => {
      socket.getIO().emit("posts", {
        action: "update",
        post: {
          _id: post._id,
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl,
          creator: post.creator._id,
        },
      });

      res.status(200).json({ message: "Post updated!", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        return next(error);
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized to delete this post.");
        error.statusCode = 403;
        throw error;
      }
      // Delete the image associated with the post
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      console.log(user);
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      socket.getIO().emit("posts", { action: "delete", post: postId });
      console.log("Post deleted", result);
      res.status(200).json({ message: "Post deleted successfully." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filepath = path.join(__dirname, "../public", filePath);
  fs.unlink(filepath, (err) => console.log(err));
};
