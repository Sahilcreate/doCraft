const { body } = require("express-validator");
const { Router } = require("express");
const { controllers } = require("../controllers/index");

const tagsRouter = Router();

const tagValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 20 })
    .withMessage("Name must be at most 20 characters."),
];

tagsRouter.get("/", controllers.tagsController);
tagsRouter.get("/form", controllers.newTagFormControllerGet);
tagsRouter.post(
  "/form",
  tagValidationRules,
  controllers.newTagFormControllerPost
);

tagsRouter.get("/:tagId", controllers.tagController);
tagsRouter.get("/:tagId/form", controllers.editTagFormControllerGet);
tagsRouter.post(
  "/:tagId/form",
  tagValidationRules,
  controllers.editTagFormControllerPost
);
tagsRouter.post("/:tagId/delete", controllers.tagDelete);

module.exports = { tagsRouter };
