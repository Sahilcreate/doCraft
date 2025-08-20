const { Router } = require("express");
const { controllers } = require("../controllers/index");

const authRouter = Router();

authRouter.get("/login", controllers.showLogin);
authRouter.post("/login", controllers.login);
authRouter.get("/register", controllers.showRegister);
authRouter.post("/register", controllers.register);
authRouter.get("/logout", controllers.logout);

module.exports = { authRouter };
