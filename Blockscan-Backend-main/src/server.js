// src/server.js
const dotenv = require("dotenv");
const app = require("./app.js");
const { pool } = require("./config/connectDB");

dotenv.config();


const PORT = process.env.PORT || 5000;

// Test DB connection on startup
pool.connect()
  .then(() => console.log(" PostgreSQL Connected"))
  .catch((err) => console.error("❌ DB Error:", err.message));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
