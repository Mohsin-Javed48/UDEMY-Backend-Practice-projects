const feedRouter = require("./routes/feed");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json()); //To parse JSON bodies

app.use("/feed", feedRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
