const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const DEFAULT_STATE = {
  config: {
    creditRateSM: 315,
    smToCupRate: 3.3
  },
  games: []
};

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS store_state (
      id INTEGER PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await pool.query(
    "SELECT id FROM store_state WHERE id = 1"
  );

  if (result.rowCount === 0) {
    await pool.query(
      `
      INSERT INTO store_state (id, data)
      VALUES (1, $1::jsonb)
      `,
      [JSON.stringify(DEFAULT_STATE)]
    );
  }
}

function requireAdmin(req, res, next) {
  const password = req.header("X-Admin-Password");
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (!correctPassword || password !== correctPassword) {
    return res.status(401).json({
      error: "No autorizado"
    });
  }

  next();
}


// ===============================
// OBTENER DATOS DE LA TIENDA
// ===============================

app.get("/api/store", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT data, updated_at
      FROM store_state
      WHERE id = 1
    `);

    if (result.rowCount === 0) {
      return res.status(500).json({
        error: "Tienda no inicializada"
      });
    }

    res.json({
      ...result.rows[0].data,
      updatedAt: result.rows[0].updated_at
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error de base de datos"
    });
  }
});


// ===============================
// COMPROBAR CONTRASEÑA ADMIN
// ===============================

app.post("/api/admin/check", (req, res) => {
  const password = req.body?.password;

  if (
    process.env.ADMIN_PASSWORD &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      ok: true
    });
  }

  res.status(401).json({
    ok: false
  });
});


// ===============================
// GUARDAR CAMBIOS
// ===============================

app.put("/api/store", requireAdmin, async (req, res) => {
  try {

    const data = {
      config: req.body?.config || DEFAULT_STATE.config,

      games: Array.isArray(req.body?.games)
        ? req.body.games
        : []
    };

    await pool.query(
      `
      UPDATE store_state
      SET
        data = $1::jsonb,
        updated_at = NOW()
      WHERE id = 1
      `,
      [JSON.stringify(data)]
    );

    res.json({
      ok: true
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "No se pudo guardar"
    });
  }
});


// ===============================
// ESTADO DEL SERVIDOR
// ===============================

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "Refills Shop API"
  });
});


// ===============================
// INICIAR
// ===============================

initDatabase()
  .then(() => {

    app.listen(PORT, () => {
      console.log(
        `Servidor iniciado en puerto ${PORT}`
      );
    });

  })
  .catch((error) => {

    console.error(
      "No se pudo iniciar el servidor:",
      error
    );

    process.exit(1);
  });
