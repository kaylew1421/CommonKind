// frontend/components/HubOnboardingView.tsx
import React, { useState } from "react";
import type { Hub } from "../types";

type Props = {
  onBack: () => void;
  onSubmit: (input: {
    businessName: string;
    address: string;
    phone: string;
    offer: string;
    dailyCap: number;
    email: string;
  }) => void;
};

const HubOnboardingView: React.FC<Props> = ({ onBack, onSubmit }) => {
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [offer, setOffer] = useState("");
  const [dailyCap, setDailyCap] = useState<number>(10);
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);

  const reset = () => {
    setBusinessName("");
    setAddress("");
    setPhone("");
    setOffer("");
    setDailyCap(10);
    setEmail("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ businessName, address, phone, offer, dailyCap: Number(dailyCap || 0), email });
    setOk(true);
    reset();
  };

  if (ok) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          ✅ Application submitted! We’ll email you next steps.
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setOk(false)} className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
            New application
          </button>
          <button onClick={onBack} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
            Back to map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-1">Become a Hub</h2>
      <p className="text-gray-600 mb-4">Tell us about your location and what you can offer.</p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Business or Org Name</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={businessName} onChange={(e)=>setBusinessName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={address} onChange={(e)=>setAddress(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" className="mt-1 w-full rounded-md border px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Offer (meal, bundle, etc.)</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={offer} onChange={(e)=>setOffer(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Daily voucher cap</label>
          <input type="number" min={1} className="mt-1 w-full rounded-md border px-3 py-2"
                 value={dailyCap} onChange={(e)=>setDailyCap(Number(e.target.value || 0))} required />
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button type="submit" className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
            Submit application
          </button>
          <button type="button" onClick={onBack} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default HubOnboardingView;
