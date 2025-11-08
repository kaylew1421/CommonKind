// lib/api.ts  (frontend)
import { MOCK_HUBS } from '../constants';
const BASE = import.meta.env.VITE_API_BASE_URL; // e.g., https://.../api

export async function fetchHubs() {
  try {
    const r = await fetch(`${BASE}/hubs`);
    if (!r.ok) throw new Error('bad status');
    return await r.json();
  } catch {
    return MOCK_HUBS;
  }
}

export async function issueVoucher(hubId: string) {
  const r = await fetch(`${BASE}/voucher/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hubId }),
  });
  if (!r.ok) throw new Error('issue failed');
  return r.json();
}
