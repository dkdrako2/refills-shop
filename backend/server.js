const express = require("express");
const cors = require("cors");

const { pool, initDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 10000;

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  "https://dkdrako2.github.io"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origen no permitido por CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function generateOrderNumber() {
  const now = new Date();

  const date =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `RF-${date}-${random}`;
}


// ==========================================
// GENERAL
// ==========================================

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


// ==========================================
// BASE DE DATOS
// ==========================================

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
      error: "Error conectando con la base de datos"
    });
  }
});


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
      error: "No se pudieron consultar las tablas"
    });
  }
});


// ==========================================
// CATEGORÍAS
// ==========================================

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
      error: "Error obteniendo categorías"
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo categoría"
    });
  }
});


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
      error: "Error creando categoría"
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error actualizando categoría"
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error eliminando categoría"
    });
  }
});


// ==========================================
// JUEGOS
// ==========================================

app.get("/api/games", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        games.*,
        categories.name AS category_name,
        categories.slug AS category_slug
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
      error: "Error obteniendo juegos"
    });
  }
});


app.get("/api/games/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        games.*,
        categories.name AS category_name,
        categories.slug AS category_slug
      FROM games
      LEFT JOIN categories
        ON games.category_id = categories.id
      WHERE games.id = $1
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo juego"
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
        error: "name y slug son obligatorios"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO games (
        category_id,
        name,
        slug,
        image_url,
        active
      )
      VALUES ($1, $2, $3, $4, COALESCE($5, TRUE))
      RETURNING *
      `,
      [
        category_id ?? null,
        name,
        slug,
        image_url ?? null,
        active
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
      error: "Error creando juego"
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error actualizando juego"
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error eliminando juego"
    });
  }
});


// ==========================================
// OFERTAS
// ==========================================

app.get("/api/offers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        offers.*,
        games.name AS game_name,
        games.slug AS game_slug
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
      error: "Error obteniendo ofertas"
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
        AND active = TRUE
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
      error: "Error obteniendo ofertas del juego"
    });
  }
});


app.get("/api/offers/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        offers.*,
        games.name AS game_name,
        games.slug AS game_slug
      FROM offers
      LEFT JOIN games
        ON offers.game_id = games.id
      WHERE offers.id = $1
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo oferta"
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
        error: "game_id y name son obligatorios"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO offers (
        game_id,
        name,
        amount,
        price_sm,
        price_cup,
        price_usdt,
        active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        COALESCE($7, TRUE)
      )
      RETURNING *
      `,
      [
        game_id,
        name,
        amount ?? null,
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error creando oferta"
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error actualizando oferta"
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
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error eliminando oferta"
    });
  }
});


// ==========================================
// CLIENTES
// ==========================================

app.get("/api/customers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        active,
        created_at,
        updated_at
      FROM customers
      ORDER BY id DESC
    `);

    res.json({
      ok: true,
      customers: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo clientes"
    });
  }
});


app.get("/api/customers/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        active,
        created_at,
        updated_at
      FROM customers
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Cliente no encontrado"
      });
    }

    res.json({
      ok: true,
      customer: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo cliente"
    });
  }
});


// ==========================================
// PEDIDOS
// ==========================================

// Obtener todos los pedidos
app.get("/api/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        orders.*,

        customers.name AS customer_name,
        customers.email AS customer_email,
        customers.phone AS customer_phone,

        games.name AS game_name,
        games.slug AS game_slug,

        offers.name AS offer_name

      FROM orders

      LEFT JOIN customers
        ON orders.customer_id = customers.id

      LEFT JOIN games
        ON orders.game_id = games.id

      LEFT JOIN offers
        ON orders.offer_id = offers.id

      ORDER BY orders.id DESC
    `);

    res.json({
      ok: true,
      orders: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo pedidos"
    });
  }
});


