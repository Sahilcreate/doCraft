#! /usr/bin/env node
require("dotenv").config();

const fs = require("fs");
const path = require("node:path");
const { Client } = require("pg");

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS task_tags (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
`;

const insertTagsSQL = `
INSERT INTO tags (name)
VALUES
    ('morning'),
    ('exercise'),
    ('reading'),
    ('diet'),
    ('challenge'),
    ('routine'),
    ('planning')
ON CONFLICT (name) DO NOTHING;
`;

const insertTaskTagsSQL = `
INSERT INTO task_tags (task_id, tag_id)
VALUES
    (1, 1), (1, 2),
    (2, 1), (2, 2),
    (3, 2),
    (4, 3), (4, 6),
    (5, 3),
    (6, 3), (6, 6),
    (7, 4), (7, 7),
    (8, 4),
    (9, 4), (9, 5)
ON CONFLICT DO NOTHING;
`;

async function main() {
  console.log("...seeding");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // Uncomment if using SSL with CA cert
    // ssl: {
    //   rejectUnauthorized: true,
    //   ca: fs.readFileSync(path.resolve(__dirname, "../ca.pem")).toString(),
    // },
  });

  try {
    await client.connect();

    await client.query("BEGIN");
    await client.query(createTablesSQL);
    await client.query(insertTagsSQL);
    await client.query(insertTaskTagsSQL);
    await client.query("COMMIT");

    console.log("Seed complete");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error during seeding:", err);
  } finally {
    await client.end();
  }
}

main();
