const { TaskQueries, GoalQueries, TagQueries } = require("../db/queries");
const { buildTaskQuery } = require("../public/utils/buildTaskQuery");

async function goalController(req, res) {
  const userId = Number(req.user.id);
  const goalId = Number(req.params.goalId);

  let tagsQuery = req.query.tags ? req.query.tags : [];
  const { dueBefore, sort, show } = req.query;

  const [goalsArray, tagsArray, goal] = await Promise.all([
    GoalQueries.goalsGet(userId),
    TagQueries.tagsGet(userId),
    GoalQueries.goalByIdGet({ goalId, userId }),
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

  const { query, values } = buildTaskQuery(filters, userId);
  const tasks = await TaskQueries.tasksGet({ query, values });

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
