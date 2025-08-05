function setCurrentUser(req, res, next) {
  const demoUser = {
    id: 1,
    username: "demo",
    email: "demo@example.com",
  };

  req.user = demoUser;
  res.locals.currentUser = demoUser;

  next();
}

module.exports = { setCurrentUser };
