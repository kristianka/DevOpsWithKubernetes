import pg from "pg";

const { Pool } = pg;

// Database connection
export const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres-stset-0.postgres-svc",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB || "pingpongdb",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres"
});

// Initialize database
export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counter (
        id INTEGER PRIMARY KEY,
        value INTEGER NOT NULL
      )
    `);

    // Initialize counter if it doesn't exist
    const result = await pool.query("SELECT value FROM counter WHERE id = 1");
    if (result.rows.length === 0) {
      await pool.query("INSERT INTO counter (id, value) VALUES (1, 0)");
      console.log("Initialized counter in database");
    } else {
      console.log("Counter already exists with value:", result.rows[0].value);
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
