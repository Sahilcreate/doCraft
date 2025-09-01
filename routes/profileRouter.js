const { Router } = require("express");
const { controllers } = require("../controllers/index");
const { ensureRole } = require("../middlewares/auth");

const profileRouter = Router();

profileRouter.get("/", controllers.profileController);
profileRouter.get(
  "/edit",
  ensureRole(["user", "admin"]),
  controllers.editProfileGet
);
profileRouter.post(
  "/edit",
  ensureRole(["user", "admin"]),
  controllers.editProfilePost
);

module.exports = { profileRouter };
