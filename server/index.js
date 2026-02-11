import express from "express";
import { createServer as createViteServer } from "vite";

async function start() {
  const app = express();

  // 1. Special handling for /server/*
  app.use("/server", (req, res) => {
    // your custom logic here
    res.json({ ok: true, path: req.path });
  });

  // 2. Let Vite handle everything else
  const vite = await createViteServer({
    server: { middlewareMode: true }
  });

  app.use(vite.middlewares);

  app.listen(5173, () => {
    console.log("Dev server running on http://localhost:5173");
  });
}

start();

