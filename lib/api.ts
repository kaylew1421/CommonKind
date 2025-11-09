// lib/api.ts
const RAW = (import.meta as any).env?.VITE_API_BASE_URL || "";
// normalize, and ensure exactly one trailing /api
const ROOT = RAW.replace(/\/+$/,"");
const API = ROOT.endsWith("/api") ? ROOT : (ROOT ? `${ROOT}/api` : "/api");

function toJson(resp: Response) {
  if (!resp.ok) throw new Error(`${resp.status}`);
  return resp.json();
}

export async function fetchHubs() {
  const r = await fetch(`${API}/hubs`, { credentials: "omit" });
  return toJson(r);
}

export async function issueVoucher(hubId: string) {
  const r = await fetch(`${API}/voucher/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hubId }),
  });
  return toJson(r);
}

// --- Admin auth ---
export async function adminLogin(password: string) {
  const r = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: (password || "").trim() }),
  });
  return toJson(r); // { ok:true, token }
}

export async function adminMe(token?: string) {
  const r = await fetch(`${API}/admin/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return toJson(r);
}

export { API }; // handy for debugging
