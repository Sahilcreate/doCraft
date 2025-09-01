const { authRouter } = require("./auth");
const { clubRouter } = require("./clubRouter");
const { goalsRouter } = require("./goalsRouter");
const { indexRouter } = require("./indexRouter");
const { profileRouter } = require("./profileRouter");
const { tagsRouter } = require("./tagsRouter");
const { tasksRouter } = require("./tasksRouter");

const routes = {
  indexRouter,
  profileRouter,
  tagsRouter,
  goalsRouter,
  tasksRouter,
  authRouter,
  clubRouter,
};

module.exports = { routes };
