const { Router } = require("express");
const { controllers } = require("../controllers/index");

const indexRouter = Router();

indexRouter.get("/", controllers.indexController);

module.exports = { indexRouter };
