exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  res.status(201).json({ message: "User created", userId: "abc123" });
};
