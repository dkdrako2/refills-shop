const express = require("express");
const { initDatabase, pool } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* =========================
   GENERAL
========================= */

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

/* =========================
   DATABASE TEST
========================= */

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

/* =========================
   CATEGORIES
========================= */

// Obtener todas las categorías
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        slug,
        created_at
      FROM categories
      ORDER BY id ASC;
    `);

    res.json({
      ok: true,
      categories: result.rows
    });
  } catch (error) {
    console.error("Error obteniendo categorías:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener las categorías"
    });
  }
});

// Obtener una categoría
app.get("/api/categories/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        created_at
      FROM categories
      WHERE id = $1;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Categoría no encontrada"
      });
    }

    res.json({
      ok: true,
      category: result.rows[0]
    });
  } catch (error) {
    console.error("Error obteniendo categoría:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo obtener la categoría"
    });
  }
});

// Crear categoría
app.post("/api/categories", async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        ok: false,
        error: "name y slug son obligatorios"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO categories (name, slug)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [name, slug]
    );

    res.status(201).json({
      ok: true,
      category: result.rows[0]
    });
  } catch (error) {
    console.error("Error creando categoría:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo crear la categoría"
    });
  }
});

// Actualizar categoría
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { name, slug } = req.body;

    const result = await pool.query(
      `
      UPDATE categories
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug)
      WHERE id = $3
      RETURNING *;
      `,
      [
        name ?? null,
        slug ?? null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Categoría no encontrada"
      });
    }

    res.json({
      ok: true,
      category: result.rows[0]
    });
  } catch (error) {
    console.error("Error actualizando categoría:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo actualizar la categoría"
    });
  }
});

// Eliminar categoría
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM categories
      WHERE id = $1
      RETURNING *;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Categoría no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Categoría eliminada",
      category: result.rows[0]
    });
  } catch (error) {
    console.error("Error eliminando categoría:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo eliminar la categoría"
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

// Obtener un juego
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

// Crear juego
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

// Actualizar juego
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

// Eliminar juego
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

/* =========================
   OFFERS
========================= */

// Obtener todas las ofertas
app.get("/api/offers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.game_id,
        g.name AS game_name,
        g.slug AS game_slug,
        o.name,
        o.amount,
        o.price_sm,
        o.price_cup,
        o.price_usdt,
        o.active,
        o.created_at
      FROM offers o
      INNER JOIN games g
        ON o.game_id = g.id
      ORDER BY o.id ASC;
    `);

    res.json({
      ok: true,
      offers: result.rows
    });
  } catch (error) {
    console.error("Error obteniendo ofertas:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener las ofertas"
    });
  }
});

// Obtener ofertas de un juego
app.get("/api/games/:id/offers", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        game_id,
        name,
        amount,
        price_sm,
        price_cup,
        price_usdt,
        active,
        created_at
      FROM offers
      WHERE game_id = $1
      ORDER BY id ASC;
      `,
      [req.params.id]
    );

    res.json({
      ok: true,
      offers: result.rows
    });
  } catch (error) {
    console.error("Error obteniendo ofertas del juego:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener las ofertas"
    });
  }
});

// Obtener una oferta
app.get("/api/offers/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        o.id,
        o.game_id,
        g.name AS game_name,
        o.name,
        o.amount,
        o.price_sm,
        o.price_cup,
        o.price_usdt,
        o.active,
        o.created_at
      FROM offers o
      INNER JOIN games g
        ON o.game_id = g.id
      WHERE o.id = $1;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Oferta no encontrada"
      });
    }

    res.json({
      ok: true,
      offer: result.rows[0]
    });
  } catch (error) {
    console.error("Error obteniendo oferta:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo obtener la oferta"
    });
  }
});

// Crear oferta
app.post("/api/offers", async (req, res) => {
  try {
    const {
      game_id,
      name,
      amount,
      price_sm,
      price_cup,
      price_usdt,
      active = true
    } = req.body;

    if (!game_id || !name) {
      return res.status(400).json({
        ok: false,
        error: "game_id y name son obligatorios"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO offers
        (
          game_id,
          name,
          amount,
          price_sm,
          price_cup,
          price_usdt,
          active
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        game_id,
        name,
        amount || null,
        price_sm ?? null,
        price_cup ?? null,
        price_usdt ?? null,
        active
      ]
    );

    res.status(201).json({
      ok: true,
      offer: result.rows[0]
    });
  } catch (error) {
    console.error("Error creando oferta:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo crear la oferta"
    });
  }
});

// Actualizar oferta
app.put("/api/offers/:id", async (req, res) => {
  try {
    const {
      game_id,
      name,
      amount,
      price_sm,
      price_cup,
      price_usdt,
      active
    } = req.body;

    const result = await pool.query(
      `
      UPDATE offers
      SET
        game_id = COALESCE($1, game_id),
        name = COALESCE($2, name),
        amount = COALESCE($3, amount),
        price_sm = COALESCE($4, price_sm),
        price_cup = COALESCE($5, price_cup),
        price_usdt = COALESCE($6, price_usdt),
        active = COALESCE($7, active)
      WHERE id = $8
      RETURNING *;
      `,
      [
        game_id ?? null,
        name ?? null,
        amount ?? null,
        price_sm ?? null,
        price_cup ?? null,
        price_usdt ?? null,
        active ?? null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Oferta no encontrada"
      });
    }

    res.json({
      ok: true,
      offer: result.rows[0]
    });
  } catch (error) {
    console.error("Error actualizando oferta:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo actualizar la oferta"
    });
  }
});

// Eliminar oferta
app.delete("/api/offers/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM offers
      WHERE id = $1
      RETURNING *;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Oferta no encontrada"
      });
    }

    res.json({
      ok: true,
      message: "Oferta eliminada",
      offer: result.rows[0]
    });
  } catch (error) {
    console.error("Error eliminando oferta:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo eliminar la oferta"
    });
  }
});

/* =========================
   START SERVER
========================= */

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
