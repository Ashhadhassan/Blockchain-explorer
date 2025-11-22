const { Pool } = require('pg');
require('dotenv').config();

console.log("Loaded ENV:", {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  database: process.env.PG_DATABASE
});

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => {
    console.error("❌ DB Connection Error:", err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error("\n💡 PostgreSQL is not running!");
      console.error("   Please start PostgreSQL service or check your connection settings.");
      console.error("   Windows: Open Services (services.msc) and start PostgreSQL service");
    } else if (err.code === '28P01') {
      console.error("\n💡 Authentication failed! Check your .env file credentials.");
    } else if (err.code === '3D000') {
      console.error(`\n💡 Database "${process.env.PG_DATABASE}" does not exist!`);
      console.error("   Create it with: CREATE DATABASE " + process.env.PG_DATABASE + ";");
    }
  });

module.exports = { pool };

