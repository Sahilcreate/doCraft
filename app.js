// Load environment variables
require("dotenv").config();

// Core modules
const path = require("node:path");

// Third party modules
const express = require("express");
const session = require("express-session");
const { ensureAuthenticated } = require("./middlewares/auth");
const passport = require("passport");
const pool = require("./db/pool");

const pgSession = require("connect-pg-simple")(session);

// App initialization
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const sessionStore = new pgSession({
  pool: pool,
  tableName: "user_sessions",
  createTableIfMissing: true,
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// const { setCurrentUser } = require("./middlewares/setCurrentUser");
// app.use(setCurrentUser);

// Routes

const { routes } = require("./routes/index");

app.use("/", routes.indexRouter);
app.use("/auth", routes.authRouter);
app.use("/profile", ensureAuthenticated, routes.profileRouter);
app.use("/goals", ensureAuthenticated, routes.goalsRouter);
app.use("/tags", ensureAuthenticated, routes.tagsRouter);
app.use("/tasks", ensureAuthenticated, routes.tasksRouter);
app.use("/clubhouse", ensureAuthenticated, routes.clubRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(500).send(`Something broke!`);
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`doCraft - listening to port ${PORT}`);
});
