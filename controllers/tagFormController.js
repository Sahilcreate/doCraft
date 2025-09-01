const { validationResult } = require("express-validator");
const { TagQueries } = require("../db/queries");

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
  const userId = req.user.id;
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
      await TagQueries.newTagPost({
        name,
        userId,
      });
    }

    res.redirect("/tags");
  } catch (err) {
    console.error(`Error in newTagFormControllerPost: ${err.message}`);
  }
}

async function editTagFormControllerGet(req, res) {
  const userId = req.user.id;
  const tagId = req.params.tagId;

  try {
    const tag = await TagQueries.tagByIdGet({ tagId, userId });

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
  const userId = req.user.id;
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
    await TagQueries.editTagPost({
      newName: name,
      tagId,
      userId,
    });
  } catch (err) {
    console.error("Error in editTagFormControllerPost: ", err.message);
  }

  res.redirect("/tags");
}

async function tagDelete(req, res) {
  const userId = req.user.id;
  const tagId = Number(req.params.tagId);

  try {
    await TagQueries.tagDelete({ tagId, userId });
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
