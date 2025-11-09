import React, { useEffect, useState } from "react";

interface FamilySizeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
  /** Optional upper bound to reflect hub stock; defaults to 8 */
  max?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const FamilySizeModal: React.FC<FamilySizeModalProps> = ({ open, onClose, onSubmit, max = 8 }) => {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open) return;
    setQty(1);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const commit = () => onSubmit(clamp(qty, 1, max));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold mb-1">How many people are in your household?</h2>
        <p className="text-sm text-gray-600 mb-4">
          We’ll issue enough meal vouchers for everyone. This demo caps at {max}.
        </p>

        {/* quantity picker */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setQty(q => clamp(q - 1, 1, max))}
            className="h-9 w-9 rounded-lg border border-gray-300 grid place-items-center hover:bg-gray-50"
            aria-label="decrease"
          >
            −
          </button>

          <input
            type="number"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => setQty(clamp(parseInt(e.target.value || "1", 10), 1, max))}
            className="w-20 text-center rounded-lg border border-gray-300 py-2"
          />

          <button
            type="button"
            onClick={() => setQty(q => clamp(q + 1, 1, max))}
            className="h-9 w-9 rounded-lg border border-gray-300 grid place-items-center hover:bg-gray-50"
            aria-label="increase"
          >
            +
          </button>
        </div>

        {/* range slider (keeps your previous “drag” UX vibe) */}
        <input
          type="range"
          min={1}
          max={max}
          step={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10))}
          className="w-full accent-teal-600"
        />
        <div className="mt-2 text-sm text-gray-700">Household size: <span className="font-semibold">{qty}</span></div>

        {/* actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilySizeModal;
