// api/server.js
import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";

/* ----------------------------- App bootstrap ----------------------------- */

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "commonkind";
const PORT = process.env.PORT || 8080;

// Load hubs from local JSON (demo data; resets on cold start)
const DATA_PATH = path.join(process.cwd(), "data", "hubs.json");
let hubs = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// In-memory demo stores (stateless across cold starts, OK for hackathon)
const vouchers = new Map();          // voucherId -> { hubId, expiresAt, status }
const adminTokens = new Map();       // token -> { issuedAt, expiresAt }

/* ------------------------------- Utilities ------------------------------- */

const makeToken = () => `adm_${nanoid(16)}`;
const tokenIsValid = (t) => {
  const rec = adminTokens.get(t);
  if (!rec) return false;
  if (Date.now() > rec.expiresAt) {
    adminTokens.delete(t);
    return false;
  }
  return true;
};

const requireAdmin = (req, res, next) => {
  const auth = req.get("authorization") || "";
  const [, token] = auth.split(" ");
  if (!token || !tokenIsValid(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
};

/* -------------------------------- Health --------------------------------- */

app.get("/healthz", (_req, res) => res.send("ok"));

/* --------------------------------- Hubs ---------------------------------- */

app.get("/api/hubs", (_req, res) => {
  // For now just return all hubs; you can add lat/lng radius filtering later
  res.json(hubs);
});

/* ---------------------------- Voucher workflow --------------------------- */

// Issue a voucher (no decrement yet; we decrement on redeem)
app.post("/api/voucher/issue", (req, res) => {
  const { hubId } = req.body || {};
  const hub = hubs.find((h) => h.id === hubId);
  if (!hub) return res.status(404).json({ error: "Hub not found" });
  if ((hub.vouchersRemaining ?? 0) <= 0) {
    return res.status(400).json({ error: "No vouchers remaining" });
  }

  const id = `V-${nanoid(8)}`;
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  vouchers.set(id, { hubId, expiresAt, status: "issued" });

  res.json({ id, hubId, expiresAt });
});

// Redeem a voucher (decrement hub count here)
app.post("/api/voucher/redeem", (req, res) => {
  const { id } = req.body || {};
  const v = vouchers.get(id);
  if (!v) return res.status(404).json({ ok: false, error: "Voucher not found" });

  if (v.status === "redeemed") {
    return res.json({ ok: true, already: true });
  }

  hubs = hubs.map((h) =>
    h.id === v.hubId
      ? { ...h, vouchersRemaining: Math.max(0, (h.vouchersRemaining || 0) - 1) }
      : h
  );

  v.status = "redeemed";
  vouchers.set(id, v);

  res.json({ ok: true });
});

/* ------------------------------- Admin auth ------------------------------ */

// Login – returns a short-lived bearer token
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ ok: false, error: "Password required" });
  }
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Invalid password" });
  }

  const token = makeToken();
  const now = Date.now();
  adminTokens.set(token, {
    issuedAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24h
  });

  res.json({ ok: true, token });
});

// Validate token / “who am I”
app.get("/api/admin/me", requireAdmin, (_req, res) => {
  res.json({ ok: true, role: "admin" });
});

// (Optional) Example admin-only operation
app.post("/api/admin/hubs/:id/reset", requireAdmin, (req, res) => {
  const { id } = req.params;
  const hub = hubs.find((h) => h.id === id);
  if (!hub) return res.status(404).json({ ok: false, error: "Hub not found" });

  const resetTo = Number(hub.dailyCap) || 0;
  hub.vouchersRemaining = resetTo;
  res.json({ ok: true, hub });
});

/* ------------------------------- Start app ------------------------------- */

app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});
