const { body } = require("express-validator");
const { Router } = require("express");
const { controllers } = require("../controllers/index");

const tasksRouter = Router();

const taskValidationRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters."),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters."),
  body("goals")
    .notEmpty()
    .withMessage("Goal is required")
    .isInt()
    .withMessage("Invalid goal ID"),
  body("tags.*")
    .notEmpty()
    .withMessage("Tag is required. Can choose multiple")
    .isInt()
    .withMessage("Invalid tag ID."),
  body("date")
    .notEmpty()
    .withMessage("Due date required.")
    .isISO8601()
    .withMessage("Invalid date format"),
];

tasksRouter.get("/form", controllers.newTaskFormControllerGet);
tasksRouter.post(
  "/form",
  taskValidationRules,
  controllers.newTaskFormControllerPost
);

tasksRouter.get("/:taskId/form", controllers.editTaskFormControllerGet);
tasksRouter.post(
  "/:taskId/form",
  taskValidationRules,
  controllers.editTaskFormControllerPost
);
tasksRouter.post("/:taskId/delete", controllers.taskDelete);
tasksRouter.post("/:taskId/toggle", controllers.taskToggle);
tasksRouter.get("/:taskId", controllers.tasksController);

module.exports = { tasksRouter };
