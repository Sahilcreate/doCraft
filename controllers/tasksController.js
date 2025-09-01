const { TaskQueries, GoalQueries, TagQueries } = require("../db/queries");
const { buildTaskQuery } = require("../public/utils/buildTaskQuery");

async function tasksController(req, res) {
  console.log(req.user);
  const userId = req.user.id;
  let { goals = [], tags = [], dueBefore, sort, show } = req.query;

  if (!Array.isArray(goals)) goals = goals.split(",");
  if (!Array.isArray(tags)) tags = tags.split(",");

  const filters = { goals, tags, dueBefore, sort, show };

  try {
    const { query, values } = buildTaskQuery(filters, userId);
    const tasks = await TaskQueries.tasksGet({ query: query, values: values });
    const goalsArray = await GoalQueries.goalsGet(userId);
    const tagsArray = await TagQueries.tagsGet(userId);

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
        type: "mainPage",
        tasks,
      },
    });
  } catch (err) {
    console.error("Error in indexController:", err.message);
    res.status(500).send("Error loading tasks.");
  }
}

async function singleTaskController(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);

  try {
    const task = await TaskQueries.taskByIdGet({ taskId, userId });

    if (!task) {
      return res.status(404).send("Task not found.");
    }

    res.render("layout/noSidebarLayout", {
      title: "Task",
      content: {
        type: "task",
        task,
      },
    });
  } catch (err) {
    console.error("Error in tasksController:", err.message);
    res.status(500).send("Failed to load task details.");
  }
}

async function taskToggle(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);
  const isCompleted = req.body.completed === "true";

  console.log("req body", req.body);

  console.log("taskId", taskId);
  console.log("iscompleted", isCompleted);

  try {
    await TaskQueries.taskToggle({ taskId, isCompleted, userId });
    res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.error("Error in taskToggle: ", err.message);
    res.status(500).send("Failed to toggle task status.");
  }
}

module.exports = { tasksController, singleTaskController, taskToggle };
