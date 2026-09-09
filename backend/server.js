const express = require("express");

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`REFILLS SHOP Backend iniciado en puerto ${PORT}`);
});
