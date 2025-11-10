// lib/api.ts
const RAW = (import.meta as any).env?.VITE_API_BASE_URL || "";
const ROOT = (RAW || "").replace(/\/+$/, "");
// If ROOT already ends with /api, use it as-is; otherwise append /api; if blank, we’re in a proxy/dev setup
const API = ROOT ? (ROOT.endsWith("/api") ? ROOT : `${ROOT}/api`) : "/api";

function toJson(resp: Response) {
  if (!resp.ok) throw new Error(String(resp.status));
  return resp.json();
}

/* -------------------------- Public endpoints -------------------------- */
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
  return toJson(r); // { id, hubId, expiresAt }
}

export async function redeemVoucher(id: string) {
  const r = await fetch(`${API}/voucher/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return toJson(r); // { ok:true }
}

/* ----------------------------- Admin auth ----------------------------- */
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
  return toJson(r); // { ok:true, role:"admin" }
}

/* ----------------------------- Gemini chat ---------------------------- */
export async function askAi(question: string, hubs: any[], locale = "en") {
  const r = await fetch(`${API}/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, hubs, locale }),
  });
  return toJson(r); // { answer, mock? }
}

export { API };
