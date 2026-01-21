const e = require("express");

exports.getPosts = (req, res, next) => {
  res.status(201).json({ message: "Post created successfully!" });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  res.status(200).json({
    message: "Fetched posts successfully.",
    posts: [{ id: Date.now(), title: title, content: content }],
  });
};
