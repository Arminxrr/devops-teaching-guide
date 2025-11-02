import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "kuy",
  password: process.env.DB_PASS || "123",
  database: process.env.DB_NAME || "pind",
  port: 5432
});

app.get("/health", (req, res) => res.send("ok"));

app.get("/api/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(port, () => console.log(`API running on :${port}`));
