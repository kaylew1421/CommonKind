// frontend/components/AdminDashboard.tsx
import React, { useMemo, useState } from 'react';
import type { Hub, HubApplication, ActivityEvent } from '../types';

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
function timeAgo(ms: number) {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

type Metrics = {
  totalDonations: number;
  activeHubs: number;
  pendingApprovals: number;
  redeemed24h: number;
  // fraud removed from UI, can keep calculated in parent if you like
};

type Props = {
  hubs: Hub[];
  applications: HubApplication[];
  activity: ActivityEvent[];
  metrics: Metrics;

  onApprove: (id: string, hubType: Hub['type']) => void;
  onReject: (id: string) => void;

  // NEW CRUD for hubs
  onCreateHub: (input: Omit<Hub, 'id'>) => void;
  onUpdateHub: (id: string, updates: Partial<Hub>) => void;
  onDeleteHub: (id: string) => void;

  onBackToMap: () => void;
};

/* ---------- Small modal form for Add/Edit ---------- */
function HubFormModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<Hub>;
  onClose: () => void;
  onSave: (values: Omit<Hub, 'id'>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [hours, setHours] = useState(initial?.hours ?? 'TBD');
  const [offer, setOffer] = useState(initial?.offer ?? '');
  const [type, setType] = useState<Hub['type']>(initial?.type ?? 'Restaurant');
  const [lat, setLat] = useState(String(initial?.lat ?? 32.4057));
  const [lng, setLng] = useState(String(initial?.lng ?? -97.2136));
  const [cap, setCap] = useState(String(initial?.dailyCap ?? 20));
  const [remaining, setRemaining] = useState(String(initial?.vouchersRemaining ?? (Number(cap) || 20)));
  const [reqText, setReqText] = useState(
    Array.isArray(initial?.requirements) ? (initial!.requirements as any[])
      .map(r => typeof r === 'string' ? r : r.label).join('\n') : ''
  );

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      address,
      phone,
      hours,
      offer,
      type,
      lat: Number(lat),
      lng: Number(lng),
      dailyCap: Number(cap),
      vouchersRemaining: Number(remaining),
      requirements: reqText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      selfAttestation: true,
      id: '' as any // ignored by parent
    } as Omit<Hub, 'id'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="font-semibold">{initial?.id ? 'Edit Hub' : 'Add Hub'}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={name} onChange={e=>setName(e.target.value)} required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={address} onChange={e=>setAddress(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hours</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={hours} onChange={e=>setHours(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Offer</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={offer} onChange={e=>setOffer(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={type} onChange={e=>setType(e.target.value as Hub['type'])}>
              <option>Restaurant</option>
              <option>Grocery</option>
              <option>Church</option>
              <option>Library</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Cap</label>
            <input type="number" min={0} className="mt-1 w-full border rounded-lg px-3 py-2" value={cap} onChange={e=>setCap(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vouchers Remaining</label>
            <input type="number" min={0} className="mt-1 w-full border rounded-lg px-3 py-2" value={remaining} onChange={e=>setRemaining(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={lat} onChange={e=>setLat(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={lng} onChange={e=>setLng(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Requirements (one per line)</label>
            <textarea rows={4} className="mt-1 w-full border rounded-lg px-3 py-2" value={reqText} onChange={e=>setReqText(e.target.value)} />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border">Cancel</button>
            <button type="submit" className="px-3 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700">
              Save Hub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
export default function AdminDashboard({
  hubs,
  applications,
  activity,
  metrics,
  onApprove,
  onReject,
  onCreateHub,
  onUpdateHub,
  onDeleteHub,
  onBackToMap,
}: Props) {
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [typeChoice, setTypeChoice] = useState<Hub['type']>('Restaurant');

  const [isFormOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Hub | null>(null);

  const pendingApps = useMemo(
    () => applications.filter(a => a.status === 'pending'),
    [applications]
  );
  const reviewing = reviewId ? applications.find(a => a.id === reviewId) ?? null : null;

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (hub: Hub) => { setEditing(hub); setFormOpen(true); };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={onBackToMap} className="text-teal-700 font-medium hover:underline">← Back to Map</button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-sm text-gray-500">Total Donations</div>
          <div className="text-3xl font-extrabold mt-1">{money(metrics.totalDonations)}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-sm text-gray-500">Active Hubs</div>
          <div className="text-3xl font-extrabold mt-1">{metrics.activeHubs}</div>
          <div className="text-xs text-gray-600 mt-1">{metrics.pendingApprovals} pending approval</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-sm text-gray-500">Vouchers Redeemed (24h)</div>
          <div className="text-3xl font-extrabold mt-1">{metrics.redeemed24h}</div>
        </div>
      </div>

      {/* Pending Applications + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-2xl">
          <div className="p-4 border-b font-semibold">Pending Hub Applications</div>
          <div className="divide-y">
            {pendingApps.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No pending applications.</div>
            )}
            {pendingApps.map(a => (
              <div key={a.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{a.businessName}</div>
                  <div className="text-sm text-gray-600">{a.address}</div>
                </div>
                <button
                  onClick={() => { setReviewId(a.id); setTypeChoice('Restaurant'); }}
                  className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-2xl">
          <div className="p-4 border-b font-semibold">Recent Activity</div>
          <ul className="divide-y">
            {activity.slice(0, 8).map(ev => (
              <li key={ev.id} className="p-4 text-sm">
                <div className="text-gray-800">{ev.message}</div>
                <div className="text-xs text-gray-500">{timeAgo(ev.createdAt)}</div>
              </li>
            ))}
            {activity.length === 0 && <li className="p-4 text-sm text-gray-500">No recent activity.</li>}
          </ul>
        </div>
      </div>

      {/* ----- REPLACEMENT PANEL: Manage Hubs (CRUD) ----- */}
      <div className="bg-white border rounded-2xl">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Manage Hubs</div>
          <button
            onClick={openCreate}
            className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700"
          >
            + Add Hub
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Cap</th>
                <th className="text-left p-3">Remaining</th>
                <th className="text-left p-3">Address</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hubs.map(h => (
                <tr key={h.id}>
                  <td className="p-3 font-medium">{h.name}</td>
                  <td className="p-3">{h.type}</td>
                  <td className="p-3">{h.dailyCap}</td>
                  <td className="p-3">{h.vouchersRemaining}</td>
                  <td className="p-3">{h.address}</td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => openEdit(h)} className="px-2 py-1 rounded border hover:bg-gray-50">Edit</button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${h.name}"? This cannot be undone.`)) onDeleteHub(h.id);
                      }}
                      className="px-2 py-1 rounded border text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {hubs.length === 0 && (
                <tr><td className="p-4 text-sm text-gray-500" colSpan={6}>No hubs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review modal for Applications */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="font-semibold">Review Application</div>
              <button onClick={() => setReviewId(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <div><span className="font-semibold">Business:</span> {reviewing.businessName}</div>
              <div><span className="font-semibold">Address:</span> {reviewing.address}</div>
              <div><span className="font-semibold">Phone:</span> {reviewing.phone}</div>
              <div><span className="font-semibold">Offer:</span> {reviewing.offer}</div>
              <div><span className="font-semibold">Daily Cap:</span> {reviewing.dailyCap}</div>
              <div><span className="font-semibold">Email:</span> {reviewing.email}</div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700">Hub Type</label>
                <select className="mt-1 border rounded-md px-2 py-1"
                        value={typeChoice}
                        onChange={(e) => setTypeChoice(e.target.value as Hub['type'])}>
                  <option>Restaurant</option>
                  <option>Grocery</option>
                  <option>Church</option>
                  <option>Library</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t flex items-center justify-end gap-2">
              <button onClick={() => setReviewId(null)} className="px-3 py-2 rounded-lg border">Cancel</button>
              <button onClick={() => { onReject(reviewing.id); setReviewId(null); }} className="px-3 py-2 rounded-lg border hover:bg-gray-50">Reject</button>
              <button onClick={() => { onApprove(reviewing.id, typeChoice); setReviewId(null); }}
                      className="px-3 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700">
                Approve → Add Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <HubFormModal
        open={isFormOpen}
        initial={editing ?? undefined}
        onClose={() => setFormOpen(false)}
        onSave={(values) => {
          if (editing) onUpdateHub(editing.id, values);
          else onCreateHub(values);
        }}
      />
    </div>
  );
}
