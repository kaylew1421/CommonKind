import React from "react";
import type { Hub } from "../types";

interface Props {
  hub: Hub;
  onBack: () => void;
  onGetVoucher: (hub: Hub) => void;
  onDonate: (hub: Hub) => void;
}

export default function HubDetailView({ hub, onBack, onGetVoucher, onDonate }: Props) {
  const cap = typeof hub.dailyCap === "number" ? hub.dailyCap : 0;
  const remaining = typeof hub.vouchersRemaining === "number" ? hub.vouchersRemaining : 0;

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center text-teal-700 hover:text-teal-800"
        aria-label="Back to Map"
        type="button"
      >
        <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Map
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6">
          <div className="text-xs font-semibold uppercase text-teal-700 mb-2">{hub.type ?? "Hub"}</div>
          <h1 className="text-2xl font-bold text-gray-900">{hub.name}</h1>

          {hub.offer && (
            <div className="mt-4 bg-teal-50 text-teal-900 rounded-lg px-4 py-3">
              <span className="font-medium">Offer: </span>
              {hub.offer}
            </div>
          )}
        </div>

        {/* Info rows */}
        <div className="px-6 pb-6 space-y-4">
          {hub.address && (
            <div className="flex items-start">
              <svg className="h-5 w-5 text-gray-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19.5 9c0 7.5-7.5 12-7.5 12S4.5 16.5 4.5 9a7.5 7.5 0 1115 0z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div className="text-sm text-gray-800">{hub.address}</div>
              </div>
            </div>
          )}

          {hub.hours && (
            <div className="flex items-start">
              <svg className="h-5 w-5 text-gray-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 110-20 10 10 0 010 20z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">Hours</div>
                <div className="text-sm text-gray-800">{hub.hours}</div>
              </div>
            </div>
          )}

          {hub.phone && (
            <div className="flex items-start">
              <svg className="h-5 w-5 text-gray-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.78 19.78 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.78 19.78 0 012.08 4.2 2 2 0 014.06 2h3a2 2 0 012 1.72c.12.9.3 1.77.54 2.61a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.84.24 1.71.42 2.61.54A2 2 0 0122 16.92z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="text-sm text-gray-800">{hub.phone}</div>
              </div>
            </div>
          )}

          {/* Self-Attestation: show on every expanded view */}
          <div className="mt-4 bg-yellow-50 text-yellow-900 rounded-lg px-4 py-3">
            <div className="font-semibold mb-1">Self-Attestation</div>
            <div className="text-sm">
              By requesting a voucher, you confirm you are in need or impacted by the current crisis.
            </div>
          </div>

          {/* Requirements (safe if undefined) */}
          <div className="mt-4 bg-blue-50 text-blue-900 rounded-lg px-4 py-3">
            <div className="flex items-center mb-1">
              <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9V5h2v4H9zm0 2h2v4H9v-4z" />
              </svg>
            </div>
            <div className="text-sm font-semibold mb-1">Requirements for this Hub</div>
            {Array.isArray(hub.requirements) && hub.requirements.length > 0 ? (
              <ul className="list-disc ml-5 text-sm space-y-1">
                {hub.requirements.map((r, i) => (
                  <li key={i}>
                    {typeof r === "string" ? r : r.label}
                    {typeof r !== "string" && r.optional ? <span className="text-xs text-gray-500"> (optional)</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm">No additional requirements.</div>
            )}
          </div>

          {/* Capacity + Actions */}
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{remaining}</div>
            <div className="text-xs text-gray-500">vouchers remaining today</div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onGetVoucher(hub)}
                className="w-full py-2.5 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700"
              >
                Show Voucher
              </button>
              <button
                type="button"
                onClick={() => onDonate(hub)}
                className="w-full py-2.5 rounded-md bg-green-50 text-green-700 font-semibold hover:bg-green-100"
              >
                Donate to Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
