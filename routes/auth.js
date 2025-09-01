const { Router } = require("express");
const { controllers } = require("../controllers/index");
const passport = require("passport");
const { body } = require("express-validator");

const authRouter = Router();

authRouter.get("/login", controllers.showLogin);
authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/tasks",
    failureRedirect: "/auth/login",
  })
);

authRouter.get("/register", controllers.showRegister);
authRouter.post(
  "/register",
  body("password").isLength({ min: 5 }),
  body("passwordConfirmation")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Confirmation field not matching"),
  controllers.register
);

authRouter.get("/guest", controllers.guest);
authRouter.get("/logout", controllers.logout);

module.exports = { authRouter };
