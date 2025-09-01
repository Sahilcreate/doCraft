const { validationResult } = require("express-validator");
const { GoalQueries } = require("../db/queries");

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
    await GoalQueries.newGoalPost({
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
  const userId = req.user.id;
  const goalId = req.params.goalId;

  try {
    const goal = await GoalQueries.goalByIdGet({ goalId, userId });

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
  const userId = req.user.id;
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
    await GoalQueries.editGoalPost({
      title,
      description,
      goalId,
      userId,
    });
    res.redirect("/goals");
  } catch (err) {
    console.error(`Error in editGoalFormControllerPost: ${err.message}`);
    res.redirect("/goals");
  }
}

async function goalDelete(req, res) {
  const userId = Number(req.user.id);
  const goalId = Number(req.params.goalId);
  try {
    await GoalQueries.goalDelete({ goalId, userId });
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
