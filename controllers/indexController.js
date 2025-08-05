const { buildTaskQuery } = require("../public/utils/buildTaskQuery");
const queries = require("../db/queries");

async function indexController(req, res) {
  let { goals = [], tags = [], dueBefore, sort, show } = req.query;

  if (!Array.isArray(goals)) goals = goals.split(",");
  if (!Array.isArray(tags)) tags = tags.split(",");

  const filters = { goals, tags, dueBefore, sort, show };

  try {
    const { query, values } = buildTaskQuery(filters);
    const tasks = await queries.tasksGet({ query: query, values: values });
    const goalsArray = await queries.goalsGet();
    const tagsArray = await queries.tagsGet();

    res.render("layout/sidebarLayout", {
      title: "doCraft",
      sidebar: {
        type: "none",
        typeId: "none",
        goals: goalsArray,
        tags: tagsArray,
        namedValues: req.query,
      },
      content: {
        type: "index",
        tasks,
      },
    });
  } catch (err) {
    console.error("Error in indexController:", err.message);
    res.status(500).send("Error loading tasks.");
  }
}

module.exports = { indexController };
