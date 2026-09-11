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
