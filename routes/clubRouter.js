const { Router } = require("express");
const { controllers } = require("../controllers/index");
const { ensureRole, ensureOwnership } = require("../middlewares/auth");

const clubRouter = Router();

clubRouter.get("/rooms", controllers.roomsList);
clubRouter.get(
  "/rooms/new",
  ensureRole(["user", "admin"]),
  controllers.roomCreateGet
);
clubRouter.post(
  "/rooms/create",
  ensureRole(["user", "admin"]),
  controllers.roomCreatePost
);
clubRouter.get("/rooms/:roomId", controllers.roomDetail);
clubRouter.get(
  "/rooms/:roomId/edit",
  ensureRole(["user", "admin"]),
  ensureOwnership("room", "edit"),
  controllers.roomEditGet
);
clubRouter.post("/rooms/:roomId/join", controllers.roomJoin);
clubRouter.post("/rooms/:roomId/leave", controllers.roomLeave);
clubRouter.post(
  "/rooms/:roomId/edit",
  ensureRole(["user", "admin"]),
  ensureOwnership("room", "edit"),
  controllers.roomEditPost
);
clubRouter.post(
  "/rooms/:roomId/delete",
  ensureRole(["user", "admin"]),
  ensureOwnership("room", "delete"),
  controllers.roomDelete
);
clubRouter.post("/rooms/:roomId/message/new", controllers.messageCreate);
clubRouter.post(
  "/rooms/:roomId/message/:msgId/delete",
  ensureOwnership("message", "delete"),
  controllers.messageDelete
);

module.exports = { clubRouter };
