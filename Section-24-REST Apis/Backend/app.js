require("dotenv").config();
const feedRouter = require("./routes/feed");
const authRouter = require("./routes/auth");
const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const path = require("path");

const app = express();

app.use(bodyParser.json()); //To parse JSON bodies
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
app.use("/feed", feedRouter);
app.use("/auth", authRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    console.log("Connected to MongoDB");
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
