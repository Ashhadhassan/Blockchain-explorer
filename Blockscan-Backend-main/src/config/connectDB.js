/**
 * PostgreSQL Database Connection Pool
 * Manages database connections using connection pooling for better performance
 * @module connectDB
 */

const { Pool } = require("pg");
require("dotenv").config();

/**
 * Database connection configuration
 * Reads connection parameters from environment variables
 */
const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || "blockscan",
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

/**
 * Handle pool errors
 * Logs errors but doesn't crash the application
 */
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

/**
 * Test database connection on module load
 * Provides helpful error messages for common connection issues
 */
if (process.env.NODE_ENV !== "test") {
  pool.connect()
    .then((client) => {
      console.log("✅ Connected to PostgreSQL");
      client.release();
    })
    .catch((err) => {
      console.error("❌ DB Connection Error:", err.message);
      if (err.code === "ECONNREFUSED") {
        console.error("\n💡 PostgreSQL is not running!");
        console.error("   Please start PostgreSQL service or check your connection settings.");
        console.error("   Windows: Open Services (services.msc) and start PostgreSQL service");
      } else if (err.code === "28P01") {
        console.error("\n💡 Authentication failed! Check your .env file credentials.");
      } else if (err.code === "3D000") {
        console.error(`\n💡 Database "${process.env.PG_DATABASE}" does not exist!`);
        console.error(`   Create it with: CREATE DATABASE ${process.env.PG_DATABASE};`);
      }
    });
}

module.exports = { pool };

