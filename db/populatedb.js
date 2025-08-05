#! /usr/bin/env node
require("dotenv").config();

const fs = require("fs");
const path = require("node:path");
const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash)
VALUES
    ('demo', 'fakehash123')
ON CONFLICT (username) DO NOTHING;

INSERT INTO goals (title, description, user_id)
VALUES 
    ('Fitness', 'Morning health routine', 1),
    ('Reading', 'Everyday must read books', 1),
    ('Diet Plan', 'You need to cut that fat', 1);

INSERT INTO tasks (title, description, goal_id, user_id, due_date)
VALUES
  ('Stretch for 10 mins', 'Full body warm-up stretches', 1, 1, '2025-07-19'),
  ('Go for a 3km run', 'Morning jog at the park', 1, 1, '2025-07-20'),
  ('Bodyweight workout', 'Pushups, squats, and planks - 3 sets each', 1, 1, '2025-07-21'),
  ('Read 10 pages of Atomic Habits', 'Focus on identity-based habits', 2, 1, '2025-07-19'),
  ('Summarize key points', 'Write 3 actionable takeaways from today’s reading', 2, 1, '2025-07-20'),
  ('Read for 20 mins before bed', 'Nightly reading routine', 2, 1, '2025-07-21'),
  ('Plan weekly meals', 'Create a healthy veg meal plan for the week', 3, 1, '2025-07-19'),
  ('Track calories', 'Log today’s meals into calorie tracker', 3, 1, '2025-07-20'),
  ('Avoid sugar for a day', 'No processed sugar today - challenge!', 3, 1, '2025-07-21');
`;

async function main() {
  console.log("Seeding tables and inserting sample data...");
  const client = new Client({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.resolve(__dirname, "../ca.pem")).toString(),
    },
  });

  try {
    await client.connect();
    await client.query(SQL);
    console.log("Seed complete");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await client.end();
  }
}

main();
