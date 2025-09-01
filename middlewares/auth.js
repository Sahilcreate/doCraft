const { ClubhouseQueries } = require("../db/queries");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log(req.isAuthenticated);
    return next();
  }
  res.redirect("/auth/login");
}

function ensureRole(roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/auth/login");
    }

    if (!roles.includes(req.user.role)) {
      let msgTxt = "You do not have access to this functinality.";
      if (req.user.role === "guest") {
        msgTxt = "Please register as a user to access the functionality.";
      }
      return res.render("layout/noSidebarLayout", {
        title: "Forbidden: Access Denied",
        content: {
          type: "messageOnly",
          message: {
            text: msgTxt,
            actions: [
              { href: "/auth/register", label: "Register" },
              { href: "/auth/login", label: "Login" },
            ],
          },
        },
      });
    }

    next();
  };
}

function ensureOwnership(resourceType, action) {
  return async (req, res, next) => {
    try {
      let resource;

      if (resourceType === "room") {
        resource = await ClubhouseQueries.findRoomById(req.params.roomId);
      } else if (resourceType === "message") {
        resource = await ClubhouseQueries.findMessageById(req.params.msgId);
      } else {
        throw new Error("Unknown resource type in ensureOwnership");
      }

      if (!resource) {
        return res.status(404).render("layout/noSidebarLayout", {
          title: "Not Found",
          content: {
            type: "messageOnly",
            message: { text: `${resourceType} not found`, action: [] },
          },
        });
      }

      if (req.user.role === "admin") {
        return next();
      }

      if (resourceType === "room") {
        if (resource.owner_id === req.user.id) return next();
      }

      if (resourceType === "message") {
        const room = await ClubhouseQueries.getRoomById(req.params.roomId);
        if (room.owner_id === req.user.id) return next();
      }

      return res.status(403).render("layout/noSidebarLayout", {
        title: "Forbidden Action",
        content: {
          type: "messageOnly",
          message: {
            text: `You cannot ${action} this ${resourceType}.`,
            actions: [],
          },
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { ensureAuthenticated, ensureRole, ensureOwnership };
