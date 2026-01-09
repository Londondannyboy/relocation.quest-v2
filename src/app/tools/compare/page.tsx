"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CityData {
  cityName: string;
  currency: string;
  costIndex: number;
  rent1BRCenter: number;
  rent1BROutside: number;
  groceries: number;
  utilities: number;
  transportation: number;
  dining: number;
}

interface Visa {
  name: string;
  type?: string;
  duration?: string;
  cost?: string;
  processingTime?: string;
  requirements?: string[];
  isWorkPermit?: boolean;
  isResidencyPath?: boolean;
}

interface JobMarket {
  avgSalaryTech?: number;
  avgWorkHoursWeek?: number;
  vacationDaysStandard?: number;
  topIndustries?: string[];
  remoteFriendly?: boolean;
  workCulture?: string;
}

interface Destination {
  slug: string;
  country_name: string;
  flag: string;
  region: string;
  language?: string;
  hero_image_url?: string;
  hero_subtitle?: string;
  visas?: Visa[] | string;
  cost_of_living?: CityData[] | string;
  job_market?: JobMarket | string;
}

type TabType = "overview" | "visas" | "costs" | "jobs";

export default function ComparePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [dest1, setDest1] = useState<string>("");
  const [dest2, setDest2] = useState<string>("");
  const [data1, setData1] = useState<Destination | null>(null);
  const [data2, setData2] = useState<Destination | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);

  // Fetch all destinations on mount
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/destinations?limit=50");
        const data = await res.json();
        setDestinations(data.destinations || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  // Fetch full destination data when selection changes
  useEffect(() => {
    async function fetchDestData(slug: string, setter: (d: Destination | null) => void) {
      if (!slug) {
        setter(null);
        return;
      }
      try {
        const res = await fetch(`/api/destinations/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setter(data);
        }
      } catch (error) {
        console.error("Failed to fetch destination:", error);
      }
    }
    fetchDestData(dest1, setData1);
    fetchDestData(dest2, setData2);
  }, [dest1, dest2]);

  // Parse JSON strings if needed
  const parseJson = <T,>(data: T | string | undefined): T | undefined => {
    if (!data) return undefined;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return undefined;
      }
    }
    return data;
  };

  const getCities = (dest: Destination | null): CityData[] => {
    if (!dest) return [];
    return parseJson<CityData[]>(dest.cost_of_living) || [];
  };

  const getVisas = (dest: Destination | null): Visa[] => {
    if (!dest) return [];
    return parseJson<Visa[]>(dest.visas) || [];
  };

  const getJobMarket = (dest: Destination | null): JobMarket | undefined => {
    if (!dest) return undefined;
    return parseJson<JobMarket>(dest.job_market);
  };

  const formatCurrency = (amount: number, currency: string = "EUR") => {
    const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Get cheapest city for comparison
  const getCheapestCity = (dest: Destination | null): CityData | null => {
    const cities = getCities(dest);
    if (cities.length === 0) return null;
    return cities.reduce((a, b) => a.rent1BRCenter < b.rent1BRCenter ? a : b);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🌍" },
    { id: "visas", label: "Visas", icon: "📋" },
    { id: "costs", label: "Costs", icon: "💰" },
    { id: "jobs", label: "Jobs", icon: "💼" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/tools" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Destination Comparison</h1>
          <p className="text-white/90 text-lg">
            Compare two destinations side-by-side on visas, costs, and lifestyle
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Selection Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Destination 1 */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                First Destination
              </label>
              <select
                value={dest1}
                onChange={(e) => setDest1(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a country...</option>
                {destinations.filter(d => d.slug !== dest2).map((dest) => (
                  <option key={dest.slug} value={dest.slug}>
                    {dest.flag} {dest.country_name}
                  </option>
                ))}
              </select>
            </div>

            {/* VS */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <div className="bg-indigo-100 text-indigo-600 font-bold px-4 py-2 rounded-full">
                VS
              </div>
            </div>

            {/* Destination 2 */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Second Destination
              </label>
              <select
                value={dest2}
                onChange={(e) => setDest2(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a country...</option>
                {destinations.filter(d => d.slug !== dest1).map((dest) => (
                  <option key={dest.slug} value={dest.slug}>
                    {dest.flag} {dest.country_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Results */}
        {data1 && data2 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header with flags */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{data1.flag}</span>
                  <div>
                    <h3 className="font-bold text-white text-xl">{data1.country_name}</h3>
                    <p className="text-white/80 text-sm">{data1.region}</p>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="text-white font-bold">VS</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h3 className="font-bold text-white text-xl">{data2.country_name}</h3>
                    <p className="text-white/80 text-sm">{data2.region}</p>
                  </div>
                  <span className="text-5xl">{data2.flag}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50"
                      : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[data1, data2].map((dest, idx) => {
                      const city = getCheapestCity(dest);
                      const jobs = getJobMarket(dest);
                      return (
                        <div key={idx} className="space-y-4">
                          <h4 className="font-semibold text-lg text-stone-800 border-b pb-2">
                            {dest?.flag} {dest?.country_name}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-stone-600">Region</span>
                              <span className="font-medium">{dest?.region}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-600">Language</span>
                              <span className="font-medium">{dest?.language || "Various"}</span>
                            </div>
                            {city && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-stone-600">Cheapest City</span>
                                  <span className="font-medium">{city.cityName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-stone-600">1BR Rent (Center)</span>
                                  <span className="font-medium text-amber-600">
                                    {formatCurrency(city.rent1BRCenter, city.currency)}/mo
                                  </span>
                                </div>
                              </>
                            )}
                            {jobs?.remoteFriendly !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-stone-600">Remote Friendly</span>
                                <span className={`font-medium ${jobs.remoteFriendly ? "text-green-600" : "text-stone-500"}`}>
                                  {jobs.remoteFriendly ? "Yes" : "Limited"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Visas Tab */}
              {activeTab === "visas" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {[data1, data2].map((dest, idx) => {
                    const visas = getVisas(dest);
                    return (
                      <div key={idx}>
                        <h4 className="font-semibold text-lg text-stone-800 mb-4 border-b pb-2">
                          {dest?.flag} {dest?.country_name}
                        </h4>
                        {visas.length > 0 ? (
                          <div className="space-y-3">
                            {visas.slice(0, 5).map((visa, vIdx) => (
                              <div key={vIdx} className="p-3 bg-stone-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-medium text-stone-800">{visa.name}</h5>
                                    {visa.duration && (
                                      <p className="text-sm text-stone-500">{visa.duration}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    {visa.isWorkPermit && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        Work
                                      </span>
                                    )}
                                    {visa.isResidencyPath && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                        PR Path
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {visa.cost && (
                                  <p className="text-sm text-amber-600 mt-1">{visa.cost}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-stone-500">No visa data available</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Costs Tab */}
              {activeTab === "costs" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[data1, data2].map((dest, idx) => {
                      const cities = getCities(dest);
                      const city = cities[0]; // Main city
                      return (
                        <div key={idx}>
                          <h4 className="font-semibold text-lg text-stone-800 mb-4 border-b pb-2">
                            {dest?.flag} {dest?.country_name}
                            {city && <span className="text-sm font-normal text-stone-500 ml-2">({city.cityName})</span>}
                          </h4>
                          {city ? (
                            <div className="space-y-3">
                              {[
                                { label: "1BR Rent (Center)", value: city.rent1BRCenter },
                                { label: "1BR Rent (Outside)", value: city.rent1BROutside },
                                { label: "Groceries", value: city.groceries },
                                { label: "Utilities", value: city.utilities },
                                { label: "Transportation", value: city.transportation },
                                { label: "Dining Out", value: city.dining },
                              ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center">
                                  <span className="text-stone-600">{item.label}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-20 bg-stone-100 rounded-full h-2">
                                      <div
                                        className="bg-indigo-500 h-2 rounded-full"
                                        style={{ width: `${Math.min((item.value / 2000) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <span className="font-medium w-20 text-right">
                                      {formatCurrency(item.value, city.currency)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              <div className="pt-3 mt-3 border-t border-stone-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-stone-800">Monthly Total</span>
                                  <span className="font-bold text-lg text-indigo-600">
                                    {formatCurrency(
                                      city.rent1BRCenter + city.groceries + city.utilities + city.transportation + city.dining,
                                      city.currency
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-stone-500">No cost data available</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Jobs Tab */}
              {activeTab === "jobs" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {[data1, data2].map((dest, idx) => {
                    const jobs = getJobMarket(dest);
                    return (
                      <div key={idx}>
                        <h4 className="font-semibold text-lg text-stone-800 mb-4 border-b pb-2">
                          {dest?.flag} {dest?.country_name}
                        </h4>
                        {jobs ? (
                          <div className="space-y-3">
                            {jobs.avgSalaryTech && (
                              <div className="flex justify-between">
                                <span className="text-stone-600">Avg Tech Salary</span>
                                <span className="font-medium">${jobs.avgSalaryTech.toLocaleString()}/yr</span>
                              </div>
                            )}
                            {jobs.avgWorkHoursWeek && (
                              <div className="flex justify-between">
                                <span className="text-stone-600">Work Hours/Week</span>
                                <span className="font-medium">{jobs.avgWorkHoursWeek}h</span>
                              </div>
                            )}
                            {jobs.vacationDaysStandard && (
                              <div className="flex justify-between">
                                <span className="text-stone-600">Vacation Days</span>
                                <span className="font-medium">{jobs.vacationDaysStandard} days</span>
                              </div>
                            )}
                            {jobs.topIndustries && jobs.topIndustries.length > 0 && (
                              <div>
                                <span className="text-stone-600 block mb-2">Top Industries</span>
                                <div className="flex flex-wrap gap-2">
                                  {jobs.topIndustries.map((ind, i) => (
                                    <span key={i} className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded">
                                      {ind}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {jobs.workCulture && (
                              <div className="pt-2">
                                <span className="text-stone-600 block mb-1">Work Culture</span>
                                <p className="text-sm text-stone-700">{jobs.workCulture}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-stone-500">No job market data available</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Links */}
            <div className="p-6 bg-stone-50 border-t border-stone-200">
              <div className="flex justify-center gap-4">
                {data1 && (
                  <Link
                    href={`/destinations/${data1.slug}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View {data1.country_name} Guide →
                  </Link>
                )}
                {data2 && (
                  <Link
                    href={`/destinations/${data2.slug}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View {data2.country_name} Guide →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Select Two Destinations</h3>
            <p className="text-stone-500 max-w-md mx-auto">
              Choose two countries from the dropdowns above to see a detailed side-by-side comparison of visas, costs, and job markets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
