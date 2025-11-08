import React, { useMemo, useState } from "react";

/** Local light types so this file is drop-in */
interface Hub { id: string; name: string; offer?: string; address?: string; }
interface DonateModalProps {
  hub: Hub | null;                // null = donate to CommonKind pool
  onClose: () => void;
  onDonate?: (payload: { amount: number; note?: string; hubId?: string }) => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ hub, onClose, onDonate }) => {
  // stepper
  const [step, setStep] = useState<"details" | "payment" | "done">("details");

  // step 1
  const [amount, setAmount] = useState<number>(25);
  const [note, setNote] = useState<string>("");

  // step 2 (mock payment)
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY (not strictly validated)
  const [cvc, setCvc] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (hub ? `Donate to ${hub.name}` : "Donate to CommonKind"),
    [hub]
  );

  const goPayment = () => {
    if (!amount || amount < 1) {
      setError("Please enter a valid amount.");
      return;
    }
    setError(null);
    setStep("payment");
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // very relaxed validation for mock:
    if (!nameOnCard.trim()) return setError("Name on card is required.");
    if (!cardNumber.trim()) return setError("Please enter a card number (any number for demo).");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return setError("Please enter a valid email.");
    }
    // expiry & cvc optional in mock; accept whatever user enters

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate gateway

    onDonate?.({
      amount,
      note: note.trim() || undefined,
      hubId: hub?.id,
    });

    setProcessing(false);
    setStep("done");
    setTimeout(onClose, 900);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {hub && (
              <p className="text-xs text-gray-500">
                {hub.offer ? hub.offer + " • " : ""}
                {hub.address}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* dots */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`h-2 w-2 rounded-full ${step !== "details" ? "bg-teal-600" : "bg-teal-400"}`} />
          <span className={`h-2 w-2 rounded-full ${step === "payment" || step === "done" ? "bg-teal-600" : "bg-gray-300"}`} />
          <span className={`h-2 w-2 rounded-full ${step === "done" ? "bg-teal-600" : "bg-gray-300"}`} />
        </div>

        {step === "details" && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <div className="flex flex-wrap gap-2">
                {[10,25,50,100].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v)}
                    className={
                      "px-3 py-1.5 rounded border text-sm " +
                      (amount === v
                        ? "bg-teal-600 text-white border-teal-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
                    }
                  >
                    ${v}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value || 0))}
                  className="ml-auto w-28 rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Add a note to your donation…"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="button"
              onClick={goPayment}
              className="w-full py-2.5 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === "payment" && (
          <form className="space-y-4" onSubmit={submitPayment}>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <input
                  className="w-full rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="Jane Q. Donor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  className="w-full rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242 (any for demo)"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    className="w-full rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="05/28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    className="w-full rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Email</label>
                  <input
                    type="email"
                    className="w-full rounded border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={processing}
              className={
                "w-full py-2.5 rounded-md text-white font-semibold " +
                (processing ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700")
              }
            >
              {processing ? "Processing…" : `Confirm $${amount} Donation`}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Payment confirmed</h3>
            <p className="text-sm text-gray-600">
              Thank you for supporting {hub ? hub.name : "CommonKind"}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
