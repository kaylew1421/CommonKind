import React from "react";
import HubCard from "./HubCard";
import type { Hub } from "../../types";

interface Props {
  hubs: Hub[];
  userPosition: [number, number] | null;
  onSelectHub: (hub: Hub) => void;
  onDonate: (hub: Hub) => void;
  highlightedHubId: string | null;
  setHighlightedHubId: (id: string | null) => void;
  searchMessage: string | null;
}

const HubList: React.FC<Props> = ({
  hubs,
  userPosition,
  onSelectHub,
  onDonate,
  highlightedHubId,
  setHighlightedHubId,
  searchMessage,
}) => {
  return (
    <div className="flex-1 overflow-y-auto border-t md:border-t-0 md:border-r bg-white">
      {searchMessage && (
        <div className="px-4 py-2 text-sm text-amber-700 bg-amber-50 border-b">
          {searchMessage}
        </div>
      )}

      {hubs.map((hub) => (
        <HubCard
          key={hub.id}
          hub={hub}
          userPosition={userPosition}
          onSelectHub={() => onSelectHub(hub)} // ← make sure click reaches App
          onDonate={() => onDonate(hub)}      // ← pass hub to modal
          isHighlighted={highlightedHubId === hub.id}
          onMouseEnter={() => setHighlightedHubId(hub.id)}
          onMouseLeave={() => setHighlightedHubId(null)}
        />
      ))}

      {!hubs.length && (
        <div className="p-6 text-center text-sm text-gray-500">
          No hubs match your filters.
        </div>
      )}
    </div>
  );
};

export default React.memo(HubList);
