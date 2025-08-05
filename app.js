// Load environment variables
require("dotenv").config();

// Core modules
const path = require("node:path");

// Third party modules
const express = require("express");

// App initialization
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const { setCurrentUser } = require("./middlewares/setCurrentUser");
app.use(setCurrentUser);

// Routes
const { routes } = require("./routes/index");
app.use("/", routes.indexRouter);
app.use("/profile", routes.profileRouter);
app.use("/goals", routes.goalsRouter);
app.use("/tags", routes.tagsRouter);
app.use("/tasks", routes.tasksRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(500).send("Something broke!");
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`doCraft - listening to port ${PORT}`);
});
