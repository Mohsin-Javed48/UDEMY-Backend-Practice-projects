const path = require("path");
const User = require("./models/user");

const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("69521fb2ffad4917678d19b9")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

mongoose
  .connect(
    "mongodb+srv://mohsinjavedpc_db:235Mohsin548@cluster0.pyfvfmp.mongodb.net/shop?appName=Cluster0"
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Mohsin",
          email: "mohsin@example.com",
          cart: { items: [] },
        });
        user.save();
        console.log("Connected to MongoDB");
        app.listen(4000);
      } else {
        console.log("Connected to MongoDB");
        app.listen(4000);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use(errorController.get404);
