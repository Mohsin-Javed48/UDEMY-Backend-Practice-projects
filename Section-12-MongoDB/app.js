const path = require("path");
const User = require("./models/user");

const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const mongoConnect = require("./util/database").mongoConnect;
const errorController = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("69497c8bcaee4d5c5dcb712d")
    .then((user) => {
      console.log("user:", user);
      req.user = new User(user.username, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

mongoConnect(() => {
  app.listen(4000);
});

app.use(errorController.get404);
