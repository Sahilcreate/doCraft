function buildTaskQuery({ goals = [], tags = [], dueBefore = "", sort, show }) {
  const conditions = [];
  const values = [];

  let idx = 1;

  if (goals.length) {
    conditions.push(`g.id = ANY($${idx++})`);

    values.push(goals);
  }

  if (tags.length) {
    conditions.push(`tg.id = ANY($${idx++})`);

    values.push(tags);
  }

  if (dueBefore) {
    conditions.push(`t.due_date <= $${idx++}`);

    values.push(dueBefore);
  }

  if (show) {
    switch (show) {
      case "default":
        break;
      case "is_completed_true":
        conditions.push(`t.is_completed = true`);
        break;
      case "is_completed_false":
        conditions.push(`t.is_completed = false`);
        break;
    }
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  let orderByClause = "";
  switch (sort) {
    case "created-at-asc":
      orderByClause = "t.created_at ASC";
      break;
    case "created-at-desc":
      orderByClause = "t.created_at DESC";
      break;
    case "due-date-asc":
      orderByClause = "t.due_date ASC";
      break;
    case "due-date-desc":
      orderByClause = "t.due_date DESC";
      break;
    default:
      orderByClause = "";
  }

  const query = `
        SELECT DISTINCT ON (t.id) t.* FROM tasks AS t
        LEFT JOIN goals AS g ON g.id = t.goal_id
        LEFT JOIN task_tags AS tt ON tt.task_id = t.id
        LEFT JOIN tags AS tg ON tg.id = tt.tag_id
        ${whereClause}
        ORDER BY t.id,
          CASE WHEN t.is_completed THEN 1 ELSE 0 END ASC
          ${orderByClause ? `, ${orderByClause}` : ""}
    `;

  return { query, values };
}

module.exports = { buildTaskQuery };
