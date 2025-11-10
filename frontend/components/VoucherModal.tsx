// frontend/components/VoucherModal.tsx
import React, { useMemo, useState } from "react";
import type { Hub, Voucher } from "../types";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  voucher: Voucher;
  hub: Hub | null;
  onUseVoucher: (id: string, manualCode?: string) => Promise<boolean> | boolean;
  onClose: () => void;
};

const fmt = (d: Date) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const VoucherModal: React.FC<Props> = ({ voucher, hub, onUseVoucher, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState<string>(voucher?.id || "");
  const expiresAt = useMemo(() => voucher.expiresAt, [voucher]);

  const doUse = async () => {
    setLoading(true);
    try {
      const ok = await Promise.resolve(onUseVoucher(voucher.id, manualCode.trim()));
      if (ok) onClose();
    } finally {
      setLoading(false);
    }
  };

  const manualShort = voucher.id; // show exactly what staff can type

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/5" onClick={(e)=>e.stopPropagation()}>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Show this at {hub?.name ?? "the hub"}</h2>
          <p className="mt-1 text-sm text-gray-500">
            Expires at <b>{fmt(expiresAt)}</b>
          </p>
        </div>

        <div className="px-5 py-5 grid place-items-center gap-3">
          <QRCodeCanvas value={voucher.id} size={200} includeMargin />
          <div className="text-xs text-gray-500">Manual code:</div>
          <div className="text-base font-mono tracking-wide">{manualShort}</div>

          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter manual code (for staff)"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
          <button
            onClick={doUse}
            disabled={loading}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-green-700"
          >
            {loading ? "Marking…" : "Mark voucher used"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
