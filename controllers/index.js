const {
  showLogin,
  login,
  showRegister,
  register,
  logout,
} = require("./authController");
const { goalController } = require("./goalDetailController");
const {
  newGoalFormControllerGet,
  newGoalFormControllerPost,
  editGoalFormControllerGet,
  editGoalFormControllerPost,
  goalDelete,
} = require("./goalFormController");
const { goalsController } = require("./goalsListController");
const { indexController } = require("./indexController");
const { profileController } = require("./profileController");
const { tagController } = require("./tagDetailController");
const {
  newTagFormControllerGet,
  newTagFormControllerPost,
  editTagFormControllerGet,
  editTagFormControllerPost,
  tagDelete,
} = require("./tagFormController");
const { tagsController } = require("./tagsListController");
const {
  newTaskFormControllerGet,
  newTaskFormControllerPost,
  editTaskFormControllerGet,
  editTaskFormControllerPost,
  taskDelete,
} = require("./taskFormController");
const { tasksController, taskToggle } = require("./tasksController");

const controllers = {
  indexController,
  profileController,
  goalController,
  goalsController,
  newGoalFormControllerGet,
  newGoalFormControllerPost,
  editGoalFormControllerGet,
  editGoalFormControllerPost,
  goalDelete,
  tagController,
  tagsController,
  newTagFormControllerGet,
  newTagFormControllerPost,
  editTagFormControllerGet,
  editTagFormControllerPost,
  tagDelete,
  tasksController,
  taskToggle,
  newTaskFormControllerGet,
  newTaskFormControllerPost,
  editTaskFormControllerGet,
  editTaskFormControllerPost,
  taskDelete,
  showLogin,
  login,
  showRegister,
  register,
  logout,
};

module.exports = { controllers };
