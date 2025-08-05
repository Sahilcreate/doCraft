const { validationResult } = require("express-validator");
const queries = require("../db/queries");

async function newTagFormControllerGet(req, res) {
  res.render("layout/noSidebarLayout", {
    title: "New Tag: Form",
    content: {
      type: "tagForm",
      editTagForm: false,
    },
  });
}

async function newTagFormControllerPost(req, res) {
  const rawInput = req.body.name;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("layout/noSidebarLayout", {
      title: "New Tag: Form",
      content: {
        type: "tagForm",
        editGoalForm: false,
        errors: errors.array(),
        tag: { name: rawInput },
      },
    });
  }

  const tagNames = rawInput
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name !== "");

  try {
    for (const name of tagNames) {
      await queries.newTagPost({
        name,
      });
    }

    res.redirect("/tags");
  } catch (err) {
    console.error(`Error in newTagFormControllerPost: ${err.message}`);
  }
}

async function editTagFormControllerGet(req, res) {
  const tagId = req.params.tagId;

  try {
    const tag = await queries.tagByIdGet(tagId);

    res.render("layout/noSidebarLayout", {
      title: "New Tag: Form",
      content: {
        type: "tagForm",
        editTagForm: true,
        tag,
      },
    });
  } catch (err) {
    console.error("Error in editTagFormControllerGet: ", err.message);
    res.status(500).send("Failed to load tag edit form.");
  }
}

async function editTagFormControllerPost(req, res) {
  const tagId = Number(req.params.tagId);
  const { name } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("layout/noSidebarLayout", {
      title: "New Tag: Form",
      content: {
        type: "tagForm",
        editGoalForm: true,
        errors: errors.array(),
        tag: { name },
      },
    });
  }

  try {
    await queries.editTagPost({
      newName: name,
      tagId,
    });
  } catch (err) {
    console.error("Error in editTagFormControllerPost: ", err.message);
  }

  res.redirect("/tags");
}

async function tagDelete(req, res) {
  const tagId = Number(req.params.tagId);

  try {
    await queries.tagDelete(tagId);
  } catch (err) {
    console.error("Error in tagDelete: ", err.message);
  }

  res.redirect("/tags");
}

module.exports = {
  newTagFormControllerGet,
  newTagFormControllerPost,
  editTagFormControllerGet,
  editTagFormControllerPost,
  tagDelete,
};
