// frontend/components/HubPortal.tsx
import React, { useMemo, useState } from "react";
import type { Hub } from "../types";

interface HubPortalProps {
  open: boolean;
  hubs: Hub[];
  hub: Hub | null; // currently authed hub (by id) or null
  onClose: () => void;
  onAuthed: (hubId: string) => void;
  onLogout: () => void;

  donationsForHub: number;
  redemptionsForHub: number;
  getSinceDate: (id: string) => string;

  onManualRedeem: (code: string) => Promise<string>;
}

const HubPortal: React.FC<HubPortalProps> = ({
  open,
  hubs,
  hub,
  onClose,
  onAuthed,
  onLogout,
  donationsForHub,
  redemptionsForHub,
  getSinceDate,
  onManualRedeem,
}) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => hubs.find((h) => h.id === selectedId) || null,
    [selectedId, hubs]
  );

  if (!open) return null;

  const doLogin = () => {
    setErr(null);
    if (!selectedId) return setErr("Pick your hub.");
    if ((pwd || "").trim() !== "commonkind") return setErr("Incorrect password.");
    onAuthed(selectedId);
    setPwd("");
  };

  const doRedeem = async () => {
    setRedeemMsg(null);
    if (!inputCode.trim()) return;
    setLoading(true);
    try {
      const msg = await onManualRedeem(inputCode.trim());
      setRedeemMsg(msg);
      setInputCode("");
    } catch {
      setRedeemMsg("Redeem failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Hub Portal</div>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {!hub ? (
          <div className="p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select your hub</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">— Choose a hub —</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mt-2">Password</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="commonkind"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

            <div className="pt-2 flex justify-end">
              <button
                onClick={doLogin}
                className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Log in
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Logged in as</div>
                <div className="font-semibold">{hub.name}</div>
              </div>
              <button
                onClick={onLogout}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Donations</div>
                <div className="text-lg font-semibold">
                  ${donationsForHub.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">People Helped</div>
                <div className="text-lg font-semibold">{redemptionsForHub}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Member Since</div>
                <div className="text-lg font-semibold">{getSinceDate(hub.id)}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="font-medium mb-2">Manual voucher redeem</div>
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter code printed below QR"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={doRedeem}
                  disabled={loading || !inputCode.trim()}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-green-700"
                >
                  {loading ? "Redeeming…" : "Redeem"}
                </button>
              </div>
              {redeemMsg && (
                <div className="mt-2 text-sm text-gray-700">{redeemMsg}</div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">
                ⭐ Reviews: coming soon • Export CSV • Edit hub info
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubPortal;
