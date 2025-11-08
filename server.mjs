// server.mjs - serve Vite build on Cloud Run
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const dist = join(__dirname, "dist");

app.use(express.static(dist));
// SPA fallback
app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`WEB listening on ${port}`));
