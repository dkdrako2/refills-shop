const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  try {
    await pool.query(`
      -- ==========================================
      -- CATEGORÍAS
      -- ==========================================

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- JUEGOS
      -- ==========================================

      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        image_url TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- OFERTAS
      -- ==========================================

      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        amount VARCHAR(100),
        price_sm DECIMAL(12,2),
        price_cup DECIMAL(12,2),
        price_usdt DECIMAL(12,2),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- CLIENTES
      -- ==========================================

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        password_hash TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- PEDIDOS
      -- ==========================================

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,

        order_number VARCHAR(50) UNIQUE NOT NULL,

        customer_id INTEGER
          REFERENCES customers(id)
          ON DELETE SET NULL,

        game_id INTEGER
          REFERENCES games(id)
          ON DELETE SET NULL,

        offer_id INTEGER
          REFERENCES offers(id)
          ON DELETE SET NULL,

        player_id VARCHAR(150),

        player_name VARCHAR(150),

        amount VARCHAR(100),

        payment_method VARCHAR(50),

        currency VARCHAR(20) DEFAULT 'USDT',

        subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,

        total DECIMAL(12,2) NOT NULL DEFAULT 0,

        payment_status VARCHAR(30)
          DEFAULT 'pending',

        order_status VARCHAR(30)
          DEFAULT 'pending',

        payment_reference VARCHAR(255),

        topup_reference VARCHAR(255),

        notes TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- ÍTEMS DEL PEDIDO
      -- ==========================================

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,

        order_id INTEGER NOT NULL
          REFERENCES orders(id)
          ON DELETE CASCADE,

        game_id INTEGER
          REFERENCES games(id)
          ON DELETE SET NULL,

        offer_id INTEGER
          REFERENCES offers(id)
          ON DELETE SET NULL,

        game_name VARCHAR(100),

        offer_name VARCHAR(150),

        amount VARCHAR(100),

        quantity INTEGER DEFAULT 1,

        unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,

        total_price DECIMAL(12,2) NOT NULL DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- PAGOS
      -- ==========================================

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,

        order_id INTEGER NOT NULL
          REFERENCES orders(id)
          ON DELETE CASCADE,

        method VARCHAR(50) NOT NULL,

        currency VARCHAR(20),

        amount DECIMAL(12,2) NOT NULL DEFAULT 0,

        status VARCHAR(30)
          DEFAULT 'pending',

        transaction_id VARCHAR(255),

        external_reference VARCHAR(255),

        proof_url TEXT,

        payer_phone VARCHAR(50),

        confirmed_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- RECARGAS
      -- ==========================================

      CREATE TABLE IF NOT EXISTS topups (
        id SERIAL PRIMARY KEY,

        order_id INTEGER NOT NULL
          REFERENCES orders(id)
          ON DELETE CASCADE,

        game_id INTEGER
          REFERENCES games(id)
          ON DELETE SET NULL,

        player_id VARCHAR(150),

        amount VARCHAR(100),

        provider VARCHAR(100),

        provider_order_id VARCHAR(255),

        status VARCHAR(30)
          DEFAULT 'pending',

        response_data JSONB,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        completed_at TIMESTAMP
      );

      -- ==========================================
      -- ÍNDICES
      -- ==========================================

      CREATE INDEX IF NOT EXISTS idx_games_category
        ON games(category_id);

      CREATE INDEX IF NOT EXISTS idx_offers_game
        ON offers(game_id);

      CREATE INDEX IF NOT EXISTS idx_orders_customer
        ON orders(customer_id);

      CREATE INDEX IF NOT EXISTS idx_orders_status
        ON orders(order_status);

      CREATE INDEX IF NOT EXISTS idx_orders_payment_status
        ON orders(payment_status);

      CREATE INDEX IF NOT EXISTS idx_orders_created_at
        ON orders(created_at);

      CREATE INDEX IF NOT EXISTS idx_payments_order
        ON payments(order_id);

      CREATE INDEX IF NOT EXISTS idx_payments_status
        ON payments(status);

      CREATE INDEX IF NOT EXISTS idx_topups_order
        ON topups(order_id);

      CREATE INDEX IF NOT EXISTS idx_topups_status
        ON topups(status);
    `);

    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error(
      "Error inicializando la base de datos:",
      error
    );

    throw error;
  }
}

module.exports = {
  pool,
  initDatabase
};
