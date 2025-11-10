// frontend/components/HubLoginModal.tsx
import React, { useEffect, useState } from "react";
import type { Hub } from "../types";

type Props = {
  open: boolean;
  hubs: Hub[];
  onClose: () => void;
  onLoggedIn: (hubId: string) => void;
};

const HubLoginModal: React.FC<Props> = ({ open, hubs, onClose, onLoggedIn }) => {
  const [hubId, setHubId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setHubId("");
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    setError(null);
    if (!hubId) return setError("Choose a hub.");
    if (!password.trim()) return setError("Enter password.");
    setLoading(true);
    // Demo-only auth
    setTimeout(() => {
      setLoading(false);
      if (password.trim() !== "commonkind") return setError("Incorrect password.");
      onLoggedIn(hubId);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Hub Login</h2>
          <p className="mt-1 text-sm text-gray-500">Select your hub and enter the shared hub password.</p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Hub</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            value={hubId}
            onChange={(e) => setHubId(e.target.value)}
          >
            <option value="">Select a hub…</option>
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="commonkind"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-teal-700"
            disabled={!hubId || !password || loading}
            onClick={submit}
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HubLoginModal;
