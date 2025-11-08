// frontend/components/AdminLoginModal.tsx
import React, { useState } from "react";

interface AdminLoginModalProps {
  onClose: () => void;
  onVerify: (code: string) => boolean | Promise<boolean>;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onVerify }) => {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ok = await onVerify(code.trim());
      if (ok) onClose();
      else setError("Invalid admin code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Login</h2>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Enter the admin passcode to access the dashboard.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin code</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
              autoFocus
            />
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>

          <button
            disabled={busy || !code}
            type="submit"
            className="w-full py-2.5 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60"
          >
            {busy ? "Verifying…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
