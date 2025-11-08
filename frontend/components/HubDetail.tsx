import React from 'react';
import { Hub } from '../../types';

type Props = {
  hub: Hub;
  onGetVoucher?: (hub: Hub) => void;
  onDonate?: (hub: Hub) => void;
};

const IconPin = () => (
  <svg className="h-5 w-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
  </svg>
);
const IconClock = () => (
  <svg className="h-5 w-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12.5a.75.75 0 00-1.5 0v4.25c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V5.5z" clipRule="evenodd" />
  </svg>
);
const IconPhone = () => (
  <svg className="h-5 w-5 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2 5.5C2 4.12 3.12 3 4.5 3h2A2.5 2.5 0 019 5.5v1A2.5 2.5 0 016.5 9H6a11 11 0 005 5v-.5A2.5 2.5 0 0113.5 11h1A2.5 2.5 0 0117 13.5v2A2.5 2.5 0 0114.5 18h-1A11.5 11.5 0 012 5.5z" />
  </svg>
);
const IconInfo = () => (
  <svg className="h-5 w-5 text-blue-700 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a1 1 0 100 2 1 1 0 000-2zm-1 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const toLabels = (items?: Hub['requirements']) =>
  (items ?? []).map(r => typeof r === 'string' ? r : r.label).filter(Boolean);

const HubDetail: React.FC<Props> = ({ hub, onGetVoucher, onDonate }) => {
  const reqLabels = toLabels(hub.requirements);
  const showSelf = hub.selfAttestation ?? false;

  return (
    <section aria-labelledby="hub-title" className="bg-white rounded-lg">
      <header className="px-6 pt-4">
        <h1 id="hub-title" className="text-2xl font-extrabold text-gray-900">{hub.name}</h1>
        {hub.offer && (
          <div className="mt-3 inline-flex rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-800 text-sm font-medium">
            Offer: <span className="ml-1 font-semibold">{' '}{hub.offer}</span>
          </div>
        )}
      </header>

      {/* Info rows */}
      <div className="mt-4 divide-y divide-gray-200">
        <div className="flex items-start gap-3 px-6 py-4">
          <IconPin />
          <div>
            <p className="text-sm text-gray-900">{hub.address}</p>
          </div>
        </div>
        {hub.hours && (
          <div className="flex items-start gap-3 px-6 py-4">
            <IconClock />
            <div>
              <p className="text-sm text-gray-900">{hub.hours}</p>
            </div>
          </div>
        )}
        {hub.phone && (
          <div className="flex items-start gap-3 px-6 py-4">
            <IconPhone />
            <div>
              <p className="text-sm text-gray-900">{hub.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* Self-Attestation banner */}
      {showSelf && (
        <div className="mx-6 mt-5 rounded-md bg-yellow-50 p-4">
          <p className="font-semibold text-yellow-900">Self-Attestation</p>
          <p className="mt-1 text-sm text-yellow-900/90">
            By requesting a voucher, you confirm you are in need or impacted by the current crisis.
          </p>
        </div>
      )}

      {/* Requirements panel */}
      {reqLabels.length > 0 && (
        <div className="mx-6 mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <IconInfo />
            <p className="font-semibold text-blue-900">Requirements for this Hub</p>
          </div>
          <p className="mt-1 text-sm text-blue-900/90">
            Please be prepared to show one of the following:
          </p>
          <ul className="mt-2 list-disc pl-6 text-sm text-gray-800 space-y-1">
            {reqLabels.map((label, i) => <li key={i}>{label}</li>)}
          </ul>
        </div>
      )}

      {/* Vouchers remaining + CTAs */}
      <div className="px-6 py-6">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-emerald-600">{hub.vouchersRemaining}</div>
          <div className="text-sm text-gray-600">vouchers remaining today</div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onGetVoucher?.(hub)}
            className="inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Show Voucher
          </button>
          <button
            onClick={() => onDonate?.(hub)}
            className="inline-flex justify-center rounded-md bg-emerald-50 px-4 py-2.5 text-emerald-700 font-semibold hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Donate to this Hub
          </button>
        </div>
      </div>
    </section>
  );
};

export default HubDetail;
