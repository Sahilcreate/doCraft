const { validationResult } = require("express-validator");
const queries = require("../db/queries");

async function newGoalFormControllerGet(req, res) {
  res.render("layout/noSidebarLayout", {
    title: "New Goal: Form",
    content: {
      type: "goalForm",
      editGoalForm: false,
    },
  });
}

async function newGoalFormControllerPost(req, res) {
  const errors = validationResult(req);
  const { title, description } = req.body;
  const userId = req.user.id;

  if (!errors.isEmpty()) {
    return res.render("layout/noSidebarLayout", {
      title: "New Goal: Form",
      content: {
        type: "goalForm",
        editGoalForm: false,
        errors: errors.array(),
        goal: { title, description },
      },
    });
  }

  try {
    await queries.newGoalPost({
      title,
      description,
      userId,
    });
    res.redirect("/goals");
  } catch (err) {
    console.error(`Error in newGoalFormControllerPost: ${err.message}`);
    res.redirect("/goals");
  }
}

async function editGoalFormControllerGet(req, res) {
  const goalId = req.params.goalId;

  try {
    const goal = await queries.goalByIdGet(goalId);

    res.render("layout/noSidebarLayout", {
      title: "Edit Goal: Form",
      content: {
        type: "goalForm",
        editGoalForm: true,
        goal,
      },
    });
  } catch (err) {
    console.error("Error in editGoalFormControllerGet:", err.message);
    res.redirect("/goals");
  }
}

async function editGoalFormControllerPost(req, res) {
  const errors = validationResult(req);
  const goalId = Number(req.params.goalId);
  const { title, description } = req.body;

  if (!errors.isEmpty()) {
    return res.render("layout/noSidebarLayout", {
      title: "Edit Goal: Form",
      content: {
        type: "goalForm",
        editGoalForm: true,
        errors: errors.array(),
        goal: { title, description },
      },
    });
  }

  try {
    await queries.editGoalPost({
      title,
      description,
      goalId,
    });
    res.redirect("/goals");
  } catch (err) {
    console.error(`Error in editGoalFormControllerPost: ${err.message}`);
    res.redirect("/goals");
  }
}

async function goalDelete(req, res) {
  const goalId = Number(req.params.goalId);
  try {
    await queries.goalDelete(goalId);
  } catch (err) {
    console.error(`Error in goalDelete: ${err.message}`);
  }
  res.redirect("/goals");
}

module.exports = {
  newGoalFormControllerGet,
  newGoalFormControllerPost,
  editGoalFormControllerGet,
  editGoalFormControllerPost,
  goalDelete,
};
