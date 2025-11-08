import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Hub } from "../../types";
import MapView from "./MapView";
import HubList from "./HubList";
import SearchControl from "./SearchControl";

interface MapContainerProps {
  hubs: Hub[];
  onSelectHub: (hub: Hub) => void;
  onDonate: (hub: Hub | null) => void;
  metrics?: { totalDonations: number; mealsFunded: number; redeemedToday: number };
}

// miles between two [lat,lng]
const getDistance = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return (R * c) * 0.621371;
};

// mock zip → lat/lng
const mockGeocode = async (zip: string): Promise<[number, number] | null> => {
  if (zip.includes("76009")) return [32.4057, -97.2136];
  if (zip.includes("76028")) return [32.536, -97.325];
  return null;
};

const MapContainer: React.FC<MapContainerProps> = ({ hubs, onSelectHub, onDonate, metrics }) => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([32.4057, -97.2136]);
  const [highlightedHub, setHighlightedHub] = useState<string | null>(null);

  const [searchedHubs, setSearchedHubs] = useState<Hub[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDistance, setFilterDistance] = useState<number>(0); // 0 = any

  // ► Always show hubs as soon as they arrive; center on their centroid if we
  // don’t have a user location yet.
  useEffect(() => {
    setSearchedHubs(hubs);

    if (!userPosition && hubs.length) {
      const avgLat = hubs.reduce((s, h) => s + h.lat, 0) / hubs.length;
      const avgLng = hubs.reduce((s, h) => s + h.lng, 0) / hubs.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [hubs, userPosition]);

  // ► Try geolocation once (don’t block the list)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p);
        setMapCenter(p);
      },
      () => {
        // keep showing hubs; optionally set a small note
        setSearchMessage("Showing all hubs.");
      }
    );
  }, []);

  const handleFilterChange = useCallback((type: string) => setFilterType(type), []);
  const handleDistanceChange = useCallback((n: number) => setFilterDistance(n), []);

  const displayedHubs = useMemo(() => {
    const t = filterType === "all" ? searchedHubs : searchedHubs.filter(h => h.type === filterType);
    const d = filterDistance > 0 ? t.filter(h => getDistance(mapCenter, [h.lat, h.lng]) <= filterDistance) : t;

    return d.slice().sort((a, b) => {
      const da = getDistance(mapCenter, [a.lat, a.lng]);
      const db = getDistance(mapCenter, [b.lat, b.lng]);
      return da - db;
    });
  }, [searchedHubs, filterType, filterDistance, mapCenter]);

  const handleUseLocation = useCallback(() => {
    setIsLocating(true);
    setSearchMessage(null);
    setFilterType("all");
    setFilterDistance(0);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p);
        setMapCenter(p);
        setIsLocating(false);
      },
      () => {
        setSearchMessage("Could not get your location. Showing all hubs.");
        setIsLocating(false);
      }
    );
  }, []);

  const handleSearch = async (zip: string) => {
    setIsLocating(true);
    setSearchMessage(null);
    setFilterType("all");
    setFilterDistance(0);
    const c = await mockGeocode(zip);
    if (c) {
      setMapCenter(c);
      setSearchedHubs(hubs); // keep full list; sorted by new center
    } else {
      setSearchMessage(`Could not find location for ZIP code ${zip}.`);
    }
    setIsLocating(false);
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row-reverse h-[calc(100vh-4rem)]">
      <div className="w-full md:w-2/3 h-1/2 md:h-full">
        <MapView
          hubs={displayedHubs}
          center={mapCenter}
          onSelectHub={onSelectHub}
          highlightedHubId={highlightedHub}
          setHighlightedHubId={setHighlightedHub}
          initialZoom={12}
        />
      </div>

      <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col">
        <SearchControl
          onSearch={handleSearch}
          onUseLocation={handleUseLocation}
          isLocating={isLocating}
          filterType={filterType}
          onFilterChange={handleFilterChange}
          filterDistance={filterDistance}
          onFilterDistanceChange={handleDistanceChange}
          // you can pass metrics to show your counters above the list
          metrics={metrics}
          // set default slider to 100mi inside SearchControl if you want
        />
        <HubList
          hubs={displayedHubs}
          userPosition={userPosition}
          onSelectHub={onSelectHub}
          onDonate={onDonate}
          highlightedHubId={highlightedHub}
          setHighlightedHubId={setHighlightedHub}
          searchMessage={searchMessage}
        />
      </div>
    </div>
  );
};

export default MapContainer;
