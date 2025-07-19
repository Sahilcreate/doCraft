function buildTaskQuery({ goals = [], tags = [], dueBefore, sort }) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (goals.length) {
    conditions.push(`g.title = ANY($${idx++})`);
    values.push(goals);
  }

  if (tags.length) {
    conditions.push(`tg.name = ANY($${idx++})`);
    values.push(tags);
  }

  if (dueBefore) {
    conditions.push(`t.due_date <= $${idx++}`);
    values.push(dueBefore);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  let orderByClause = "";
  switch (sort) {
    case "added-date-asc":
      orderByClause = "ORDER BY t.added_date ASC";
      break;
    case "added-date-desc":
      orderByClause = "ORDER BY t.added_date DESC";
      break;
    case "due-date-asc":
      orderByClause = "ORDER BY t.due_date ASC";
      break;
    case "due-date-desc":
      orderByClause = "ORDER BY t.due_date DESC";
      break;
    default:
      orderByClause = "";
  }

  const query = `
        SELECT DISTINCE FROM tasks t
        JOIN goals g ON g.id = t.goal_id
        LEFT JOIN task_tags tt ON tt.task_id = t.id
        LEFT JOIN tags tg ON tg.id = tt.tag_id
        ${whereClause}
        ${orderByClause}
    `;

  return { query, values };
}

module.exports = { buildTaskQuery };
