// api/server.js
import express from "express";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";

/* ----------------------------- App bootstrap ----------------------------- */

const app = express();

/** CORS: reflect allowed origins; fallback to "*" (no cookies used) */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// Example env:
// ALLOWED_ORIGINS="https://ck-frontend-XXXX-uc.a.run.app,http://localhost:3000"

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Safe because we don't use cookies/credentials in browser requests
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    // include x-admin-secret for job-to-API calls
    "Content-Type, Authorization, x-admin-secret"
  );
  res.setHeader("Access-Control-Max-Age", "86400"); // 24h preflight cache
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "commonkind"; // human-facing admin login
const ADMIN_SECRET = process.env.ADMIN_SECRET || "changeme";       // machine-to-machine secret (job)
const GENAI_KEY = process.env.GENAI_API_KEY || "";
const PORT = process.env.PORT || 8080;

/* ------------------------------- Data load -------------------------------- */

const DATA_PATH = path.join(process.cwd(), "data", "hubs.json");
let hubs = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// In-memory demo stores (stateless across cold starts)
const vouchers = new Map();    // voucherId -> { hubId, expiresAt, status }
const adminTokens = new Map(); // token -> { issuedAt, expiresAt }

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

const requireAdmin = (req, _res, next) => {
  const auth = req.get("authorization") || "";
  const [, token] = auth.split(" "); // "Bearer <token>"
  if (!token || !tokenIsValid(token)) {
    return _res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
};

// Guard for **backend-only** routes (used by Cloud Run Job)
function requireAdminSecret(req, res, next) {
  const hdr = req.header("x-admin-secret");
  if (!hdr || hdr !== ADMIN_SECRET) {
    return res.status(401).type("text").send("Unauthorized");
  }
  next();
}

/* -------------------------------- Health --------------------------------- */

// Friendly root so / doesn't 404 in Cloud Run
app.get("/", (_req, res) => res.type("text").send("CommonKind API"));

// Health under /api/* (use this one in tests/monitors)
app.get("/api/healthz", (_req, res) => res.type("text").send("ok"));

// Keep legacy path too (optional)
app.get("/healthz", (_req, res) => res.type("text").send("ok"));

/* --------------------------------- Hubs ---------------------------------- */

app.get("/api/hubs", (_req, res) => {
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
  adminTokens.set(token, { issuedAt: now, expiresAt: now + 24 * 60 * 60 * 1000 }); // 24h
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

// **Backend-only** reset endpoint for Cloud Run Job
app.post("/api/admin/reset", requireAdminSecret, (_req, res) => {
  try {
    // restore each hub to its dailyCap (fallback to current vouchersRemaining)
    hubs.forEach((h) => {
      const cap = Number.isFinite(Number(h.dailyCap))
        ? Number(h.dailyCap)
        : (h.vouchersRemaining ?? 0);
      h.vouchersRemaining = Math.max(0, cap);
    });

    // clear all issued vouchers in the in-memory store
    if (typeof vouchers.clear === "function") vouchers.clear();

    res.type("text").send("Demo data reset complete");
  } catch (e) {
    console.error("reset error", e);
    res.status(500).type("text").send("Reset failed");
  }
});

/* --------------------------------- AI chat ------------------------------- */
/** We use the CURRENT model: gemini-2.5-flash (v1beta). */
const GEMINI_MODEL_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// simple fetch with timeout so the UI isn't stuck forever
async function fetchWithTimeout(url, opts = {}, ms = 12000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    return r;
  } finally {
    clearTimeout(id);
  }
}

app.post("/api/ai", async (req, res) => {
  try {
    const { question = "", locale = "en", hubs: hubsOverride } = req.body || {};
    const hubContext = (hubsOverride || hubs)
      .map(
        (h) =>
          `- ${h.name} (${h.type}) @ ${h.address} | offer: ${h.offer} | hours: ${h.hours}`
      )
      .join("\n");

    const prompt = `
You are CommonKind helper. Answer briefly (≤70 words), plain language.
If user asks in Spanish, respond in Spanish. Be local and specific.
Context (Hubs):
${hubContext}

User: ${question}
`.trim();

    // If no key, return a useful canned answer for local demo
    if (!GENAI_KEY) {
      const canned =
        locale === "es"
          ? "CommonKind ofrece vales QR de comida de un solo uso. Centro cercano: Alvarado Community Diner (11–3 diario). Muestre el QR en el mostrador; una comida por persona, o use un vale familiar si aplica."
          : "CommonKind issues single-use QR meal vouchers. Nearby hub: Alvarado Community Diner (11–3 daily). Show the QR at the counter; one meal per person, or use a family voucher if noted.";
      return res.json({ ok: true, answer: canned, mock: true });
    }

    // bump timeout to 28s for more reliable generation
    const r = await fetchWithTimeout(
      GEMINI_MODEL_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GENAI_KEY, // recommended header form
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      },
      28000
    );

    if (!r.ok) {
      // Surface upstream error details in logs, but return graceful fallback
      const txt = await r.text().catch(() => "");
      console.warn("AI upstream error", r.status, txt.slice(0, 300));
      const canned =
        locale === "es"
          ? "CommonKind ofrece vales de comida de un solo uso. Consulta el mapa para ver centros cercanos y horarios."
          : "CommonKind issues single-use meal vouchers. Check the map for nearby hubs and hours.";
      return res.status(200).json({
        ok: true,
        answer: canned,
        mock: true,
        note: `fallback: upstream ${r.status}`,
      });
    }

    const data = await r.json();
    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => (typeof p.text === "string" ? p.text : ""))
        .join("") ||
      (locale === "es"
        ? "No pude generar una respuesta."
        : "Sorry, I couldn’t generate an answer.");

    res.json({ ok: true, answer });
  } catch (e) {
    const msg = String(e?.message || e);
    const isAbort = /AbortError|aborted/i.test(msg);
    console.error("AI error", msg);
    const canned =
      (req.body?.locale === "es")
        ? "CommonKind ofrece vales QR de comida; consulta el mapa para ver centros cercanos y horarios."
        : "CommonKind issues single-use QR meal vouchers; check the map for nearby hubs and hours.";
    // graceful fallback instead of 500
    return res.status(200).json({
      ok: true,
      answer: canned,
      mock: true,
      note: isAbort ? "fallback: timeout" : "fallback: exception",
    });
  }
});

/* ------------------------------- Start app ------------------------------- */

app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});
