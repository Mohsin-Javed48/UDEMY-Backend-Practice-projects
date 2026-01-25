const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const Post = require("../models/post");
const authToken = require("../middlewares/auth-token");

const feedController = require("../controllers/feed");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "images"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname,
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

router.get("/posts", authToken, feedController.getPosts);

router.post(
  "/post",
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"),
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters long"),
    body("content")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Content must be at least 5 characters long"),
  ],
  feedController.createPost,
);

router.get("/post/:postId", (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        return next(error);
      }
      console.log(post);
      res.status(200).json({ message: "Post Fetched", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});

router.put(
  "/post/:postId",
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters long"),
    body("content")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Content must be at least 5 characters long"),
  ],
  feedController.updatePost,
);

router.delete("/post/:postId", feedController.deletePost);

module.exports = router;
