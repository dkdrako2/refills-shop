const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "REFILLS SHOP Backend funcionando",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    service: "REFILLS SHOP API",
    status: "online",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      ok: true,
      database: "connected",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("Error de PostgreSQL:", error);

    res.status(500).json({
      ok: false,
      database: "error",
      message: "No se pudo conectar con PostgreSQL",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`REFILLS SHOP Backend iniciado en puerto ${PORT}`);
});
