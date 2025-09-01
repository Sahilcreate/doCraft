const { UserQueries } = require("../db/queries");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

async function showLogin(req, res) {
  res.render("layout/noSidebarLayout", {
    title: "Register User",
    content: {
      type: "login",
    },
  });
}

async function guest(req, res, next) {
  try {
    const guestUser = await UserQueries.findUserByRole("guest");
    req.login(guestUser, (err) => {
      if (err) return next(err);
      return res.redirect("/tasks");
    });
  } catch (err) {
    next(err);
  }
}

async function showRegister(req, res) {
  res.render("layout/noSidebarLayout", {
    title: "Register User",
    content: {
      type: "register",
    },
  });
}

async function register(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("layout/noSidebarLayout", {
      title: "Register User",
      content: {
        type: "register",
        errors: errors.array(),
      },
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const username = req.body.username;
    await UserQueries.newUserPost({ username, hashedPassword });
    res.redirect("/auth/login");
  } catch (err) {
    if (err.code === "23505") {
      // Postgres duplicate key error (unique constraint violation)
      return res.status(400).render("layout/noSidebarLayout", {
        title: "Register User",
        content: {
          type: "register",
          errors: [{ msg: "Username is already taken" }],
        },
      });
    }

    console.error(err);
    next(err);
  }
}

async function logout(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

module.exports = {
  showLogin,
  guest,
  showRegister,
  register,
  logout,
};
