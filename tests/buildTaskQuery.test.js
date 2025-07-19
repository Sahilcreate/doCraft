const { buildTaskQuery } = require("../utils/buildTaskQuery");

describe("buildTaskQuery", () => {
  test("returns full query with all filter and sort", () => {
    const input = {
      goals: ["fitness", "diet plan"],
      tags: ["morning", "routine"],
      dueBefore: "2025-07-30",
      sort: "added-date-desc",
    };
    const { query, values } = buildTaskQuery(input);

    expect(query).toContain(`g.title = ANY($1)`);
    expect(query).toContain(`tg.name = ANY($2)`);
    expect(query).toContain(`t.due_date <= $3`);
    expect(query).toContain(`ORDER BY t.added_date DESC`);

    expect(values).toEqual([
      ["fitness", "diet plan"],
      ["morning", "routine"],
      "2025-07-30",
    ]);
  });

  test("return query with only dueBefore and sort", () => {
    const input = {
      dueBefore: "2025-07-30",
      sort: "added-date-desc",
    };

    const { query, values } = buildTaskQuery(input);

    expect(query).toContain(`t.due_date <= $1`);
    expect(query).toContain(`ORDER BY t.added_date DESC`);

    expect(values).toEqual(["2025-07-30"]);
  });

  test("return query without WHERE and ORDER filter", () => {
    const input = {};

    const { query, values } = buildTaskQuery(input);

    expect(query).not.toContain(`WHERE`);
    expect(query).not.toContain(`$1`);
    expect(query).not.toContain(`ORDER BY`);

    expect(values).toEqual([]);
  });
});
