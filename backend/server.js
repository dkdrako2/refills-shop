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
    console.error(error);

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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "No se pudieron consultar las tablas"
    });
  }
});

/* =========================
   GAMES
========================= */

// Obtener todos los juegos
app.get("/api/games", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        g.id,
        g.name,
        g.slug,
        g.image_url,
        g.active,
        g.category_id,
        c.name AS category_name
      FROM games g
      LEFT JOIN categories c
        ON g.category_id = c.id
      ORDER BY g.id ASC;
    `);

    res.json({
      ok: true,
      games: result.rows
    });
  } catch (error) {
    console.error("Error obteniendo juegos:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener los juegos"
    });
  }
});

// Obtener un juego por ID
app.get("/api/games/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        g.id,
        g.name,
        g.slug,
        g.image_url,
        g.active,
        g.category_id,
        c.name AS category_name
      FROM games g
      LEFT JOIN categories c
        ON g.category_id = c.id
      WHERE g.id = $1;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Juego no encontrado"
      });
    }

    res.json({
      ok: true,
      game: result.rows[0]
    });
  } catch (error) {
    console.error("Error obteniendo juego:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo obtener el juego"
    });
  }
});

// Crear un juego
app.post("/api/games", async (req, res) => {
  try {
    const {
      name,
      slug,
      image_url,
      category_id,
      active = true
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        ok: false,
        error: "name y slug son obligatorios"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO games
        (name, slug, image_url, category_id, active)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [
        name,
        slug,
        image_url || null,
        category_id || null,
        active
      ]
    );

    res.status(201).json({
      ok: true,
      game: result.rows[0]
    });
  } catch (error) {
    console.error("Error creando juego:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo crear el juego"
    });
  }
});

// Actualizar un juego
app.put("/api/games/:id", async (req, res) => {
  try {
    const {
      name,
      slug,
      image_url,
      category_id,
      active
    } = req.body;

    const result = await pool.query(
      `
      UPDATE games
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        image_url = COALESCE($3, image_url),
        category_id = COALESCE($4, category_id),
        active = COALESCE($5, active)
      WHERE id = $6
      RETURNING *;
      `,
      [
        name ?? null,
        slug ?? null,
        image_url ?? null,
        category_id ?? null,
        active ?? null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Juego no encontrado"
      });
    }

    res.json({
      ok: true,
      game: result.rows[0]
    });
  } catch (error) {
    console.error("Error actualizando juego:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo actualizar el juego"
    });
  }
});

// Eliminar un juego
app.delete("/api/games/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM games
      WHERE id = $1
      RETURNING *;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Juego no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Juego eliminado",
      game: result.rows[0]
    });
  } catch (error) {
    console.error("Error eliminando juego:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo eliminar el juego"
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
