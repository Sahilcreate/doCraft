const pool = require("./pool");

class UserQueries {
  async newUserPost({ username, hashedPassword }) {
    try {
      await pool.query("BEGIN");
      await pool.query(
        `INSERT INTO users (username, password_hash) VALUES ($1, $2)`,
        [username, hashedPassword]
      );
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  async findUserById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [
        id,
      ]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async findUserByUsername(username) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
      );
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async getProfile(userId) {
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

  async findUserByRole(role) {
    try {
      const { rows } = await pool.query(`SELECT * FROM users WHERE role = $1`, [
        role,
      ]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async updateProfile({ userId, newUsername }) {
    try {
      await pool.query(`UPDATE users SET username = $1 WHERE id = $2`, [
        newUsername,
        userId,
      ]);
    } catch (err) {
      throw err;
    }
  }
}

class TaskQueries {
  async tasksGet({ query, values }) {
    console.log(query);
    try {
      const { rows } = await pool.query(query, values);

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async taskByIdGet({ taskId, userId }) {
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
        WHERE t.id = $1 AND t.user_id = $2
        GROUP BY t.id, g.id
    `,
        [taskId, userId]
      );
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async newTaskPost({ title, description, goalId, tagsIds, isoDate, userId }) {
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

  async editTaskPost({
    title,
    description,
    goalId,
    tagsIds,
    isoDate,
    taskId,
    userId,
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
        WHERE id = $5 AND user_id = $6`,
        [title, description, goalId, isoDate, taskId, userId]
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

  async taskToggle({ taskId, isCompleted, userId }) {
    try {
      await pool.query("BEGIN");
      await pool.query(
        `UPDATE tasks SET is_completed = $1 WHERE id = $2 AND user_id = $3`,
        [isCompleted, taskId, userId]
      );
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  async taskDelete({ taskId, userId }) {
    try {
      await pool.query("BEGIN");
      await pool.query(`DELETE FROM tasks WHERE id = $1 AND user_id = $2`, [
        taskId,
        userId,
      ]);
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  async getTaskCount(userId) {
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
}

class GoalQueries {
  async goalsGet(userId) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM goals WHERE user_id = $1",
        [userId]
      );

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async goalByIdGet({ goalId, userId }) {
    try {
      const { rows } = await pool.query(
        `
    SELECT id, title, description, created_at
    FROM goals
    WHERE id = $1 AND user_id = $2
    `,
        [goalId, userId]
      );

      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async newGoalPost({ title, description, userId }) {
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

  async editGoalPost({ title, description, goalId, userId }) {
    try {
      await pool.query(
        `
      UPDATE goals
      SET title = $1, description = $2
      WHERE id = $3 AND user_id = $4
      `,
        [title, description, goalId, userId]
      );
    } catch (err) {
      throw err;
    }
  }

  async goalDelete({ goalId, userId }) {
    try {
      await pool.query("BEGIN");
      await pool.query(`DELETE FROM goals WHERE id = $1 AND user_id = $2`, [
        goalId,
        userId,
      ]);
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  async getGoalCount(userId) {
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
}

class TagQueries {
  async tagsGet(userId) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM tags WHERE user_id = $1",
        [userId]
      );

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async tagByIdGet({ tagId, userId }) {
    try {
      const { rows } = await pool.query(
        `
    SELECT id, name
    FROM tags
    WHERE id = $1 AND user_id = $2
    `,
        [tagId, userId]
      );

      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async newTagPost({ name, userId }) {
    try {
      await pool.query(
        `
      INSERT INTO tags (name, user_id) 
      VALUES ($1, $2) 
      ON CONFLICT (name, user_id) DO NOTHING;
      `,
        [name.trim().toLowerCase(), userId]
      );
    } catch (err) {
      throw err;
    }
  }

  async editTagPost({ newName, tagId, userId }) {
    try {
      newName = newName.trim().toLowerCase();

      const existing = await pool.query(
        `SELECT id FROM tags WHERE name = $1 AND user_id = $2`,
        [newName, userId]
      );

      if (existing.rows.length > 0 && existing.rows[0].id !== tagid) {
        throw new Error("Tag name already exists for this uesr.");
      }

      await pool.query(
        `
      UPDATE tags
      SET name = $1
      WHERE id = $2 AND user_id = $3
      `,
        [newName, tagId, userId]
      );
    } catch (err) {
      throw err;
    }
  }

  async tagDelete({ tagId, userId }) {
    try {
      await pool.query("BEGIN");
      await pool.query(`DELETE FROM tags WHERE id = $1 AND user_id = $2`, [
        tagId,
        userId,
      ]);
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  async getTagCount(userId) {
    try {
      const result = await pool.query(
        "SELECT COUNT(*) FROM tags WHERE user_id = $1",
        [userId]
      );

      return Number(result.rows[0].count);
    } catch (err) {
      throw err;
    }
  }
}

class ClubhouseQueries {
  async findRoomById(roomId) {
    try {
      const { rows } = await pool.query(
        `
        SELECT r.*, u.username AS "ownerName"
        FROM rooms r  
        LEFT JOIN users u ON r.owner_id = u.id
        WHERE r.id = $1`,
        [roomId]
      );
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async findAllRooms() {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM rooms ORDER BY created_at`
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  async newRoom({ title, description, ownerId }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO rooms (title, description, owner_id) VALUES ($1, $2, $3) RETURNING *`,
        [title, description, ownerId]
      );
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async editRoom({ roomId, title, description }) {
    try {
      const { rows } = await pool.query(
        `UPDATE rooms SET title = $1, description = $2 WHERE id = $3 RETURNING *`,
        [title, description, roomId]
      );
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async deleteRoom(roomId) {
    try {
      await pool.query(`DELETE FROM rooms WHERE id = $1`, [roomId]);
    } catch (err) {
      throw err;
    }
  }

  async findMessageById(msgId) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM messages WHERE id = $1`,
        [msgId]
      );
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async newMessage({ content, authorId, roomId }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO messages (content, author_id, room_id) VALUES ($1, $2, $3) RETURNING*`,
        [content, authorId, roomId]
      );
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async deleteMessage(msgId) {
    try {
      await pool.query(`DELETE FROM messages WHERE ID = $1`, [msgId]);
    } catch (err) {
      throw err;
    }
  }

  async getMessagesByRoom(roomId) {
    try {
      const { rows } = await pool.query(
        `SELECT m.*, u.username AS author_username
        FROM messages m
        LEFT JOIN users u ON m.author_id = u.id
        WHERE m.room_id = $1
        ORDER BY m.created_at`,
        [roomId]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  async addMembership({ userId, roomId }) {
    try {
      await pool.query(
        `INSERT INTO room_memberships (user_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, roomId]
      );
    } catch (err) {
      throw err;
    }
  }

  async removeMembership({ userId, roomId }) {
    try {
      await pool.query(
        `DELETE FROM room_memberships WHERE user_id = $1 AND room_id = $2`,
        [userId, roomId]
      );
    } catch (err) {
      throw err;
    }
  }

  async getUserRooms(userId) {
    try {
      const { rows } = await pool.query(
        `SELECT r.*
        FROM rooms r
        JOIN room_memberships m ON r.id = m.room_id
        WHERE m.user_id = $1
        ORDER BY r.created_at`,
        [userId]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  async findJoinedRoomIds(userId) {
    try {
      const { rows } = await pool.query(
        `SELECT room_id FROM room_memberships WHERE user_id =$1`,
        [userId]
      );
      return rows.map((r) => r.room_id);
    } catch (err) {
      throw err;
    }
  }

  async isUserMemberOfRoom({ userId, roomId }) {
    try {
      const { rows } = await pool.query(
        `SELECT 1 FROM room_memberships WHERE room_id = $1 AND user_id = $2`,
        [roomId, userId]
      );
      return rows.length > 0;
    } catch (err) {
      throw err;
    }
  }
}

class ProfileQueries {
  async roomsJoinedByUser(userId) {
    try {
      const { rows } = await pool.query(
        `
      SELECT r.id, r.title
      FROM room_memberships rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.user_id = $1
      ORDER BY r.title ASC
      `,
        [userId]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  async messagesByUser(userId) {
    try {
      const { rows } = await pool.query(
        `
        SELECT m.id, m.content, m.created_at, r.id AS room_id, r.title AS room_title
        FROM messages m
        JOIN rooms r ON m.room_id = r.id
        WHERE m.author_id = $1
        ORDER BY m.created_at DESC
        LIMIT 50
        `,
        [userId]
      );
      console.log(rows);
      return rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = {
  UserQueries: new UserQueries(),
  TaskQueries: new TaskQueries(),
  GoalQueries: new GoalQueries(),
  TagQueries: new TagQueries(),
  ClubhouseQueries: new ClubhouseQueries(),
  ProfileQueries: new ProfileQueries(),
};
