import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hub } from "../types";

type Props = {
  hubs: Hub[];
  center: [number, number];
  highlightedHubId: string | null;
  setHighlightedHubId: (id: string | null) => void;
  onSelectHub: (hub: Hub) => void;
  initialZoom?: number;
};

const markerIcon = (highlighted: boolean) =>
  L.icon({
    iconUrl: highlighted
      ? "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
      : "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const t = setTimeout(invalidate, 50);
    window.addEventListener("resize", invalidate);
    return () => { clearTimeout(t); window.removeEventListener("resize", invalidate); };
  }, [map]);
  return null;
}

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  const last = useRef(center);
  useEffect(() => {
    const [a1, b1] = last.current;
    const [a2, b2] = center;
    const dist = Math.hypot(a2 - a1, b2 - b1);
    if (dist > 0.0005) {
      map.flyTo(center as LatLngExpression, Math.max(map.getZoom(), 12), { animate: true, duration: 0.5 });
      last.current = center;
    }
  }, [center, map]);
  return null;
}

function FlyToHub({ hub }: { hub: Hub | null }) {
  const map = useMap();
  useEffect(() => {
    if (!hub) return;
    map.flyTo([hub.lat, hub.lng], Math.max(map.getZoom(), 15), { animate: true, duration: 0.5 });
  }, [hub, map]);
  return null;
}

const MapView: React.FC<Props> = ({
  hubs, center, highlightedHubId, setHighlightedHubId, onSelectHub, initialZoom = 12,
}) => {
  const highlightedHub = useMemo(() => hubs.find(h => h.id === highlightedHubId) ?? null, [hubs, highlightedHubId]);

  const markers = useMemo(
    () => hubs.map(h => ({ ...h, pos: [h.lat, h.lng] as [number, number], highlighted: h.id === highlightedHubId })),
    [hubs, highlightedHubId]
  );

  return (
    <MapContainer
      center={center}
      zoom={initialZoom}
      scrollWheelZoom
      className="w-full h-full"
      preferCanvas
      attributionControl={false}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ResizeFix />
      <FlyTo center={center} />
      <FlyToHub hub={highlightedHub} />

      {markers.map(h => (
        <Marker
          key={h.id}
          position={h.pos}
          icon={markerIcon(h.highlighted)}
          eventHandlers={{
            click: () => { setHighlightedHubId(h.id); onSelectHub(h); },
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{h.name}</div>
              {h.offer && <div className="text-gray-600">{h.offer}</div>}
              <button className="mt-2 px-2 py-1 text-xs rounded bg-teal-600 text-white" onClick={() => onSelectHub(h)}>
                View details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default React.memo(MapView);
