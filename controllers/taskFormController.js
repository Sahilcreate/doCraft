const { TaskQueries, GoalQueries, TagQueries } = require("../db/queries");
const { validationResult } = require("express-validator");

async function newTaskFormControllerGet(req, res) {
  try {
    const userId = req.user.id;
    const [goals, tags] = await Promise.all([
      GoalQueries.goalsGet(userId),
      TagQueries.tagsGet(userId),
    ]);

    if (goals.length === 0 || tags.length === 0) {
      return res.render("layout/noSidebarLayout", {
        title: "Cannot Create Task",
        content: {
          type: "messageOnly",
          message: {
            text: "You must have at least only one goal and one tag before creating a task.",
            actions: [
              { href: "/goals/form", label: "Create Goal" },
              { href: "/tags/form", label: "Add Tags" },
            ],
          },
        },
      });
    }

    res.render("layout/noSidebarLayout", {
      title: "New Task Form",
      content: {
        type: "taskForm",
        editTaskForm: false,
        goals,
        tags,
      },
    });
  } catch (err) {
    console.error("Error in newTaskFormControllerGet:", err.message);
    res.status(500).send("Failed to load new task form.");
  }
}

async function editTaskFormControllerGet(req, res) {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  try {
    const [goals, tags, task] = await Promise.all([
      GoalQueries.goalsGet(userId),
      TagQueries.tagsGet(userId),
      TaskQueries.taskByIdGet({ taskId, userId }),
    ]);

    if (goals.length === 0 || tags.length === 0) {
      return res.render("layout/noSidebarLayout", {
        title: "Cannot Create Task",
        content: {
          type: "messageOnly",
          message: {
            text: "You must have at least only one goal and one tag before creating a task.",
            actions: [
              { href: "/goals/form", label: "Create Goal" },
              { href: "/tags/form", label: "Add Tags" },
            ],
          },
        },
      });
    }

    res.render("layout/noSidebarLayout", {
      title: "Edit Task Form",
      content: {
        type: "taskForm",
        editTaskForm: true,
        goals,
        tags,
        task,
      },
    });
  } catch (err) {
    console.error("Error in editTaskFormControllerGet:", err.message);
    res.status(500).send("Failed to load edit task form.");
  }
}

async function newTaskFormControllerPost(req, res) {
  const { title, description, goals, tags, date } = req.body;
  const userId = req.user.id;
  const tagList = Array.isArray(tags) ? tags : [tags];
  const isoDate = new Date(date).toISOString();

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const [goals, tags] = await Promise.all([
      GoalQueries.goalsGet(userId),
      TagQueries.tagsGet(userId),
    ]);
    return res.render("layout/noSidebarLayout", {
      title: "New Task Form",
      content: {
        type: "taskForm",
        editTaskForm: false,
        goals,
        tags,
        errors: errors.array(),
      },
    });
  }

  try {
    await TaskQueries.newTaskPost({
      title,
      description,
      goalId: goals,
      tagsIds: tagList,
      isoDate,
      userId,
    });

    res.redirect("/");
  } catch (err) {
    console.error("Error in newTaskFormControllerPost:", err.message);
    res.status(500).send("Failed to create task.");
  }
}

async function editTaskFormControllerPost(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);
  const { title, description, goals, tags, date } = req.body;
  const tagList = Array.isArray(tags) ? tags : [tags];
  const isoDate = new Date(date).toISOString();

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const [goals, tags, task] = await Promise.all([
      GoalQueries.goalsGet(userId),
      TagQueries.tagsGet(userId),
      TaskQueries.taskByIdGet({ taskId, userId }),
    ]);
    return res.render("layout/noSidebarLayout", {
      title: "Edit Task Form",
      content: {
        type: "taskForm",
        editTaskForm: true,
        goals,
        tags,
        task,
        errors: errors.array(),
      },
    });
  }

  try {
    await TaskQueries.editTaskPost({
      title,
      description,
      goalId: goals,
      tagsIds: tagList,
      isoDate,
      taskId,
      userId,
    });
    res.redirect("/");
  } catch (err) {
    console.error("Error in editTaskFormControllerPost:", err.message);
    res.status(500).send("Failed to edit task.");
  }
}

async function taskDelete(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);

  try {
    await TaskQueries.taskDelete({ taskId, userId });
    res.redirect("/");
  } catch (err) {
    console.error("Error in taskDelete:", err.message);
    res.status(500).send("Failed to delete task.");
  }
}

module.exports = {
  newTaskFormControllerGet,
  newTaskFormControllerPost,
  editTaskFormControllerGet,
  editTaskFormControllerPost,
  taskDelete,
};
