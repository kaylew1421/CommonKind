import React from "react";

export interface ImpactMetrics {
  totalDonations: number;      // dollars
  mealsFunded: number;         // count
  redeemedToday: number;       // count
}

const ImpactStats: React.FC<{ metrics: ImpactMetrics }> = ({ metrics }) => {
  const money = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="px-4 pt-3 pb-2 grid grid-cols-3 gap-3 border-b bg-white">
      <div className="rounded-lg bg-teal-50 p-3">
        <div className="text-xs font-medium text-teal-700">Donated</div>
        <div className="text-xl font-bold text-teal-800">{money(metrics.totalDonations)}</div>
      </div>
      <div className="rounded-lg bg-indigo-50 p-3">
        <div className="text-xs font-medium text-indigo-700">Meals Funded</div>
        <div className="text-xl font-bold text-indigo-800">{metrics.mealsFunded.toLocaleString()}</div>
      </div>
      <div className="rounded-lg bg-emerald-50 p-3">
        <div className="text-xs font-medium text-emerald-700">Redeemed Today</div>
        <div className="text-xl font-bold text-emerald-800">{metrics.redeemedToday.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default ImpactStats;
