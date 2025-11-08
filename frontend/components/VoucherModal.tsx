import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Hub, Voucher } from "../../types";
import { QRCodeCanvas } from "qrcode.react";

type Phase = "qr" | "countdown" | "done";

interface Props {
  voucher: Voucher;
  hub: Hub | null;
  onUseVoucher: (voucherId: string) => boolean;
  onClose: () => void;
}

export default function VoucherModal({ voucher, hub, onUseVoucher, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("qr");
  const [remaining, setRemaining] = useState<number>(5);
  const timerRef = useRef<number | null>(null);

  const qrPayload = useMemo(
    () => JSON.stringify({ voucherId: voucher.id, hubId: voucher.hubId }),
    [voucher.id, voucher.hubId]
  );

  const startCountdown = () => {
    if (phase !== "qr") return;
    setPhase("countdown");
    setRemaining(5);
    timerRef.current = window.setInterval(() => {
      setRemaining((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
  };

  useEffect(() => {
    if (phase !== "countdown" || remaining > 0) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const ok = onUseVoucher(voucher.id);
    setPhase(ok ? "done" : "qr");
  }, [phase, remaining, onUseVoucher, voucher.id]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {phase === "done" ? "Voucher Processed" : "Your Voucher"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {hub && phase !== "done" && (
          <div className="mb-3 text-sm text-gray-600">
            <div className="font-medium">{hub.name}</div>
            <div className="truncate">{hub.address}</div>
          </div>
        )}

        {phase === "qr" && (
          <>
            <div className="flex items-center justify-center my-4">
              <QRCodeCanvas value={qrPayload} size={192} includeMargin />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">Show this code to the hub to redeem.</p>
            <button onClick={startCountdown} className="w-full py-2.5 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700">
              Use Voucher
            </button>
          </>
        )}

        {phase === "countdown" && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-bold text-teal-700">{remaining}</div>
            <div className="mt-2 text-sm text-gray-600">Processing voucher…</div>
          </div>
        )}

        {phase === "done" && (
          <>
            <div className="flex items-center justify-center py-6">
              <svg className="h-14 w-14 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="text-center text-sm text-gray-700">
              Voucher processed{hub ? ` at ${hub.name}` : ""}. Counts updated.
            </p>
            <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
