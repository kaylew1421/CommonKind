import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// data
const DATA_PATH = path.join(process.cwd(), "data", "hubs.json");
let hubs = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
const vouchers = new Map(); // id -> { hubId, expiresAt, status }

// friendly root + health
app.get("/", (_req, res) => {
  res.type("text").send("CommonKind API is running. Try /api/healthz or /api/hubs");
});
app.get("/api/healthz", (_req, res) => res.send("ok"));

// hubs
app.get("/api/hubs", (_req, res) => res.json(hubs));

// issue voucher
app.post("/api/voucher/issue", (req, res) => {
  const { hubId } = req.body || {};
  const hub = hubs.find(h => h.id === hubId);
  if (!hub) return res.status(404).json({ error: "Hub not found" });
  if ((hub.vouchersRemaining ?? 0) <= 0) return res.status(400).json({ error: "No vouchers remaining" });

  const id = "V-" + nanoid(8);
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2h
  vouchers.set(id, { hubId, expiresAt, status: "issued" });
  res.json({ id, hubId, expiresAt });
});

// redeem voucher
app.post("/api/voucher/redeem", (req, res) => {
  const { id } = req.body || {};
  const v = vouchers.get(id);
  if (!v) return res.status(404).json({ ok: false, error: "Voucher not found" });
  if (v.status === "redeemed") return res.json({ ok: true, already: true });

  hubs = hubs.map(h =>
    h.id === v.hubId ? { ...h, vouchersRemaining: Math.max(0, (h.vouchersRemaining ?? 0) - 1) } : h
  );
  v.status = "redeemed";
  vouchers.set(id, v);
  res.json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
