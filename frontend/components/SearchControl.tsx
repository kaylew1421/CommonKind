// frontend/components/SearchControl.tsx
import React, { useMemo, useState } from "react";

type Metrics = {
  totalDonations: number;
  mealsFunded: number;
  redeemed24h: number;
};

type Props = {
  zip: string;
  onSearch: (zip: string) => void;
  onUseLocation: () => void;
  isLocating: boolean;

  filterType: string;
  onFilterChange: (t: string) => void;

  filterDistance: number;
  onFilterDistance: (miles: number) => void;
  maxDistance?: number;

  metrics?: Metrics;
};

const formatMoney = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const SearchControl: React.FC<Props> = ({
  zip,
  onSearch,
  onUseLocation,
  isLocating,
  filterType,
  onFilterChange,
  filterDistance,
  onFilterDistance,
  maxDistance = 100,
  metrics,
}) => {
  const [internalZip, setInternalZip] = useState(zip);

  const handleSubmit = () => {
    if (!internalZip?.trim()) return;
    onSearch(internalZip.trim());
  };

  const m = useMemo(
    () => ({
      totalDonations: metrics?.totalDonations ?? 10450,
      mealsFunded: metrics?.mealsFunded ?? 1306,
      redeemed24h: metrics?.redeemed24h ?? 87,
    }),
    [metrics]
  );

  const distanceLabel =
    filterDistance >= maxDistance ? "Any Distance" : `${filterDistance} mi`;

  return (
    <div className="p-4 bg-white border-b">
      {/* Brand */}
      <div className="flex items-center mb-3">
        <div className="mr-2 flex items-center justify-center h-7 w-7 rounded-md bg-emerald-600 text-white font-bold">
          CK
        </div>
        <div className="font-semibold text-gray-800">CommonKind Map</div>
      </div>

      {/* ZIP + Search (black outline) */}
      <div className="flex items-center gap-2 mb-3">
        <input
          value={internalZip}
          onChange={(e) => setInternalZip(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter ZIP Code"
          className="flex-1 h-10 rounded-md border-2 border-black px-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          inputMode="numeric"
        />
        <button
          onClick={handleSubmit}
          className="h-10 px-4 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
        >
          Search
        </button>
      </div>

      {/* Type + Distance (select for type only; distance is the drag control below) */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full h-10 appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-8 text-sm text-gray-800 focus:border-emerald-600 focus:ring-emerald-600"
          >
            <option value="all">All Types</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Grocery">Grocery</option>
            <option value="Church">Church</option>
            <option value="Library">Library</option>
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
        </div>

        {/* right column intentionally empty to keep compact grid like your mock */}
        <div />
      </div>

      {/* Use my location */}
      <button
        onClick={onUseLocation}
        disabled={isLocating}
        className="w-full h-10 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 hover:bg-emerald-100 transition flex items-center justify-center gap-2 mb-3 disabled:opacity-60"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0-6a1 1 0 011 1v2.062A8.001 8.001 0 0120.938 11H23a1 1 0 110 2h-2.062A8.001 8.001 0 0113 20.938V23a1 1 0 11-2 0v-2.062A8.001 8.001 0 013.062 13H1a1 1 0 110-2h2.062A8.001 8.001 0 0111 3.062V1a1 1 0 011-1z" />
        </svg>
        {isLocating ? "Locating..." : "Use my current location"}
      </button>

      {/* Drag toggle distance control (the one you had before) */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Adjust distance</span>
          <button
            className="hover:text-gray-800"
            onClick={() => onFilterDistance(maxDistance)}
            title="Set to Any Distance"
          >
            {distanceLabel}
          </button>
        </div>

        <input
          type="range"
          min={1}
          max={maxDistance}
          step={1}
          value={filterDistance}
          onChange={(e) => onFilterDistance(Number(e.target.value))}
          className="distance-slider w-full"
          aria-label="Distance filter"
        />
      </div>

      {/* Nearby + Impact (no General Fund button) */}
      <div className="rounded-xl border bg-white p-4">
        <div className="text-lg font-semibold text-gray-800">Nearby Hubs</div>
        <p className="text-sm text-gray-600">Find support in your community</p>

        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-700 tracking-wide mb-2">Impact</div>
          <div className="grid grid-cols-3 text-center gap-2">
            <div className="px-2">
              <div className="text-emerald-700 text-2xl font-bold">{formatMoney(m.totalDonations)}</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wide">Donated</div>
            </div>
            <div className="px-2">
              <div className="text-emerald-700 text-2xl font-bold">{m.mealsFunded.toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wide">Meals Funded</div>
            </div>
            <div className="px-2">
              <div className="text-emerald-700 text-2xl font-bold">{m.redeemed24h.toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wide">Redeemed Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* slider cosmetics (big round draggable thumb) */}
      <style>{`
        .distance-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          background: #e5e7eb; /* gray-200 */
          outline: none;
        }
        .distance-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: #10b981; /* emerald-500 */
          border: 2px solid #065f46; /* emerald-800 */
          box-shadow: 0 0 0 2px #ffffff inset;
          cursor: grab;
          margin-top: -8px; /* center the thumb on the track in webkit */
        }
        .distance-slider:active::-webkit-slider-thumb { cursor: grabbing; }

        .distance-slider::-moz-range-thumb {
          height: 22px; width: 22px; border-radius: 9999px;
          background: #10b981; border: 2px solid #065f46;
          box-shadow: 0 0 0 2px #ffffff inset; cursor: grab;
        }
        .distance-slider::-moz-range-track {
          height: 6px; border-radius: 9999px; background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default SearchControl;
