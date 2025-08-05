const { Router } = require("express");
const { controllers } = require("../controllers/index");

const profileRouter = Router();

profileRouter.get("/", controllers.profileController);

module.exports = { profileRouter };
