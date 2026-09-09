const express = require("express");
const cors = require("cors");

const { initDatabase, pool } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "https://dkdrako2.github.io"
];

app.use(
  cors({
    origin: function (origin, callback) {

      // Permite herramientas como Postman/curl
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origen no permitido por CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

/* =========================
   JSON
========================= */

app.use(express.json());


/* =========================
   INICIO
========================= */

app.get("/", (req, res) => {

  res.json({
    ok: true,
    message: "REFILLS SHOP Backend funcionando"
  });

});


/* =========================
   STATUS
========================= */

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

    const result = await pool.query(
      "SELECT NOW() AS time"
    );

    res.json({
      ok: true,
      database: "connected",
      time: result.rows[0].time
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Database connection failed"
    });

  }

});


/* =========================
   DATABASE TABLES
========================= */

app.get("/api/db-tables", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    res.json({
      ok: true,
      tables: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not read database tables"
    });

  }

});


/* =========================
   CATEGORIES
========================= */

app.get("/api/categories", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM categories
      ORDER BY id ASC
    `);

    res.json({
      ok: true,
      categories: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load categories"
    });

  }

});


app.get("/api/categories/:id", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Category not found"
      });

    }

    res.json({
      ok: true,
      category: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load category"
    });

  }

});


app.post("/api/categories", async (req, res) => {

  try {

    const { name, slug } = req.body;

    if (!name || !slug) {

      return res.status(400).json({
        ok: false,
        error: "name and slug are required"
      });

    }

    const result = await pool.query(
      `
      INSERT INTO categories
      (name, slug)
      VALUES ($1, $2)
      RETURNING *
      `,
      [name, slug]
    );

    res.status(201).json({
      ok: true,
      category: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not create category"
    });

  }

});


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
      RETURNING *
      `,
      [name ?? null, slug ?? null, req.params.id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Category not found"
      });

    }

    res.json({
      ok: true,
      category: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not update category"
    });

  }

});


app.delete("/api/categories/:id", async (req, res) => {

  try {

    const result = await pool.query(
      `
      DELETE FROM categories
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Category not found"
      });

    }

    res.json({
      ok: true,
      category: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not delete category"
    });

  }

});


/* =========================
   GAMES
========================= */

app.get("/api/games", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        games.*,
        categories.name AS category_name
      FROM games
      LEFT JOIN categories
        ON games.category_id = categories.id
      ORDER BY games.id ASC
    `);

    res.json({
      ok: true,
      games: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load games"
    });

  }

});


app.get("/api/games/:id", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        games.*,
        categories.name AS category_name
      FROM games
      LEFT JOIN categories
        ON games.category_id = categories.id
      WHERE games.id = $1
      `,
      [req.params.id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Game not found"
      });

    }

    res.json({
      ok: true,
      game: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load game"
    });

  }

});


app.post("/api/games", async (req, res) => {

  try {

    const {
      category_id,
      name,
      slug,
      image_url,
      active
    } = req.body;

    if (!name || !slug) {

      return res.status(400).json({
        ok: false,
        error: "name and slug are required"
      });

    }

    const result = await pool.query(
      `
      INSERT INTO games
      (
        category_id,
        name,
        slug,
        image_url,
        active
      )
      VALUES
      ($1, $2, $3, $4, COALESCE($5, true))
      RETURNING *
      `,
      [
        category_id ?? null,
        name,
        slug,
        image_url ?? null,
        active ?? true
      ]
    );

    res.status(201).json({
      ok: true,
      game: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not create game"
    });

  }

});


app.put("/api/games/:id", async (req, res) => {

  try {

    const {
      category_id,
      name,
      slug,
      image_url,
      active
    } = req.body;

    const result = await pool.query(
      `
      UPDATE games
      SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        image_url = COALESCE($4, image_url),
        active = COALESCE($5, active)
      WHERE id = $6
      RETURNING *
      `,
      [
        category_id ?? null,
        name ?? null,
        slug ?? null,
        image_url ?? null,
        active ?? null,
        req.params.id
      ]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Game not found"
      });

    }

    res.json({
      ok: true,
      game: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not update game"
    });

  }

});


app.delete("/api/games/:id", async (req, res) => {

  try {

    const result = await pool.query(
      `
      DELETE FROM games
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Game not found"
      });

    }

    res.json({
      ok: true,
      game: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not delete game"
    });

  }

});


/* =========================
   OFFERS
========================= */

app.get("/api/offers", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        offers.*,
        games.name AS game_name
      FROM offers
      LEFT JOIN games
        ON offers.game_id = games.id
      ORDER BY offers.id ASC
    `);

    res.json({
      ok: true,
      offers: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load offers"
    });

  }

});


app.get("/api/games/:id/offers", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM offers
      WHERE game_id = $1
      ORDER BY id ASC
      `,
      [req.params.id]
    );

    res.json({
      ok: true,
      offers: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load game offers"
    });

  }

});


app.get("/api/offers/:id", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        offers.*,
        games.name AS game_name
      FROM offers
      LEFT JOIN games
        ON offers.game_id = games.id
      WHERE offers.id = $1
      `,
      [req.params.id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Offer not found"
      });

    }

    res.json({
      ok: true,
      offer: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load offer"
    });

  }

});


app.post("/api/offers", async (req, res) => {

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

    if (!game_id || !name) {

      return res.status(400).json({
        ok: false,
        error: "game_id and name are required"
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
      ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
      RETURNING *
      `,
      [
        game_id,
        name,
        amount ?? null,
        price_sm ?? null,
        price_cup ?? null,
        price_usdt ?? null,
        active ?? true
      ]
    );

    res.status(201).json({
      ok: true,
      offer: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not create offer"
    });

  }

});


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
      RETURNING *
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

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Offer not found"
      });

    }

    res.json({
      ok: true,
      offer: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not update offer"
    });

  }

});


app.delete("/api/offers/:id", async (req, res) => {

  try {

    const result = await pool.query(
      `
      DELETE FROM offers
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        ok: false,
        error: "Offer not found"
      });

    }

    res.json({
      ok: true,
      offer: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not delete offer"
    });

  }

});


/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {

  console.error(err);

  if (err.message === "Origen no permitido por CORS") {

    return res.status(403).json({
      ok: false,
      error: "Origin not allowed"
    });

  }

  res.status(500).json({
    ok: false,
    error: "Internal server error"
  });

});


/* =========================
   START
========================= */

async function startServer() {

  try {

    await initDatabase();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          `REFILLS SHOP Backend iniciado en puerto ${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      "Error iniciando servidor:",
      error
    );

    process.exit(1);

  }

}

startServer();
