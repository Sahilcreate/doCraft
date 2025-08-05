const queries = require("../db/queries");

async function tasksController(req, res) {
  const taskId = Number(req.params.taskId);

  try {
    const task = await queries.taskByIdGet(taskId);

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
  const taskId = Number(req.params.taskId);
  const isCompleted = req.body.completed === "true";

  console.log("req body", req.body);

  console.log("taskId", taskId);
  console.log("iscompleted", isCompleted);

  try {
    await queries.taskToggle({ taskId, isCompleted });
    res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.error("Error in taskToggle: ", err.message);
    res.status(500).send("Failed to toggle task status.");
  }
}

module.exports = { tasksController, taskToggle };
