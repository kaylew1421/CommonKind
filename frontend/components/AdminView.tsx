// frontend/components/AdminView.tsx
import React, { useMemo, useState } from 'react';
import type { HubApplication, Hub } from '../types';

type Props = {
  applications: HubApplication[];
  onApprove: (id: string, hubType: Hub['type']) => void;
  onReject: (id: string) => void;
  onBackToMap: () => void;
};

export default function AdminView({ applications, onApprove, onReject, onBackToMap }: Props) {
  const [typeChoice, setTypeChoice] = useState<Record<string, Hub['type']>>({});

  const grouped = useMemo(() => ({
    pending: applications.filter(a => a.status === 'pending'),
    approved: applications.filter(a => a.status === 'approved'),
    rejected: applications.filter(a => a.status === 'rejected'),
  }), [applications]);

  const TypeSelect = ({ id }: { id: string }) => (
    <select
      className="border rounded-md px-2 py-1 text-sm"
      value={typeChoice[id] ?? 'Restaurant'}
      onChange={(e) => setTypeChoice(prev => ({ ...prev, [id]: e.target.value as Hub['type'] }))}
    >
      <option>Restaurant</option>
      <option>Grocery</option>
      <option>Church</option>
      <option>Library</option>
    </select>
  );

  const Card = ({ a }: { a: HubApplication }) => (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-teal-700 font-semibold mb-1">
            {a.status}
          </div>
          <h3 className="text-lg font-bold">{a.businessName}</h3>
          <div className="text-sm text-gray-700 mt-1">{a.address}</div>
          <div className="text-sm text-gray-700">{a.phone}</div>
          <div className="mt-2 rounded bg-emerald-50 text-emerald-800 inline-block px-2 py-1 text-sm font-medium">
            Offer: {a.offer}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Daily cap: <span className="font-semibold">{a.dailyCap}</span> •
            &nbsp;Email: <span className="font-semibold">{a.email}</span> •
            &nbsp;Submitted: {new Date(a.createdAt).toLocaleString()}
          </div>
        </div>

        {a.status === 'pending' && (
          <div className="flex flex-col items-end gap-2">
            <TypeSelect id={a.id} />
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(a.id, (typeChoice[a.id] ?? 'Restaurant'))}
                className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700"
              >
                Approve → Add Hub
              </button>
              <button
                onClick={() => onReject(a.id)}
                className="px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <button onClick={onBackToMap} className="text-teal-700 font-medium hover:underline">
          ← Back to Map
        </button>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Pending</h2>
        <div className="grid gap-4">
          {grouped.pending.length === 0 && <div className="text-sm text-gray-500">No pending applications.</div>}
          {grouped.pending.map(a => <Card key={a.id} a={a} />)}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Approved</h2>
        <div className="grid gap-4">
          {grouped.approved.length === 0 && <div className="text-sm text-gray-500">None yet.</div>}
          {grouped.approved.map(a => <Card key={a.id} a={a} />)}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Rejected</h2>
        <div className="grid gap-4">
          {grouped.rejected.length === 0 && <div className="text-sm text-gray-500">None.</div>}
          {grouped.rejected.map(a => <Card key={a.id} a={a} />)}
        </div>
      </section>
    </div>
  );
}
