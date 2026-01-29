require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const path = require("path");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");

const app = express();

app.use(bodyParser.json()); //To parse JSON bodies
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      console.log("error", err);
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.statusCode || 500;
      return { message: message, status: code, data: data };
    },
  }),
);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 8080);
    console.log("Connected to Database and Server is running");
  })
  .catch((err) => {
    console.log(err);
  });
