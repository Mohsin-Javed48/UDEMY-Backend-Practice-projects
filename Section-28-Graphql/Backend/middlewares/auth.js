const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  if (!authHeader.startsWith("Bearer ")) {
    req.isAuth = false;
    return next();
  }

  let decodedToken;
  const token = authHeader.split(" ")[1];
  console.log(token);
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED TOKEN", decodedToken);
    req.userId = decodedToken.userId;
    req.isAuth = true;
    return next();
  } catch (err) {
    req.isAuth = false;
    return next();
  }
};

module.exports = authToken;
