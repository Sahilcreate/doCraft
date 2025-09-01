const {
  UserQueries,
  TaskQueries,
  GoalQueries,
  TagQueries,
  ProfileQueries,
} = require("../db/queries");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

async function profileController(req, res) {
  try {
    const userId = Number(req.user.id);
    const user = req.user;

    if (!user) {
      return res.render("layout/noSidebarLayout", {
        title: "UnAuthorized",
        content: {
          type: "messageOnly",
          message: {
            text: "Please Register and Login",
            actions: [
              { href: "/auth/register", label: "Register" },
              { href: "/auth/login", label: "Login" },
            ],
          },
        },
      });
    }

    const totalGoals = await GoalQueries.getGoalCount(userId);
    const totalTasks = await TaskQueries.getTaskCount(userId);
    const totalTags = await TagQueries.getTagCount(userId);
    const [rooms, messages] = await Promise.all([
      ProfileQueries.roomsJoinedByUser(userId),
      ProfileQueries.messagesByUser(userId),
    ]);

    res.render("layout/noSidebarLayout", {
      title: user.username,
      content: {
        type: "profile",
        user,
        rooms,
        messages,
        goals: { length: totalGoals },
        tasks: { length: totalTasks },
        tags: { length: totalTags },
      },
    });
  } catch (err) {
    console.error("Error in profileController: ", err.message);
    res.status(500).send("Failed to load profile.");
  }
}

async function editProfileGet(req, res) {
  try {
    const user = await UserQueries.findUserById(req.user.id);

    if (user.role === "guest") {
      return res.render("layout/noSidebarLayout", {
        title: "UnAuthorized",
        content: {
          type: "messageOnly",
          message: {
            text: "Guest users can't change their name",
            actions: [
              { href: "/auth/register", label: "Register" },
              { href: "/auth/login", label: "Login" },
            ],
          },
        },
      });
    }

    res.render("layout/noSidebarLayout", {
      title: "Edit Profile",
      content: {
        type: "register",
        user,
      },
    });
  } catch (err) {
    console.error(`Error in editProfileGet: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please Try Again Later. If issue persists, please contact Creator.",
        },
      },
    });
  }
}

async function editProfilePost(req, res) {
  try {
    const { username, password } = req.body;
    const errors = validationResult(req);
    const user = await UserQueries.findUserById(req.user.id);
    if (!errors.isEmpty()) {
      return res.render("layout/noSidebarLayout", {
        title: "Edit Your Username",
        content: {
          type: "register",
          errors: errors.array(),
          user,
        },
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render("layout/noSidebarLayout", {
        title: "Edit Your Username",
        content: {
          type: "register",
          errors: [{ msg: "Incorrect Password" }],
          user,
        },
      });
    }

    await UserQueries.updateProfile({
      userId: req.user.id,
      newUsername: username,
    });
    res.redirect("/profile");
  } catch (err) {
    console.error(`Error in editProfilePost: ${err}`);

    if (err.code === "23505") {
      const user = await UserQueries.findUserById(req.user.id);
      // Postgres duplicate key error (unique constraint violation)
      return res.render("layout/noSidebarLayout", {
        title: "Edit Your Username",
        content: {
          type: "register",
          errors: [{ msg: "Username is already taken" }],
          user,
        },
      });
    }

    res.status(500).render("layout/noSidebarLayou", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please Try Again Later. If issue persists, please contact Creator.",
        },
      },
    });
  }
}

module.exports = { profileController, editProfileGet, editProfilePost };
