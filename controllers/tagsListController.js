const queries = require("../db/queries");

async function tagsController(req, res) {
  try {
    const tags = await queries.tagsGet();

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
