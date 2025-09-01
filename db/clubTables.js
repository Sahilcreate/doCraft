#! /usr/bin/env node
require("dotenv").config();

const fs = require("fs");
const path = require("node:path");
const { Client } = require("pg");

const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS room_memberships(
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, room_id)
    );
`;

const seedGlobalRoomSQL = `
    INSERT INTO rooms (title, description, owner_id)
    VALUES ('global', 'Default global room for everyone', NULL)
    ON CONFLICT (title) DO NOTHING;
`;

async function main() {
  console.log("...seeding clubhouse tables");
  const client = new Client({
    // user: process.env.PGUSER,
    // password: process.env.PGPASSWORD,
    // host: process.env.PGHOST,
    // port: process.env.PGPORT,
    // database: process.env.PGDATABASE,
    // ssl: {
    //   rejectUnauthorized: true,
    //   ca: fs.readFileSync(path.resolve(__dirname, "../ca.pem")).toString(),
    // },
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    await client.query("BEGIN");
    await client.query(createTablesSQL);
    await client.query(seedGlobalRoomSQL);
    await client.query("COMMIT");

    console.log("Seed complete (tables + global room)");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error during seeding:", err);
  } finally {
    await client.end();
  }
}

main();
