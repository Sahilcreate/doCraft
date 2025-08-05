const { body } = require("express-validator");
const { Router } = require("express");
const { controllers } = require("../controllers/index");

const goalsRouter = Router();

const goalValidationRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters."),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ max: 255 })
    .withMessage("Description must be at most 255 characters."),
];

goalsRouter.get("/", controllers.goalsController);
goalsRouter.get("/form", controllers.newGoalFormControllerGet);
goalsRouter.post(
  "/form",
  goalValidationRules,
  controllers.newGoalFormControllerPost
);

//sidebarLayout
goalsRouter.get("/:goalId", controllers.goalController);

goalsRouter.get("/:goalId/form", controllers.editGoalFormControllerGet);
goalsRouter.post(
  "/:goalId/form",
  goalValidationRules,
  controllers.editGoalFormControllerPost
);
goalsRouter.post("/:goalId/delete", controllers.goalDelete);

module.exports = { goalsRouter };
