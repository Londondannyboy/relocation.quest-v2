"use client";

interface CityData {
  cityName: string;
  rent1BRCenter: number;
  rent1BROutside?: number;
  rent3BRCenter?: number;
  utilities: number;
  groceries: number;
  transportation: number;
  dining: number;
  costIndex?: number;
  currency: string;
}

interface CostOfLivingChartProps {
  country: string;
  flag: string;
  cities: CityData[];
  job_market?: {
    avgSalaryTech?: number;
    avgWorkHoursWeek?: number;
    vacationDaysStandard?: number;
    topIndustries?: string[];
    growingSectors?: string[];
  };
}

/**
 * Beautiful cost of living visualization
 * Shows city-by-city breakdown with visual bars
 */
export function CostOfLivingChart({
  country,
  flag,
  cities,
  job_market,
}: CostOfLivingChartProps) {
  // Find max rent for scaling bars
  const maxRent = Math.max(...cities.map(c => c.rent1BRCenter));

  // Currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "USD": return "$";
      case "NZD": return "NZ$";
      case "THB": return "฿";
      default: return currency;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{flag}</span>
          <div>
            <h2 className="text-xl font-bold text-white">Cost of Living</h2>
            <p className="text-emerald-100 text-sm">{country} • {cities.length} cities</p>
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="p-4 space-y-4">
        {cities.map((city, index) => {
          const symbol = getCurrencySymbol(city.currency);
          const rentPercentage = (city.rent1BRCenter / maxRent) * 100;
          const totalMonthly = city.rent1BRCenter + city.utilities + city.groceries + city.transportation + city.dining;

          return (
            <div key={index} className="bg-stone-50 rounded-xl p-4">
              {/* City Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <h3 className="font-bold text-stone-800">{city.cityName}</h3>
                </div>
                {city.costIndex && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    city.costIndex < 50 ? "bg-green-100 text-green-700" :
                    city.costIndex < 70 ? "bg-yellow-100 text-yellow-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    Index: {city.costIndex}
                  </span>
                )}
              </div>

              {/* Rent Bar Visualization */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-stone-500">1BR City Center</span>
                  <span className="font-bold text-stone-800">{symbol}{city.rent1BRCenter.toLocaleString()}/mo</span>
                </div>
                <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${rentPercentage}%` }}
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white rounded-lg p-2">
                  <span className="text-lg">🏠</span>
                  <p className="text-xs text-stone-400 mt-1">Utilities</p>
                  <p className="text-sm font-semibold text-stone-700">{symbol}{city.utilities}</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <span className="text-lg">🛒</span>
                  <p className="text-xs text-stone-400 mt-1">Groceries</p>
                  <p className="text-sm font-semibold text-stone-700">{symbol}{city.groceries}</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <span className="text-lg">🚇</span>
                  <p className="text-xs text-stone-400 mt-1">Transport</p>
                  <p className="text-sm font-semibold text-stone-700">{symbol}{city.transportation}</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <span className="text-lg">🍽️</span>
                  <p className="text-xs text-stone-400 mt-1">Dining</p>
                  <p className="text-sm font-semibold text-stone-700">{symbol}{city.dining}</p>
                </div>
              </div>

              {/* Total */}
              <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between">
                <span className="text-sm text-stone-500">Estimated Monthly Total</span>
                <span className="text-lg font-bold text-emerald-600">
                  {symbol}{totalMonthly.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Market Section */}
      {job_market && (
        <div className="border-t border-stone-200 p-4 bg-stone-50">
          <h3 className="font-semibold text-stone-800 mb-3">Job Market</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {job_market.avgSalaryTech && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-2xl font-bold text-emerald-600">
                  {getCurrencySymbol(cities[0]?.currency || "EUR")}{(job_market.avgSalaryTech / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-stone-500">Avg Tech Salary</p>
              </div>
            )}
            {job_market.avgWorkHoursWeek && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">{job_market.avgWorkHoursWeek}h</p>
                <p className="text-xs text-stone-500">Work Week</p>
              </div>
            )}
            {job_market.vacationDaysStandard && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600">{job_market.vacationDaysStandard}</p>
                <p className="text-xs text-stone-500">Vacation Days</p>
              </div>
            )}
          </div>

          {/* Top Industries */}
          {job_market.topIndustries && job_market.topIndustries.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-stone-400 mb-2">Top Industries</p>
              <div className="flex flex-wrap gap-1">
                {job_market.topIndustries.slice(0, 5).map((ind, i) => (
                  <span key={i} className="px-2 py-1 bg-white text-stone-600 text-xs rounded-full border border-stone-200">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
