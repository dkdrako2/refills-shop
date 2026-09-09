const { pool } = require("./database");

const catalog = [
  {
    name: "Battle Royale",
    slug: "battle-royale",
    games: [
      {
        name: "Free Fire",
        slug: "freefire",
        image_url: "https://play-lh.googleusercontent.com/JT88XmsHoGDio7FxONwh382DhuTxuccfMmWFDtRBFjilySzNqWOCxUhqm8IhBKzQSwVrW2HWp_XvSgKFwi3ETA=s512",
        offers: [
          ["100 Diamantes", "100", 1.10],
          ["310 Diamantes", "310", 3.20],
          ["520 Diamantes", "520", 5.30],
          ["1080 Diamantes", "1080", 10.50],
          ["2200 Diamantes", "2200", 20.90],
          ["5600 Diamantes", "5600", 49.90]
        ]
      },
      {
        name: "Blood Strike",
        slug: "bloodstrike",
        image_url: "https://play-lh.googleusercontent.com/2u_SRoZ-5g7nqNz4NyFpBvWMg5oEu43MmBmz3m20Rf_wAkOmIV0dOuzblA6GAlUIwjLIOMrKQrpGHMp1JxMyZg=s512",
        offers: [
          ["60 Oro", "60", 0.95],
          ["300 Oro", "300", 4.60],
          ["680 Oro", "680", 8.90],
          ["1800 Oro", "1800", 22.90],
          ["3600 Oro", "3600", 44.90]
        ]
      },
      {
        name: "PUBG Mobile",
        slug: "pubgm",
        image_url: "https://play-lh.googleusercontent.com/yqVgz686uMJ1hwxEBW9D0ym-QLpVZ2JEJphcRm7Dz7NdXma0gRLtK5roTLbEz2LfFQk=s512",
        offers: [
          ["60 UC", "60", 0.95],
          ["325 UC", "325", 4.60],
          ["660 UC", "660", 8.90],
          ["1800 UC", "1800", 22.90],
          ["3850 UC", "3850", 46.90],
          ["8100 UC", "8100", 92.90]
        ]
      },
      {
        name: "Fortnite",
        slug: "fortnite",
        image_url: "https://play-lh.googleusercontent.com/nUzo52s5UVOrwyLCfFXM0PKgInAaLaYe-hrUedFAT3gMbhKBn0HlvnFai7Ao5GTEB51IvWtIC3szG2O-wxAPIA=w512",
        offers: [
          ["1000 Pavos", "1000", 8.90],
          ["2800 Pavos", "2800", 22.90],
          ["5000 Pavos", "5000", 39.90],
          ["13500 Pavos", "13500", 99.90]
        ]
      }
    ]
  },
  {
    name: "MOBA",
    slug: "moba",
    games: [
      {
        name: "Mobile Legends",
        slug: "mlbb",
        image_url: "https://play-lh.googleusercontent.com/YrLxu4GfSsZk9hPcAxx7kARnV9tc5Xyn7Am4cZcfqEsBC4fWK02woGxoa2a9L978LpYaxDjcL0YfphUUpEk3Z2c=s512",
        offers: [
          ["86 Diamantes", "86", 1.90],
          ["172 Diamantes", "172", 3.70],
          ["257 Diamantes", "257", 5.50],
          ["706 Diamantes", "706", 13.90],
          ["2195 Diamantes", "2195", 41.90]
        ]
      },
      {
        name: "Brawl Stars",
        slug: "brawlstars",
        image_url: "https://play-lh.googleusercontent.com/bUg34NePWclty0hnX2bGZVPCsjsC-6VyQ4fHW9vpNFqSKAYRfa4fICuVWb4awKpsoT0=s512",
        offers: [
          ["Gemas", "Gemas", 1.99],
          ["Gemas + bonus", "Gemas + bonus", 4.99]
        ]
      }
    ]
  },
  {
    name: "Shooter",
    slug: "shooter",
    games: [
      {
        name: "Call of Duty M.",
        slug: "codm",
        image_url: "https://play-lh.googleusercontent.com/-AvmNiTlr1c570od0xu-XE0aTYKVN0-4-5XKCufEzFsd41V-terFxxLqwpFn-q2h8aGNbjIZDLVmGOfh0GRKW=s512",
        offers: [
          ["80 CP", "80", 0.99],
          ["420 CP", "420", 4.90],
          ["880 CP", "880", 9.90],
          ["2400 CP", "2400", 24.90],
          ["5000 CP", "5000", 49.90]
        ]
      },
      {
        name: "Valorant",
        slug: "valorant",
        image_url: "https://play-lh.googleusercontent.com/hrpZdffP0Mt4nSZnr6FUk0OyeEm_GyXZ3TxCoQb7cSFoNOeF0KGEQoXgSR-PKqk1rlOyImJFvIPvZyXuoG3eXA=s512",
        offers: [
          ["475 VP", "475", 4.90],
          ["1000 VP", "1000", 9.90],
          ["2050 VP", "2050", 19.90],
          ["3650 VP", "3650", 34.90]
        ]
      }
    ]
  },
  {
    name: "Mundo abierto",
    slug: "mundo-abierto",
    games: [
      {
        name: "Genshin Impact",
        slug: "genshin",
        image_url: "https://play-lh.googleusercontent.com/YQqyKaXX-63krqsfIzUEJWUWLINxcb5tbS6QVySdxbS7eZV7YB2dUjUvX27xA0TIGtfxQ5v-tQjwlT5tTB-O=w512",
        offers: [
          ["60 Cristales", "60", 1.05],
          ["330 Cristales", "330", 5.10],
          ["1090 Cristales", "1090", 15.90],
          ["2240 Cristales", "2240", 31.90],
          ["3880 Cristales", "3880", 53.90]
        ]
      },
      {
        name: "Minecraft",
        slug: "minecraft",
        image_url: "https://play-lh.googleusercontent.com/VSwHQjcAttxsLE47RuS4PqpC4LT7lCoSjE7Hx5AW_yCxtDvcnsHHvm5CTuL5BPN-uRTP=s512",
        offers: [
          ["Minecoins", "Minecoins", 2.99],
          ["Minecoins + bonus", "Minecoins + bonus", 9.99]
        ]
      }
    ]
  },
  {
    name: "Plataforma",
    slug: "plataforma",
    games: [
      {
        name: "Roblox",
        slug: "roblox",
        image_url: "https://play-lh.googleusercontent.com/WNWZaxi9RdJKe2GQM3vqXIAkk69mnIl4Cc8EyZcir2SKlVOxeUv9tZGfNTmNaLC717Ht=s512",
        offers: [
          ["400 Robux", "400", 4.90],
          ["800 Robux", "800", 9.50],
          ["1700 Robux", "1700", 19.90],
          ["4500 Robux", "4500", 49.90]
        ]
      }
    ]
  },
  {
    name: "Estrategia",
    slug: "estrategia",
    games: [
      {
        name: "Clash of Clans",
        slug: "clashofclans",
        image_url: "https://play-lh.googleusercontent.com/2u_SRoZ-5g7nqNz4NyFpBvWMg5oEu43MmBmz3m20Rf_wAkOmIV0dOuzblA6GAlUIwjLIOMrKQrpGHMp1JxMyZg=s512",
        offers: [
          ["Gemas", "Gemas", 1.99],
          ["Gemas + bonus", "Gemas + bonus", 9.99]
        ]
      }
    ]
  },
  {
    name: "Deportes",
    slug: "deportes",
    games: [
      {
        name: "EA SPORTS FC Mobile",
        slug: "eafc",
        image_url: "https://play-lh.googleusercontent.com/NZSpkf61ArRqT74tFouayhq0BlfrT62RkPtHjGSchlaJFodpaF9gx43X5mWkLkPHBSp5Z9PLtr9ez-GxNeocFg=s512",
        offers: [
          ["Puntos FC", "Puntos FC", 1.99],
          ["Puntos FC + bonus", "Puntos FC + bonus", 9.99]
        ]
      }
    ]
  }
];

