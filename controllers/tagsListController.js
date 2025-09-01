const { TagQueries } = require("../db/queries");

async function tagsController(req, res) {
  const userId = req.user.id;
  try {
    const tags = await TagQueries.tagsGet(userId);

    res.render("layout/noSidebarLayout", {
      title: "Tags",
      content: {
        type: "tags",
        tags,
      },
    });
  } catch (err) {
    console.error("Error in tagsController: ", err.message);
    res.status(500).send("Failed to load tags");
  }
}

module.exports = { tagsController };
