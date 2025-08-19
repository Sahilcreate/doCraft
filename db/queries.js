const pool = require("./pool");

async function tasksGet({ query, values }) {
  try {
    const { rows } = await pool.query(query, values);

    return rows;
  } catch (err) {
    throw err;
  }
}

async function taskByIdGet(taskId) {
  try {
    const { rows } = await pool.query(
      `
    SELECT
        t.id AS task_id,
        t.title AS task_title,
        t.description AS task_description,
        t.due_date,
        t.created_at,
        json_build_object('id', g.id, 'title', g.title) AS goal,
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name)
            ) FILTER (WHERE tg.id IS NOT NULL),
            '[]'
        ) AS tags
        FROM tasks t
        LEFT JOIN goals g ON g.id = t.goal_id
        LEFT JOIN task_tags tt ON tt.task_id = t.id
        LEFT JOIN tags tg ON tg.id = tt.tag_id
        WHERE t.id = $1
        GROUP BY t.id, g.id
    `,
      [taskId]
    );
    console.log(rows[0]);
    return rows[0];
  } catch (err) {
    throw err;
  }
}

async function newTaskPost({
  title,
  description,
  goalId,
  tagsIds,
  isoDate,
  userId,
}) {
  try {
    await pool.query("BEGIN");

    const result = await pool.query(
      `INSERT INTO tasks (title, description, goal_id, user_id, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, description, goalId, userId, isoDate]
    );
    const taskId = result.rows[0].id;

    for (const tagId of tagsIds) {
      await pool.query(
        `INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)`,
        [taskId, tagId]
      );
    }

    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

// Alter task table.
// Alter task_tags table:
//  Delete preious tags and task connection
//  Enter new task_tags connections

async function editTaskPost({
  title,
  description,
  goalId,
  tagsIds,
  isoDate,
  taskId,
}) {
  try {
    await pool.query("BEGIN");

    await pool.query(
      `UPDATE tasks
        SET 
            title = $1,
            description = $2,
            goal_id = $3,
            due_date = $4
        WHERE id = $5`,
      [title, description, goalId, isoDate, taskId]
    );

    await pool.query(`DELETE FROM task_tags WHERE task_id = $1`, [taskId]);

    if (tagsIds.length > 0) {
      const values = tagsIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await pool.query(
        `INSERT INTO task_tags (task_id, tag_id) VALUES ${values}`,
        [taskId, ...tagsIds]
      );
    }

    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

async function taskDelete(taskId) {
  try {
    await pool.query("BEGIN");
    await pool.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);
    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

async function taskToggle({ taskId, isCompleted }) {
  try {
    await pool.query("BEGIN");
    await pool.query(`UPDATE tasks SET is_completed = $1 WHERE id = $2`, [
      isCompleted,
      taskId,
    ]);
    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

async function goalsGet() {
  try {
    const { rows } = await pool.query("SELECT * FROM goals");

    return rows;
  } catch (err) {
    throw err;
  }
}

async function goalByIdGet(goalId) {
  try {
    const { rows } = await pool.query(
      `
    SELECT 
      id, title, description, created_at
    FROM 
      goals
    WHERE 
      id = $1
    `,
      [goalId]
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
}

async function newGoalPost({ title, description, userId }) {
  try {
    await pool.query(
      `
      INSERT INTO goals (title, description, user_id) VALUES ($1, $2, $3)
      `,
      [title, description, userId]
    );
  } catch (err) {
    throw err;
  }
}

async function editGoalPost({ title, description, goalId }) {
  try {
    await pool.query(
      `
      UPDATE goals
      SET 
        title = $1,
        description = $2
      WHERE 
        id = $3
      `,
      [title, description, goalId]
    );
  } catch (err) {
    throw err;
  }
}

async function goalDelete(goalId) {
  try {
    await pool.query("BEGIN");
    await pool.query(`DELETE FROM goals WHERE id = $1`, [goalId]);
    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

async function tagsGet() {
  try {
    const { rows } = await pool.query("SELECT * FROM tags");

    return rows;
  } catch (err) {
    throw err;
  }
}

async function tagByIdGet(tagId) {
  try {
    const { rows } = await pool.query(
      `
    SELECT 
      id, name
    FROM 
      tags
    WHERE 
      id = $1
    `,
      [tagId]
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
}

async function newTagPost({ name }) {
  try {
    await pool.query(
      `
      INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;
      `,
      [name]
    );
  } catch (err) {
    throw err;
  }
}

async function editTagPost({ newName, tagId }) {
  try {
    newName = newName.trim().toLowerCase();

    const existing = await pool.query(`SELECT id FROM tags WHERE name = $1`, [
      newName,
    ]);

    if (existing.rows.length > 0 && existing.rows[0].id !== tagid) {
      throw new Error("Tag name already exists.");
    }

    await pool.query(
      `
      UPDATE tags
      SET 
        name = $1
      WHERE 
        id = $2
      `,
      [newName, tagId]
    );
  } catch (err) {
    throw err;
  }
}

async function tagDelete(tagId) {
  try {
    await pool.query("BEGIN");
    await pool.query(`DELETE FROM tags WHERE id = $1`, [tagId]);
    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

async function getProfile(userId) {
  try {
    const { rows } = await pool.query(
      `
      SELECT username, created_at FROM users WHERE id = $1
      `,
      [userId]
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
}

async function getGoalCount(userId) {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM goals WHERE user_id = $1",
      [userId]
    );

    return Number(result.rows[0].count);
  } catch (err) {
    throw err;
  }
}

async function getTaskCount(userId) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)
     FROM tasks AS t
     LEFT JOIN goals AS g ON g.id = t.goal_id
     WHERE t.user_id = $1`,
      [userId]
    );

    return Number(result.rows[0].count);
  } catch (err) {
    throw err;
  }
}

async function getTagCount() {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM tags");

    return Number(result.rows[0].count);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  tasksGet,
  taskByIdGet,
  newTaskPost,
  editTaskPost,
  taskDelete,
  taskToggle,
  goalsGet,
  goalByIdGet,
  newGoalPost,
  editGoalPost,
  goalDelete,
  tagsGet,
  tagByIdGet,
  newTagPost,
  editTagPost,
  tagDelete,
  getProfile,
  getGoalCount,
  getTaskCount,
  getTagCount,
};
