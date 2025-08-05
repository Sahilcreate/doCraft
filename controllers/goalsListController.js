const queries = require("../db/queries");

async function goalsController(req, res) {
  try {
    const goals = await queries.goalsGet();

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
