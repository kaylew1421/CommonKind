// frontend/components/HubOnboardingView.tsx
import React, { useState } from 'react';

export default function HubOnboardingView({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (app: {
    businessName: string;
    address: string;
    phone: string;
    offer: string;
    dailyCap: number;
    email: string;
  }) => void;
}) {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [offer, setOffer] = useState('');
  const [cap, setCap] = useState<string>('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSubmit({
      businessName,
      address,
      phone,
      offer,
      dailyCap: Number(cap) || 0,
      email,
    });
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={onBack} className="text-teal-700 text-sm font-medium mb-4 hover:underline">
        ← Back to Map
      </button>
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Become a Help Hub</h1>
          <p className="text-gray-600 mt-1">Join our network of community partners. The process takes about 3 minutes.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">What will you offer?</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 'Free hot lunch' or 'Bag of groceries'" value={offer} onChange={(e) => setOffer(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Voucher Cap</label>
              <input type="number" min={0} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 20" value={cap} onChange={(e) => setCap(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input type="email" className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
