import React from "react";
import { Hub } from "../../types";

interface HubCardProps {
  hub: Hub;
  userPosition: [number, number] | null;
  onSelectHub: (hub: Hub) => void;
  onDonate: (hub: Hub) => void; // ← pass the hub
  isHighlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// Haversine (mi)
const getDistance = (pos1: [number, number], pos2: [number, number]): number => {
  const R = 6371; // km
  const dLat = ((pos2[0] - pos1[0]) * Math.PI) / 180;
  const dLon = ((pos2[1] - pos1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((pos1[0] * Math.PI) / 180) *
      Math.cos((pos2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 0.621371;
};

const TypeIcon: React.FC<{ type: Hub["type"] }> = ({ type }) => {
  const iconClass = "w-7 h-7 text-gray-500";
  switch (type) {
    case "Restaurant":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h4v5h-4z" />
        </svg>
      );
    case "Grocery":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "Church":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "Library":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const HubCard: React.FC<HubCardProps> = ({
  hub,
  userPosition,
  onSelectHub,
  onDonate,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
}) => {
  const distance = userPosition ? getDistance(userPosition, [hub.lat, hub.lng]).toFixed(1) : null;

  const remaining = Number.isFinite(Number(hub.vouchersRemaining)) ? Number(hub.vouchersRemaining) : 0;
  const cap = Number.isFinite(Number(hub.dailyCap)) ? Number(hub.dailyCap) : 0;

  const isAvailable = remaining > 0;
  const capacityPercent = cap > 0 ? Math.min(100, Math.max(0, (remaining / cap) * 100)) : 0;

  let progressColor = "bg-green-500";
  if (capacityPercent < 10) progressColor = "bg-red-500";
  else if (capacityPercent < 50) progressColor = "bg-yellow-500";

  return (
    <button
      type="button"                                // ← prevent accidental form submit
      onClick={() => onSelectHub(hub)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`View details for ${hub.name}`}
      className={`w-full text-left p-4 border-b cursor-pointer transition-all duration-200 flex space-x-4 items-start ${
        isHighlighted ? "bg-teal-50 border-l-4 border-teal-400" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex-shrink-0 pt-1">
        <TypeIcon type={hub.type} />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-800 pr-2 truncate">{hub.name}</h3>
          {distance && <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{distance} mi</span>}
        </div>

        <p className="text-sm text-gray-600 truncate">{hub.offer}</p>

        {!!hub.requirements?.length && (
          <div className="mt-2 flex items-center text-xs text-blue-700 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span>Requirements may apply</span>
          </div>
        )}

        <div className="mt-3 space-y-2">
          <div role="status" className="flex justify-between items-center text-sm">
            {isAvailable ? (
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="font-medium text-green-700">Available Now</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 bg-red-500 rounded-full" />
                <span className="font-medium text-red-700">Out for today</span>
              </div>
            )}
            <span className="font-semibold text-gray-700">
              {remaining} / {cap}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${capacityPercent}%` }}
              role="progressbar"
              aria-valuenow={remaining}
              aria-valuemin={0}
              aria-valuemax={cap}
              aria-label={`${remaining} out of ${cap} vouchers remaining`}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"                            // ← also make this explicit
            onClick={(e) => {
              e.stopPropagation();
              onDonate(hub);                         // ← pass hub
            }}
            aria-label={`Donate to ${hub.name}`}
            className="text-sm font-semibold bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
          >
            Donate to this Hub
          </button>
        </div>
      </div>
    </button>
  );
};

export default HubCard;
