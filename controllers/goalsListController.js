const { GoalQueries } = require("../db/queries");

async function goalsController(req, res) {
  const userId = req.user.id;
  try {
    const goals = await GoalQueries.goalsGet(userId);

    res.render("layout/noSidebarLayout", {
      title: "Goals",
      content: {
        type: "goals",
        goals,
      },
    });
  } catch (err) {
    console.error("Error in goalsController: ", err.message);
    res.status(500).send("Failed to load goals.");
  }
}

module.exports = { goalsController };
