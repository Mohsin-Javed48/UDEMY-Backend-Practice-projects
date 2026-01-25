const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const { email, password, name } = req.body;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "User created!",
        userId: result._id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }
    bcrypt
      .compare(password, user.password)
      .then((doMatch) => {
        if (!doMatch) {
          const error = new Error("Wrong password!");
          error.statusCode = 401;
          throw error;
        }
        const token = jwt.sign(
          { email: email, userId: user.id.toString() },
          process.env.JWT_SECRET,
          { expiresIn: "1h" },
        );
        res.status(200).json({
          message: "Login successful!",
          userId: user._id,
          token: token,
        });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });
};
