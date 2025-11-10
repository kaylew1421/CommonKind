// frontend/components/AdminLoginModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { adminLogin } from "../lib/api";
import { setToken } from "../lib/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoggedIn?: () => void;
};

const AdminLoginModal: React.FC<Props> = ({ open, onClose, onLoggedIn }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError(null);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const doLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const resp = await adminLogin((password || "").trim());
      if (resp?.ok && resp?.token) {
        setToken(resp.token);
        onLoggedIn?.();
        onClose();
        return;
      }
      setError("Login failed. Please verify the password and try again.");
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg === "401") setError("Incorrect password.");
      else if (msg === "404") setError("Login endpoint not found. Check VITE_API_BASE_URL.");
      else if (msg.includes("Failed to fetch")) setError("Network error. Check your API URL / CORS.");
      else setError(`Server error${msg ? ` (${msg})` : ""}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/5" onClick={(e)=>e.stopPropagation()}>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Admin Login</h2>
          <p className="mt-1 text-sm text-gray-500">Enter the admin password to access the dashboard.</p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !loading && password.trim()) void doLogin(); }}
            placeholder="Enter password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={doLogin} disabled={!password.trim() || loading}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-green-700">
            {loading ? "Signing in..." : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
