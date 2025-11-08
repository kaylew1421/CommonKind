import React, { useState } from "react";
import { HUB_TYPES } from "../../constants";

interface Props {
  onSearch: (zip: string) => void;
  onUseLocation: () => void;
  isLocating: boolean;

  filterType: string;
  onFilterChange: (type: string) => void;

  filterDistance: number;                 // miles
  onFilterDistanceChange: (miles: number) => void;
}

const SearchControl: React.FC<Props> = ({
  onSearch,
  onUseLocation,
  isLocating,
  filterType,
  onFilterChange,
  filterDistance,
  onFilterDistanceChange,
}) => {
  const [zip, setZip] = useState("");

  return (
    <div className="p-3 border-b bg-white">
      <div className="flex gap-2">
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Search by ZIP"
          className="flex-1 rounded border-gray-300 px-3 py-2"
        />
        <button
          onClick={() => onSearch(zip)}
          className="px-4 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700"
        >
          Search
        </button>
        <button
          onClick={onUseLocation}
          disabled={isLocating}
          className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
        >
          {isLocating ? "Locating…" : "Use my location"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <select
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value)}
          className="rounded border-gray-300 px-3 py-1.5"
        >
          <option value="all">All types</option>
          {HUB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Within</span>
          <input
            type="range"
            min={0}
            max={100}              // ⬅️ now 100 miles
            step={5}
            value={filterDistance}
            onChange={(e) => onFilterDistanceChange(Number(e.target.value))}
          />
          <span className="text-sm font-medium text-gray-700 w-16">
            {filterDistance === 0 ? "Any" : `${filterDistance} mi`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchControl;
