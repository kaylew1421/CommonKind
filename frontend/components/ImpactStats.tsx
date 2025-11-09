// frontend/components/ImpactStats.tsx
import React from "react";

type Props = {
  donated: number;
  mealsFunded: number;
  redeemedToday: number;
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
    <div className="text-xs tracking-wide text-gray-600">{label}</div>
  </div>
);

const ImpactStats: React.FC<Props> = ({ donated, mealsFunded, redeemedToday }) => {
  return (
    <section aria-labelledby="impact-heading" className="mt-4">
      <h3
        id="impact-heading"
        className="mb-2 text-sm font-semibold tracking-wide text-gray-900"
      >
        Impact stats
      </h3>

      <div className="grid grid-cols-3 gap-6 rounded-lg border border-gray-200 bg-white p-4">
        <Stat label="DONATED" value={`$${donated.toLocaleString()}`} />
        <Stat label="MEALS FUNDED" value={mealsFunded.toLocaleString()} />
        <Stat label="REDEEMED TODAY" value={redeemedToday.toLocaleString()} />
      </div>
    </section>
  );
};

export default ImpactStats;
