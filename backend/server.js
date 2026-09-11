const crypto = require("crypto");

const SESSION_DAYS = 30;

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function hashSessionToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");

    crypto.scrypt(
      password,
      salt,
      64,
      {
        N: 16384,
        r: 8,
        p: 1
      },
      (error, derivedKey) => {
        if (error) {
          return reject(error);
        }

        resolve(
          `scrypt:${salt}:${derivedKey.toString("hex")}`
        );
      }
    );
  });
}

function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    try {
      const parts = String(storedHash).split(":");

      if (parts.length !== 3) {
        return resolve(false);
      }

      const algorithm = parts[0];
      const salt = parts[1];
      const storedKey = Buffer.from(parts[2], "hex");

      if (algorithm !== "scrypt") {
        return resolve(false);
      }

      crypto.scrypt(
        password,
        salt,
        64,
        {
          N: 16384,
          r: 8,
          p: 1
        },
        (error, derivedKey) => {
          if (error) {
            return reject(error);
          }

          if (derivedKey.length !== storedKey.length) {
            return resolve(false);
          }

          resolve(
            crypto.timingSafeEqual(
              derivedKey,
              storedKey
            )
          );
        }
      );

    } catch (error) {
      reject(error);
    }
  });
}
// ==========================================
// AUTENTICACIÓN
// ==========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = String(phone || "").trim();
    const cleanPassword = String(password || "");

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPassword
    ) {
      return res.status(400).json({
        ok: false,
        error: "Nombre, correo y contraseña son obligatorios"
      });
    }

    if (cleanPassword.length < 8) {
      return res.status(400).json({
        ok: false,
        error: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM customers
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "Ya existe una cuenta con ese correo"
      });
    }

    const passwordHash =
      await hashPassword(cleanPassword);

    const result = await pool.query(
      `
      INSERT INTO customers (
        name,
        email,
        phone,
        password_hash,
        active
      )
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING
        id,
        name,
        email,
        phone,
        active,
        created_at,
        updated_at
      `,
      [
        cleanName,
        cleanEmail,
        cleanPhone || null,
        passwordHash
      ]
    );

    res.status(201).json({
      ok: true,
      message: "Cuenta creada correctamente",
      customer: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error creando la cuenta"
    });
  }
});app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const cleanEmail = normalizeEmail(email);
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({
        ok: false,
        error: "Correo y contraseña son obligatorios"
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        password_hash,
        active
      FROM customers
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        error: "Correo o contraseña incorrectos"
      });
    }

    const customer = result.rows[0];

    if (!customer.active) {
      return res.status(403).json({
        ok: false,
        error: "La cuenta está desactivada"
      });
    }

    const valid = await verifyPassword(
      cleanPassword,
      customer.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        ok: false,
        error: "Correo o contraseña incorrectos"
      });
    }

    const sessionToken =
      createSessionToken();

    const sessionHash =
      hashSessionToken(sessionToken);

    await pool.query(
      `
      INSERT INTO user_sessions (
        customer_id,
        session_token_hash,
        expires_at
      )
      VALUES (
        $1,
        $2,
        CURRENT_TIMESTAMP + INTERVAL '30 days'
      )
      `,
      [
        customer.id,
        sessionHash
      ]
    );

    res.cookie(
      "__Host-refills_session",
      sessionToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000
      }
    );

    res.json({
      ok: true,
      message: "Sesión iniciada correctamente",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        active: customer.active
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error iniciando sesión"
    });
  }
});app.get("/api/auth/me", async (req, res) => {
  try {
    const token =
      req.cookies["__Host-refills_session"];

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "No hay una sesión activa"
      });
    }

    const tokenHash =
      hashSessionToken(token);

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.active
      FROM user_sessions s
      INNER JOIN customers c
        ON c.id = s.customer_id
      WHERE
        s.session_token_hash = $1
        AND s.expires_at > CURRENT_TIMESTAMP
        AND c.active = TRUE
      LIMIT 1
      `,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        error: "Sesión inválida o expirada"
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
      error: "Error comprobando sesión"
    });
  }app.post("/api/auth/logout", async (req, res) => {
  try {
    const token =
      req.cookies["__Host-refills_session"];

    if (token) {
      await pool.query(
        `
        DELETE FROM user_sessions
        WHERE session_token_hash = $1
        `,
        [hashSessionToken(token)]
      );
    }

    res.clearCookie(
      "__Host-refills_session",
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/"
      }
    );

    res.json({
      ok: true,
      message: "Sesión cerrada"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Error cerrando sesión"
    });
  }
});
});
