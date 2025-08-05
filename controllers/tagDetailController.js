const queries = require("../db/queries");
const { buildTaskQuery } = require("../public/utils/buildTaskQuery");

async function tagController(req, res) {
  const tagId = Number(req.params.tagId);

  let goalsQuery = req.query.goals || [];
  const { dueBefore, sort, show } = req.query;

  if (!Array.isArray(goalsQuery)) {
    goalsQuery = goalsQuery.split(",");
  }

  const filters = {
    tags: [tagId],
    goals: goalsQuery,
    dueBefore,
    sort,
    show,
  };

  try {
    const [goalsArray, tagsArray, tag] = await Promise.all([
      queries.goalsGet(),
      queries.tagsGet(),
      queries.tagByIdGet(tagId),
    ]);

    const { query, values } = buildTaskQuery(filters);
    const tasks = await queries.tasksGet({ query: query, values: values });

    res.render("layout/sidebarLayout", {
      title: "Tag",
      sidebar: {
        type: "tag",
        typeId: tagId,
        goals: goalsArray,
        tags: tagsArray,
        namedValues: req.query,
      },
      content: {
        type: "tagDetail",
        tasks,
        selectedTag: tag,
      },
    });
  } catch (err) {
    console.error("Error in tagController:", err.message);
    res.status(500).send("Failed to load tag details.");
  }
}

module.exports = { tagController };
