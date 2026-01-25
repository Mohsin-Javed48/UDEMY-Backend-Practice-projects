const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one.",
            );
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5, max: 20 }),
    body("name").trim().isLength({ min: 3 }),
  ],
  authController.signup,
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").trim().isLength({ min: 5, max: 20 }),
  ],
  authController.login,
);

module.exports = router;
