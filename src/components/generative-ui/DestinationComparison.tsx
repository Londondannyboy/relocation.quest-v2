"use client";

import { useState } from "react";

interface Visa {
  name: string;
  cost?: string;
  processingTime?: string;
  isWorkPermit?: boolean;
  isResidencyPath?: boolean;
}

interface CityData {
  cityName: string;
  rent1BRCenter: number;
  currency: string;
}

interface Destination {
  slug: string;
  name: string;
  flag: string;
  region: string;
}

interface ComparisonData {
  destinations: Destination[];
  visas: Record<string, Visa[]>;
  cost_of_living: Record<string, CityData[]>;
  job_market: Record<string, {
    avgSalaryTech?: number;
    avgWorkHoursWeek?: number;
    vacationDaysStandard?: number;
    topIndustries?: string[];
  }>;
}

interface DestinationComparisonProps {
  comparison: ComparisonData;
}

/**
 * Side-by-side destination comparison
 * Shows visas, costs, and job market for two destinations
 */
export function DestinationComparison({ comparison }: DestinationComparisonProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "visas" | "costs">("overview");
  const [d1, d2] = comparison.destinations;

  if (!d1 || !d2) {
    return <div className="text-stone-500">Unable to compare destinations</div>;
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "USD": return "$";
      default: return currency;
    }
  };

  const v1 = comparison.visas[d1.name] || [];
  const v2 = comparison.visas[d2.name] || [];
  const c1 = comparison.cost_of_living[d1.name] || [];
  const c2 = comparison.cost_of_living[d2.name] || [];
  const j1 = comparison.job_market[d1.name] || {};
  const j2 = comparison.job_market[d2.name] || {};

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* Header - Side by Side Flags */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-4xl">{d1.flag}</span>
            <div>
              <h3 className="font-bold text-white">{d1.name}</h3>
              <p className="text-amber-100 text-xs">{d1.region}</p>
            </div>
          </div>

          <div className="bg-white/20 rounded-full px-4 py-1">
            <span className="text-white font-bold text-sm">VS</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <h3 className="font-bold text-white">{d2.name}</h3>
              <p className="text-amber-100 text-xs">{d2.region}</p>
            </div>
            <span className="text-4xl">{d2.flag}</span>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-stone-200">
        {[
          { id: "overview", label: "Overview" },
          { id: "visas", label: "Visas" },
          { id: "costs", label: "Cost of Living" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? "text-amber-600 border-b-2 border-amber-600 bg-amber-50/50"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Overview Section */}
        {activeSection === "overview" && (
          <div className="space-y-4">
            {/* Job Market Comparison */}
            <div>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                Job Market
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Left - D1 */}
                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="space-y-3">
                    {j1.avgSalaryTech && (
                      <div>
                        <p className="text-xs text-stone-400">Avg Tech Salary</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {getCurrencySymbol(c1[0]?.currency || "EUR")}{(j1.avgSalaryTech / 1000).toFixed(0)}k
                        </p>
                      </div>
                    )}
                    {j1.avgWorkHoursWeek && (
                      <div>
                        <p className="text-xs text-stone-400">Work Week</p>
                        <p className="text-lg font-semibold text-stone-700">{j1.avgWorkHoursWeek}h</p>
                      </div>
                    )}
                    {j1.vacationDaysStandard && (
                      <div>
                        <p className="text-xs text-stone-400">Vacation Days</p>
                        <p className="text-lg font-semibold text-stone-700">{j1.vacationDaysStandard} days</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right - D2 */}
                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="space-y-3">
                    {j2.avgSalaryTech && (
                      <div>
                        <p className="text-xs text-stone-400">Avg Tech Salary</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {getCurrencySymbol(c2[0]?.currency || "EUR")}{(j2.avgSalaryTech / 1000).toFixed(0)}k
                        </p>
                      </div>
                    )}
                    {j2.avgWorkHoursWeek && (
                      <div>
                        <p className="text-xs text-stone-400">Work Week</p>
                        <p className="text-lg font-semibold text-stone-700">{j2.avgWorkHoursWeek}h</p>
                      </div>
                    )}
                    {j2.vacationDaysStandard && (
                      <div>
                        <p className="text-xs text-stone-400">Vacation Days</p>
                        <p className="text-lg font-semibold text-stone-700">{j2.vacationDaysStandard} days</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Cost Comparison */}
            <div>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                Rent (1BR City Center)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  {c1[0] && (
                    <p className="text-2xl font-bold text-emerald-600">
                      {getCurrencySymbol(c1[0].currency)}{c1[0].rent1BRCenter.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-stone-500">{c1[0]?.cityName || d1.name}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  {c2[0] && (
                    <p className="text-2xl font-bold text-emerald-600">
                      {getCurrencySymbol(c2[0].currency)}{c2[0].rent1BRCenter.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-stone-500">{c2[0]?.cityName || d2.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visas Section */}
        {activeSection === "visas" && (
          <div className="grid grid-cols-2 gap-3">
            {/* D1 Visas */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-400 text-center">{d1.name}</p>
              {v1.slice(0, 4).map((visa, i) => (
                <div key={i} className="bg-stone-50 rounded-lg p-3">
                  <p className="font-semibold text-stone-800 text-sm">{visa.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {visa.cost && (
                      <span className="text-xs text-stone-500">{visa.cost}</span>
                    )}
                    {visa.isWorkPermit && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Work</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* D2 Visas */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-400 text-center">{d2.name}</p>
              {v2.slice(0, 4).map((visa, i) => (
                <div key={i} className="bg-stone-50 rounded-lg p-3">
                  <p className="font-semibold text-stone-800 text-sm">{visa.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {visa.cost && (
                      <span className="text-xs text-stone-500">{visa.cost}</span>
                    )}
                    {visa.isWorkPermit && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Work</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Costs Section */}
        {activeSection === "costs" && (
          <div className="grid grid-cols-2 gap-3">
            {/* D1 Costs */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-400 text-center">{d1.name}</p>
              {c1.map((city, i) => (
                <div key={i} className="bg-stone-50 rounded-lg p-3">
                  <p className="font-semibold text-stone-800 text-sm">{city.cityName}</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    {getCurrencySymbol(city.currency)}{city.rent1BRCenter.toLocaleString()}
                    <span className="text-xs text-stone-400 font-normal">/mo</span>
                  </p>
                </div>
              ))}
            </div>

            {/* D2 Costs */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-400 text-center">{d2.name}</p>
              {c2.map((city, i) => (
                <div key={i} className="bg-stone-50 rounded-lg p-3">
                  <p className="font-semibold text-stone-800 text-sm">{city.cityName}</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    {getCurrencySymbol(city.currency)}{city.rent1BRCenter.toLocaleString()}
                    <span className="text-xs text-stone-400 font-normal">/mo</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-stone-200 p-4 bg-stone-50 flex gap-3">
        <a
          href={`/destinations/${d1.slug}`}
          className="flex-1 py-2 text-center bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          Explore {d1.name}
        </a>
        <a
          href={`/destinations/${d2.slug}`}
          className="flex-1 py-2 text-center bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          Explore {d2.name}
        </a>
      </div>
    </div>
  );
}
