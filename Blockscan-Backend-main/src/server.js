/**
 * Server Entry Point
 * Initializes the Express application and starts the server
 * @module server
 */

const dotenv = require("dotenv");
const app = require("./app.js");
const { pool } = require("./config/connectDB");

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Test database connection on startup
 * This ensures the database is accessible before accepting requests
 */
pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1); // Exit if database connection fails
  });

/**
 * Start the Express server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});
