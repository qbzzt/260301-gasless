import express from "express";
import { createServer as createViteServer } from "vite";

const start = async () => {
  const app = express()

  app.use(express.json())

  app.post("/server/sponsor", (req, res) => {
    console.log("Received:", req.body)
    res.json({ ok: true })
  })

  // Let Vite handle everything else
  const vite = await createViteServer({
    server: { middlewareMode: true }
  })

  app.use(vite.middlewares)

  app.listen(5173, () => {
    console.log("Dev server running on http://localhost:5173");
  })
}

start()

