// Node 18+ has global fetch
const API_BASE = process.env.API_BASE;         // e.g., https://commonkind-api-XXXX-uc.a.run.app
const ADMIN_SECRET = process.env.ADMIN_SECRET; // same value set on API

if (!API_BASE || !ADMIN_SECRET) {
  console.error("Missing API_BASE or ADMIN_SECRET");
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/reset`, {
      method: "POST",
      headers: { "x-admin-secret": ADMIN_SECRET }
    });
    const text = await res.text();
    console.log("Reset response:", res.status, text);
    if (!res.ok) process.exit(2);
  } catch (err) {
    console.error("Reset failed:", err);
    process.exit(3);
  }
})();
