require("dotenv").config();

const express = require("express");
const app = express();

const path = require("node:path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(setCurrentUser);
app.use("/");
app.use("/profile");
app.use("/goals");
app.use("/tags");
app.use("/tasks");

app.use((err, req, res, next) => {
  console.log(err);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`doCraft - listening to port ${PORT}`);
});
