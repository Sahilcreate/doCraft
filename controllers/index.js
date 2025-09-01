const {
  showLogin,
  showRegister,
  register,
  logout,
  guest,
} = require("./authController");
const {
  roomsList,
  roomDelete,
  roomDetail,
  roomCreateGet,
  roomCreatePost,
  roomEditGet,
  roomEditPost,
  messageCreate,
  messageDelete,
  roomJoin,
  roomLeave,
} = require("./clubController");
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
const {
  profileController,
  editProfileGet,
  editProfilePost,
} = require("./profileController");
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
const {
  singleTaskController,
  taskToggle,
  tasksController,
} = require("./tasksController");

const controllers = {
  indexController,
  profileController,
  editProfileGet,
  editProfilePost,
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
  singleTaskController,
  taskToggle,
  newTaskFormControllerGet,
  newTaskFormControllerPost,
  editTaskFormControllerGet,
  editTaskFormControllerPost,
  taskDelete,
  showLogin,
  guest,
  showRegister,
  register,
  logout,
  roomsList,
  roomDetail,
  roomDelete,
  roomCreateGet,
  roomCreatePost,
  roomEditGet,
  roomEditPost,
  roomJoin,
  roomLeave,
  messageCreate,
  messageDelete,
};

module.exports = { controllers };
