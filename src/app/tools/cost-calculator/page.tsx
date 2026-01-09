"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CityData {
  cityName: string;
  currency: string;
  costIndex: number;
  rent1BRCenter: number;
  rent1BROutside: number;
  rent3BRCenter: number;
  groceries: number;
  utilities: number;
  transportation: number;
  dining: number;
}

interface Destination {
  slug: string;
  country_name: string;
  flag: string;
  cost_of_living: CityData[];
}

const LIFESTYLE_PRESETS = {
  budget: { name: "Budget", multiplier: 0.7, description: "Minimal spending, cook at home" },
  moderate: { name: "Moderate", multiplier: 1.0, description: "Balanced lifestyle" },
  comfortable: { name: "Comfortable", multiplier: 1.3, description: "Dining out, entertainment" },
  luxury: { name: "Luxury", multiplier: 1.8, description: "Premium living" },
};

export default function CostCalculatorPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [lifestyle, setLifestyle] = useState<keyof typeof LIFESTYLE_PRESETS>("moderate");
  const [loading, setLoading] = useState(true);

  // User's current expenses for comparison
  const [currentExpenses, setCurrentExpenses] = useState({
    rent: 2000,
    groceries: 400,
    utilities: 150,
    transportation: 100,
    dining: 300,
  });

  // Fetch destinations on mount
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/destinations");
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

  // Update city data when selection changes
  useEffect(() => {
    if (selectedDest && selectedCity) {
      const dest = destinations.find(d => d.slug === selectedDest);
      if (dest?.cost_of_living) {
        const cities = typeof dest.cost_of_living === "string"
          ? JSON.parse(dest.cost_of_living)
          : dest.cost_of_living;
        const city = cities.find((c: CityData) => c.cityName === selectedCity);
        setCityData(city || null);
      }
    }
  }, [selectedDest, selectedCity, destinations]);

  // Get cities for selected destination
  const getCities = (): CityData[] => {
    const dest = destinations.find(d => d.slug === selectedDest);
    if (!dest?.cost_of_living) return [];
    return typeof dest.cost_of_living === "string"
      ? JSON.parse(dest.cost_of_living)
      : dest.cost_of_living;
  };

  // Calculate monthly total with lifestyle multiplier
  const calculateMonthly = (data: CityData) => {
    const mult = LIFESTYLE_PRESETS[lifestyle].multiplier;
    return Math.round(
      data.rent1BRCenter +
      (data.groceries * mult) +
      data.utilities +
      data.transportation +
      (data.dining * mult)
    );
  };

  // Calculate current expenses total
  const currentTotal = Object.values(currentExpenses).reduce((a, b) => a + b, 0);

  // Calculate savings/difference
  const getSavings = () => {
    if (!cityData) return 0;
    const newTotal = calculateMonthly(cityData);
    return currentTotal - newTotal;
  };

  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Cost of Living Calculator</h1>
          <p className="text-white/90 text-lg">
            Compare living costs across destinations and plan your budget
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Selection Panel */}
          <div className="md:col-span-1 space-y-6">
            {/* Destination Selector */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-stone-800 mb-4">Select Destination</h2>
              <select
                value={selectedDest}
                onChange={(e) => {
                  setSelectedDest(e.target.value);
                  setSelectedCity("");
                  setCityData(null);
                }}
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Choose a country...</option>
                {destinations.map((dest) => (
                  <option key={dest.slug} value={dest.slug}>
                    {dest.flag} {dest.country_name}
                  </option>
                ))}
              </select>

              {/* City Selector */}
              {selectedDest && (
                <div className="mt-4">
                  <label className="block text-sm text-stone-600 mb-2">Select City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Choose a city...</option>
                    {getCities().map((city) => (
                      <option key={city.cityName} value={city.cityName}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Lifestyle Selector */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-stone-800 mb-4">Lifestyle</h2>
              <div className="space-y-2">
                {Object.entries(LIFESTYLE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => setLifestyle(key as keyof typeof LIFESTYLE_PRESETS)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      lifestyle === key
                        ? "bg-amber-100 border-2 border-amber-500"
                        : "bg-stone-50 border-2 border-transparent hover:border-stone-200"
                    }`}
                  >
                    <div className="font-medium text-stone-800">{preset.name}</div>
                    <div className="text-sm text-stone-500">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Expenses */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-stone-800 mb-4">Your Current Expenses (USD)</h2>
              <div className="space-y-3">
                {Object.entries(currentExpenses).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm text-stone-600 mb-1 capitalize">{key}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setCurrentExpenses(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value) || 0
                      }))}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
                <div className="pt-3 border-t border-stone-200">
                  <div className="flex justify-between font-semibold">
                    <span>Current Total</span>
                    <span className="text-amber-600">${currentTotal.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results Panel */}
          <div className="md:col-span-2">
            {cityData ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">{cityData.cityName}</h2>
                      <p className="text-stone-500">Cost Index: {cityData.costIndex}/100</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-amber-600">
                        {formatCurrency(calculateMonthly(cityData), cityData.currency)}
                      </div>
                      <div className="text-sm text-stone-500">per month</div>
                    </div>
                  </div>

                  {/* Savings Indicator */}
                  <div className={`p-4 rounded-lg ${getSavings() > 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center justify-between">
                      <span className={getSavings() > 0 ? "text-green-700" : "text-red-700"}>
                        {getSavings() > 0 ? "You could save" : "Additional cost"}
                      </span>
                      <span className={`text-xl font-bold ${getSavings() > 0 ? "text-green-600" : "text-red-600"}`}>
                        ${Math.abs(getSavings()).toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="text-sm mt-1 text-stone-600">
                      That&apos;s ${Math.abs(getSavings() * 12).toLocaleString()} per year
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">Monthly Cost Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Rent (1BR Center)", value: cityData.rent1BRCenter, icon: "🏠" },
                      { label: "Rent (1BR Outside)", value: cityData.rent1BROutside, icon: "🏡" },
                      { label: "Rent (3BR Center)", value: cityData.rent3BRCenter, icon: "🏢" },
                      { label: "Groceries", value: Math.round(cityData.groceries * LIFESTYLE_PRESETS[lifestyle].multiplier), icon: "🛒" },
                      { label: "Utilities", value: cityData.utilities, icon: "💡" },
                      { label: "Transportation", value: cityData.transportation, icon: "🚌" },
                      { label: "Dining Out", value: Math.round(cityData.dining * LIFESTYLE_PRESETS[lifestyle].multiplier), icon: "🍽️" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-stone-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-stone-100 rounded-full h-2">
                            <div
                              className="bg-amber-500 h-2 rounded-full"
                              style={{ width: `${Math.min((item.value / 2500) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="font-medium text-stone-800 w-24 text-right">
                            {formatCurrency(item.value, cityData.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Comparison */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">Other Cities in {destinations.find(d => d.slug === selectedDest)?.country_name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getCities().map((city) => (
                      <button
                        key={city.cityName}
                        onClick={() => setSelectedCity(city.cityName)}
                        className={`p-4 rounded-lg text-left transition-all ${
                          selectedCity === city.cityName
                            ? "bg-amber-100 border-2 border-amber-500"
                            : "bg-stone-50 border-2 border-transparent hover:border-amber-200"
                        }`}
                      >
                        <div className="font-medium text-stone-800">{city.cityName}</div>
                        <div className="text-lg font-bold text-amber-600">
                          {formatCurrency(calculateMonthly(city), city.currency)}/mo
                        </div>
                        <div className="text-xs text-stone-500">Cost index: {city.costIndex}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-stone-800 mb-2">Select a Destination</h3>
                <p className="text-stone-500 max-w-md mx-auto">
                  Choose a country and city from the panel on the left to see detailed cost of living information and compare with your current expenses.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
