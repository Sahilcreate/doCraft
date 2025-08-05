const queries = require("../db/queries");
const { buildTaskQuery } = require("../public/utils/buildTaskQuery");

async function goalController(req, res) {
  const goalId = Number(req.params.goalId);

  let tagsQuery = req.query.tags ? req.query.tags : [];
  const { dueBefore, sort, show } = req.query;

  const [goalsArray, tagsArray, goal] = await Promise.all([
    queries.goalsGet(),
    queries.tagsGet(),
    queries.goalByIdGet(goalId),
  ]);

  if (!Array.isArray(tagsQuery)) {
    tagsQuery = tagsQuery.split(",");
  }

  const filters = {
    goals: [goalId],
    tags: tagsQuery,
    dueBefore,
    sort,
    show,
  };

  const { query, values } = buildTaskQuery(filters);
  const tasks = await queries.tasksGet({ query, values });

  res.render("layout/sidebarLayout", {
    title: "Goal",
    sidebar: {
      type: "goal",
      typeId: goalId,
      goals: goalsArray,
      tags: tagsArray,
      namedValues: req.query,
    },
    content: {
      type: "goalDetail",
      tasks,
      selectedGoal: goal,
    },
  });
}

module.exports = { goalController };
