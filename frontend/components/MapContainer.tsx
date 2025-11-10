import React, { useEffect, useMemo, useState } from "react";
import type { Hub } from "../types";
import MapView from "./MapView";

/* ---------- Props ---------- */
type Metrics = { totalDonations: number; mealsFunded: number; redeemed24h: number };
type Props = {
  hubs: Hub[];
  onSelectHub: (hub: Hub) => void;
  onDonate: (hub: Hub | null) => void;
  metrics: Metrics;
};

/* ---------- Helpers ---------- */
const DEFAULT_CENTER: [number, number] = [32.4057, -97.2136];

function haversineMiles(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

// very light ZIP → lat/lng demo mapping (extend as needed)
function zipToLatLng(zip: string): [number, number] | null {
  const z = zip.trim();
  if (/^76009/.test(z)) return [32.4057, -97.2136];
  if (/^76028/.test(z)) return [32.5360, -97.3250];
  return null;
}

/* ---------- Component ---------- */
const MapContainer: React.FC<Props> = ({ hubs, onSelectHub, onDonate, metrics }) => {
  const [highlightedHubId, setHighlightedHubId] = useState<string | null>(null);

  // search controls
  const [searchZip, setSearchZip] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all"); // "restaurant" | "grocery" | "church" | "library" | ...
  const [useMyLocation, setUseMyLocation] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(0); // 0 = show all, otherwise miles
  const [myLoc, setMyLoc] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // figure center (my location > zip > average of hubs > default)
  const center = useMemo<[number, number]>(() => {
    if (useMyLocation && myLoc) return myLoc;
    const byZip = searchZip && zipToLatLng(searchZip);
    if (byZip) return byZip;
    if (hubs.length) {
      const avgLat = hubs.reduce((s, h) => s + h.lat, 0) / hubs.length;
      const avgLng = hubs.reduce((s, h) => s + h.lng, 0) / hubs.length;
      return [avgLat, avgLng];
    }
    return DEFAULT_CENTER;
  }, [useMyLocation, myLoc, searchZip, hubs]);

  // geolocate when toggled on
  useEffect(() => {
    if (!useMyLocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLoc([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [useMyLocation]);

  // filter hubs by type + distance
  const filteredHubs = useMemo(() => {
    let list = hubs;
    if (filterType !== "all") {
      const ft = filterType.toLowerCase();
      list = list.filter((h) => (h.type || "").toLowerCase() === ft);
    }
    if (distance > 0 && center) {
      list = list.filter(
        (h) => haversineMiles(center, [h.lat, h.lng]) <= distance
      );
    }
    return list;
  }, [hubs, filterType, distance, center]);

  // dropdown options from hub types present
  const typeOptions = useMemo(() => {
    const s = new Set<string>();
    hubs.forEach((h) => h.type && s.add(h.type));
    return ["all", ...Array.from(s)];
  }, [hubs]);

  return (
    <div className="h-[calc(100vh-72px)] lg:h-[calc(100vh-80px)] w-full overflow-hidden">
      <div className="mx-auto h-full px-3 lg:px-6">
        <div className="flex h-full gap-4">
          {/* LEFT: list + search */}
          <aside className="w-[520px] min-w-[420px] max-w-[560px] shrink-0 overflow-y-auto rounded-lg border bg-white">
            {/* Search header */}
            <div className="sticky top-0 z-10 bg-white/95 border-b">
              <div className="p-3">
                <div className="font-medium text-sm mb-2">CK Map</div>
                <div className="flex gap-2">
                  <input
                    value={searchZip}
                    onChange={(e) => setSearchZip(e.target.value)}
                    placeholder="Enter ZIP Code"
                    className="flex-1 rounded border px-3 py-2 text-sm"
                    inputMode="numeric"
                  />
                  <button
                    onClick={() => {
                      const p = zipToLatLng(searchZip);
                      if (!p) return;
                      // no-op; center is derived from searchZip
                    }}
                    className="rounded bg-gray-900 text-white px-3 py-2 text-sm"
                  >
                    Search
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded border px-3 py-1.5 text-sm"
                    aria-label="Filter by hub type"
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t === "all" ? "All Types" : t[0].toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>

                  <label className="ml-2 inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useMyLocation}
                      onChange={(e) => setUseMyLocation(e.target.checked)}
                    />
                    Use my current location
                    {isLocating && <span className="text-gray-500"> (locating…)</span>}
                  </label>
                </div>

                <div className="mt-3">
                  <label className="text-xs text-gray-600">Adjust distance</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={5}
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-12 text-right text-xs text-gray-600">
                      {distance === 0 ? "all" : `${distance} mi`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact row */}
              <div className="border-t px-4 py-3">
                <div className="text-xs text-gray-500">Impact</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold">
                      ${metrics.totalDonations.toLocaleString()}
                    </div>
                    <div className="text-gray-500">Donated</div>
                  </div>
                  <div>
                    <div className="font-semibold">{metrics.mealsFunded}</div>
                    <div className="text-gray-500">Meals funded</div>
                  </div>
                  <div>
                    <div className="font-semibold">{metrics.redeemed24h}</div>
                    <div className="text-gray-500">Redeemed today</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hub list */}
            <ul className="divide-y">
              {filteredHubs.map((h) => (
                <li
                  key={h.id}
                  className={`p-4 hover:bg-teal-50 cursor-pointer ${
                    highlightedHubId === h.id ? "bg-teal-50" : ""
                  }`}
                  onMouseEnter={() => setHighlightedHubId(h.id)}
                  onMouseLeave={() => setHighlightedHubId(null)}
                  onClick={() => onSelectHub(h)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectHub(h)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{h.name}</div>
                      {h.offer && <div className="text-xs text-gray-500">{h.offer}</div>}
                      <div className="mt-1 text-[11px] text-gray-500">{h.address}</div>
                    </div>
                    <button
                      className="rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDonate(h);
                      }}
                    >
                      Donate
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHub(h);
                      }}
                    >
                      View hub
                    </button>
                    <div className="ml-auto text-[11px] text-gray-500">
                      {Math.max(0, Number(h.vouchersRemaining || 0))} / {Number(h.dailyCap || 0)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT: map (sticky) */}
          <section className="relative min-w-0 flex-1">
            <div className="sticky top-[72px] lg:top-[80px] h-[calc(100vh-96px)] lg:h-[calc(100vh-112px)]">
              <div className="h-full w-full overflow-hidden rounded-lg border bg-white">
                <MapView
                  hubs={filteredHubs}
                  center={center}
                  highlightedHubId={highlightedHubId}
                  setHighlightedHubId={setHighlightedHubId}
                  onSelectHub={onSelectHub}
                  initialZoom={13}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