async function seed() {
  try {
    console.log("Iniciando carga del catálogo...");

    for (const category of catalog) {
      const categoryResult = await pool.query(
        `
        INSERT INTO categories (name, slug)
        VALUES ($1, $2)
        ON CONFLICT (slug)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
        `,
        [category.name, category.slug]
      );

      const categoryId = categoryResult.rows[0].id;

      for (const game of category.games) {
        const gameResult = await pool.query(
          `
          INSERT INTO games (category_id, name, slug, image_url, active)
          VALUES ($1, $2, $3, $4, TRUE)
          ON CONFLICT (slug)
          DO UPDATE SET
            category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            image_url = EXCLUDED.image_url,
            active = TRUE
          RETURNING id
          `,
          [
            categoryId,
            game.name,
            game.slug,
            game.image_url
          ]
        );

        const gameId = gameResult.rows[0].id;

        for (const offer of game.offers) {
          const [name, amount, price] = offer;

          const existing = await pool.query(
            `
            SELECT id
            FROM offers
            WHERE game_id = $1
              AND name = $2
            LIMIT 1
            `,
            [gameId, name]
          );

          if (existing.rows.length) {
            await pool.query(
              `
              UPDATE offers
              SET amount = $1,
                  price_usdt = $2,
                  active = TRUE
              WHERE id = $3
              `,
              [amount, price, existing.rows[0].id]
            );
          } else {
            await pool.query(
              `
              INSERT INTO offers
              (game_id, name, amount, price_usdt, active)
              VALUES ($1, $2, $3, $4, TRUE)
              `,
              [gameId, name, amount, price]
            );
          }
        }
      }
    }

    console.log("CATÁLOGO CARGADO CORRECTAMENTE.");
    process.exit(0);

  } catch (error) {
    console.error("ERROR CARGANDO CATÁLOGO:");
    console.error(error);
    process.exit(1);
  }
}

seed();
