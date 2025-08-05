const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: true,
  //   ca: Buffer.from(process.env.CA_CERT, "base64").toString(),
  // },
});

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
  process.exit(-1);
});

module.exports = pool;
