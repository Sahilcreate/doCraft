async function indexController(req, res) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/tasks");
  }

  res.render("index", { title: "Welcome to doCraft" });
}

module.exports = { indexController };