// Obtener un pedido
app.get("/api/orders/:id", async (req, res) => {
  try {
    const orderResult = await pool.query(
      `
      SELECT
        orders.*,

        customers.name AS customer_name,
        customers.email AS customer_email,
        customers.phone AS customer_phone,

        games.name AS game_name,
        games.slug AS game_slug,

        offers.name AS offer_name

      FROM orders

      LEFT JOIN customers
        ON orders.customer_id = customers.id

      LEFT JOIN games
        ON orders.game_id = games.id

      LEFT JOIN offers
        ON orders.offer_id = offers.id

      WHERE orders.id = $1
      `,
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Pedido no encontrado"
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT *
      FROM order_items
      WHERE order_id = $1
      ORDER BY id ASC
      `,
      [req.params.id]
    );

    const paymentsResult = await pool.query(
      `
      SELECT
        id,
        order_id,
        method,
        currency,
        amount,
        status,
        transaction_id,
        external_reference,
        proof_url,
        payer_phone,
        confirmed_at,
        created_at,
        updated_at
      FROM payments
      WHERE order_id = $1
      ORDER BY id DESC
      `,
      [req.params.id]
    );

    const topupsResult = await pool.query(
      `
      SELECT *
      FROM topups
      WHERE order_id = $1
      ORDER BY id DESC
      `,
      [req.params.id]
    );

    res.json({
      ok: true,
      order: orderResult.rows[0],
      items: itemsResult.rows,
      payments: paymentsResult.rows,
      topups: topupsResult.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo pedido"
    });
  }
});


// Crear pedido
app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      game_id,
      offer_id,
      player_id,
      player_name,
      amount,
      payment_method,
      currency,
      subtotal,
      total,
      notes,
      items
    } = req.body;

    if (!game_id || !offer_id) {
      return res.status(400).json({
        ok: false,
        error: "game_id y offer_id son obligatorios"
      });
    }

    if (!player_id) {
      return res.status(400).json({
        ok: false,
        error: "player_id es obligatorio"
      });
    }

    if (total === undefined || total === null) {
      return res.status(400).json({
        ok: false,
        error: "total es obligatorio"
      });
    }

    await client.query("BEGIN");

    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `
      INSERT INTO orders (
        order_number,
        customer_id,
        game_id,
        offer_id,
        player_id,
        player_name,
        amount,
        payment_method,
        currency,
        subtotal,
        total,
        payment_status,
        order_status,
        notes
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, 'pending', 'pending', $12
      )
      RETURNING *
      `,
      [
        orderNumber,
        customer_id ?? null,
        game_id,
        offer_id,
        player_id,
        player_name ?? null,
        amount ?? null,
        payment_method ?? null,
        currency || "USDT",
        subtotal ?? total,
        total,
        notes ?? null
      ]
    );

    const order = orderResult.rows[0];

    // Si llegan items del carrito, guardarlos.
    // Si no llegan, crear automáticamente un item
    // utilizando la oferta principal del pedido.

    if (Array.isArray(items) && items.length > 0) {

      for (const item of items) {

        await client.query(
          `
          INSERT INTO order_items (
            order_id,
            game_id,
            offer_id,
            game_name,
            offer_name,
            amount,
            quantity,
            unit_price,
            total_price
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          `,
          [
            order.id,
            item.game_id ?? null,
            item.offer_id ?? null,
            item.game_name ?? null,
            item.offer_name ?? null,
            item.amount ?? null,
            item.quantity ?? 1,
            item.unit_price ?? 0,
            item.total_price ?? 0
          ]
        );
      }

    } else {

      const offerResult = await client.query(
        `
        SELECT
          offers.*,
          games.name AS game_name
        FROM offers
        LEFT JOIN games
          ON offers.game_id = games.id
        WHERE offers.id = $1
        `,
        [offer_id]
      );

      const offer = offerResult.rows[0];

      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          game_id,
          offer_id,
          game_name,
          offer_name,
          amount,
          quantity,
          unit_price,
          total_price
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, 1, $7, $8
        )
        `,
        [
          order.id,
          game_id,
          offer_id,
          offer?.game_name ?? null,
          offer?.name ?? null,
          amount ?? offer?.amount ?? null,
          total,
          total
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      ok: true,
      message: "Pedido creado correctamente",
      order
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error creando pedido"
    });

  } finally {
    client.release();
  }
});


// Actualizar estado del pedido
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const {
      order_status,
      payment_status
    } = req.body;

    if (!order_status && !payment_status) {
      return res.status(400).json({
        ok: false,
        error: "Debes enviar order_status o payment_status"
      });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET
        order_status = COALESCE($1, order_status),
        payment_status = COALESCE($2, payment_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [
        order_status ?? null,
        payment_status ?? null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Pedido no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Estado del pedido actualizado",
      order: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error actualizando estado del pedido"
    });
  }
});


// ==========================================
// PAGOS
// ==========================================

