const { buildTaskQuery } = require("../public/utils/buildTaskQuery");

describe("buildTaskQuery", () => {
  test("returns full query with all filter and sort", () => {
    const input = {
      goals: ["2", "3"],
      tags: ["1", "3"],
      dueBefore: "2025-07-30",
      sort: "created-at-desc",
    };
    const { query, values } = buildTaskQuery(input);

    expect(query).toContain(`g.id = ANY($1)`);
    expect(query).toContain(`tg.id = ANY($2)`);
    expect(query).toContain(`t.due_date <= $3`);
    expect(query).toContain(`ORDER BY t.created_at DESC`);

    expect(values).toEqual([["2", "3"], ["1", "3"], "2025-07-30"]);
  });

  test("return query with only dueBefore and sort", () => {
    const input = {
      dueBefore: "2025-07-30",
      sort: "created-at-desc",
    };

    const { query, values } = buildTaskQuery(input);

    expect(query).toContain(`t.due_date <= $1`);
    expect(query).toContain(`ORDER BY t.created_at DESC`);

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
