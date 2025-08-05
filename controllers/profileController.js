const queries = require("../db/queries");

async function profileController(req, res) {
  const userId = Number(req.user.id);

  try {
    const user = await queries.getProfile(userId);
    const totalGoals = await queries.getGoalCount(userId);
    const totalTasks = await queries.getTaskCount(userId);
    const totalTags = await queries.getTagCount();

    res.render("layout/noSidebarLayout", {
      title: user.username,
      content: {
        type: "profile",
        user,
        goals: { length: totalGoals },
        tasks: { length: totalTasks },
        tags: { length: totalTags },
      },
    });
  } catch (err) {
    console.error("Error in profileController: ", err.message);
    res.status(500).send("Failed to load profile.");
  }
}

module.exports = { profileController };