app.get("/api/payments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        payments.*,
        orders.order_number
      FROM payments
      LEFT JOIN orders
        ON payments.order_id = orders.id
      ORDER BY payments.id DESC
    `);

    res.json({
      ok: true,
      payments: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo pagos"
    });
  }
});


app.post("/api/payments", async (req, res) => {
  try {
    const {
      order_id,
      method,
      currency,
      amount,
      status,
      transaction_id,
      external_reference,
      proof_url,
      payer_phone
    } = req.body;

    if (!order_id || !method || amount === undefined) {
      return res.status(400).json({
        ok: false,
        error: "order_id, method y amount son obligatorios"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO payments (
        order_id,
        method,
        currency,
        amount,
        status,
        transaction_id,
        external_reference,
        proof_url,
        payer_phone
      )
      VALUES (
        $1, $2, $3, $4, COALESCE($5, 'pending'),
        $6, $7, $8, $9
      )
      RETURNING *
      `,
      [
        order_id,
        method,
        currency ?? null,
        amount,
        status ?? null,
        transaction_id ?? null,
        external_reference ?? null,
        proof_url ?? null,
        payer_phone ?? null
      ]
    );

    res.status(201).json({
      ok: true,
      payment: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error creando pago"
    });
  }
});


// Actualizar pago
app.put("/api/payments/:id/status", async (req, res) => {
  try {
    const {
      status,
      transaction_id,
      external_reference
    } = req.body;

    const confirmedAt =
      status === "confirmed" ||
      status === "paid"
        ? new Date()
        : null;

    const result = await pool.query(
      `
      UPDATE payments
      SET
        status = COALESCE($1, status),
        transaction_id = COALESCE($2, transaction_id),
        external_reference = COALESCE($3, external_reference),
        confirmed_at = COALESCE($4, confirmed_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        status ?? null,
        transaction_id ?? null,
        external_reference ?? null,
        confirmedAt,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Pago no encontrado"
      });
    }

    res.json({
      ok: true,
      payment: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error actualizando pago"
    });
  }
});


// ==========================================
// RECARGAS / TOPUPS
// ==========================================

app.get("/api/topups", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        topups.*,
        orders.order_number,
        games.name AS game_name
      FROM topups
      LEFT JOIN orders
        ON topups.order_id = orders.id
      LEFT JOIN games
        ON topups.game_id = games.id
      ORDER BY topups.id DESC
    `);

    res.json({
      ok: true,
      topups: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error obteniendo recargas"
    });
  }
});


app.post("/api/topups", async (req, res) => {
  try {
    const {
      order_id,
      game_id,
      player_id,
      amount,
      provider,
      provider_order_id,
      status,
      response_data
    } = req.body;

    if (!order_id || !game_id || !player_id || !amount) {
      return res.status(400).json({
        ok: false,
        error: "order_id, game_id, player_id y amount son obligatorios"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO topups (
        order_id,
        game_id,
        player_id,
        amount,
        provider,
        provider_order_id,
        status,
        response_data
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        COALESCE($7, 'pending'),
        $8
      )
      RETURNING *
      `,
      [
        order_id,
        game_id,
        player_id,
        amount,
        provider ?? null,
        provider_order_id ?? null,
        status ?? null,
        response_data ?? null
      ]
    );

    res.status(201).json({
      ok: true,
      topup: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error creando recarga"
    });
  }
});


// Actualizar recarga
app.put("/api/topups/:id/status", async (req, res) => {
  try {
    const {
      status,
      provider_order_id,
      response_data
    } = req.body;

    const completedAt =
      status === "completed"
        ? new Date()
        : null;

    const result = await pool.query(
      `
      UPDATE topups
      SET
        status = COALESCE($1, status),
        provider_order_id = COALESCE($2, provider_order_id),
        response_data = COALESCE($3, response_data),
        completed_at = COALESCE($4, completed_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        status ?? null,
        provider_order_id ?? null,
        response_data ?? null,
        completedAt,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Recarga no encontrada"
      });
    }

    res.json({
      ok: true,
      topup: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error actualizando recarga"
    });
  }
});


// ==========================================
// MANEJO DE ERRORES
// ==========================================

app.use((error, req, res, next) => {
  console.error("Error del servidor:", error);

  res.status(500).json({
    ok: false,
    error: error.message || "Error interno del servidor"
  });
});


// ==========================================
// INICIAR SERVIDOR
// ==========================================

async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `REFILLS SHOP Backend iniciado en puerto ${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "No se pudo iniciar el servidor:",
      error
    );

    process.exit(1);
  }
}

startServer();
