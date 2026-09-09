const express = require("express");
const { initDatabase, pool } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "REFILLS SHOP Backend funcionando"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    service: "REFILLS SHOP API",
    status: "online"
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      ok: true,
      database: "connected",
      time: result.rows[0].time
    });
  } catch (error) {
    console.error("Error de PostgreSQL:", error);

    res.status(500).json({
      ok: false,
      database: "error"
    });
  }
});

app.get("/api/db-tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    res.json({
      ok: true,
      tables: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error("Error consultando tablas:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudieron consultar las tablas"
    });
  }
});

async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`REFILLS SHOP Backend iniciado en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error iniciando servidor:", error);
    process.exit(1);
  }
}

startServer();
