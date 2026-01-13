"use client";

interface CapitalGainsTax {
  rate: number;
  exemptions?: string[];
}

interface AvgPriceSqm {
  city_center?: number;
  suburbs?: number;
  prime_areas?: number;
  coastal?: number;
  currency?: string;
}

interface PropertyInfoProps {
  country: string;
  flag: string;
  foreignersCanBuy?: boolean;
  restrictions?: string[];
  propertyTaxAnnual?: {
    immovable_property_tax?: string;
    municipal_taxes?: { rate: string; basis: string };
    sewerage_tax?: { rate: string; typical: string };
  };
  transferTax?: {
    rates?: Array<{ threshold?: number; above?: number; rate: number }>;
    vat_alternative?: number;
    note?: string;
  };
  stampDuty?: { rate: string; max?: number };
  capitalGainsTax?: CapitalGainsTax;
  mortgageAvailability?: boolean;
  typicalLtv?: { eu_citizens?: number; non_eu?: number };
  mortgageInterestRates?: { min: number; max: number; type: string };
  avgPriceSqm?: AvgPriceSqm;
  rentalYield?: { typical: string; prime?: string };
  propertyBuyingProcessWeeks?: string;
  titleDeedSystem?: string;
}

/**
 * Property information component
 * Shows prices, taxes, foreign ownership rules, and buying process
 */
export function PropertyInfo({
  country,
  flag,
  foreignersCanBuy,
  restrictions,
  propertyTaxAnnual,
  transferTax,
  stampDuty,
  capitalGainsTax,
  mortgageAvailability,
  typicalLtv,
  mortgageInterestRates,
  avgPriceSqm,
  rentalYield,
  propertyBuyingProcessWeeks,
  titleDeedSystem,
}: PropertyInfoProps) {
  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Extract price data from avgPriceSqm
  const priceLocations: [string, number][] = avgPriceSqm
    ? [
        ["city_center", avgPriceSqm.city_center],
        ["suburbs", avgPriceSqm.suburbs],
        ["prime_areas", avgPriceSqm.prime_areas],
        ["coastal", avgPriceSqm.coastal],
      ].filter((entry): entry is [string, number] => typeof entry[1] === "number")
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Property in {country} {flag}</h2>
              <p className="text-white/80 text-sm">Real estate, taxes & ownership</p>
            </div>
          </div>
          {foreignersCanBuy !== undefined && (
            <div className={`px-4 py-2 rounded-xl ${foreignersCanBuy ? "bg-green-500/30" : "bg-red-500/30"}`}>
              <p className="text-white font-semibold text-sm">
                {foreignersCanBuy ? "Foreigners Can Buy" : "Restrictions Apply"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price per sqm grid */}
      {priceLocations.length > 0 && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Average Price per m²
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {priceLocations.map(([location, price]) => {
              const locationName = location
                .replace(/_/g, " ")
                .replace(/center/gi, "Center")
                .replace(/suburbs/gi, "Suburbs");
              return (
                <div key={location} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <p className="text-sm text-stone-500 capitalize">{locationName}</p>
                  <p className="text-xl font-bold text-stone-800">
                    {formatCurrency(price, avgPriceSqm?.currency || "EUR")}/m²
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Taxes Section */}
      <div className="p-6 border-b border-stone-200">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
          Property Taxes & Fees
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transfer Tax */}
          {transferTax && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-sm text-red-700 font-medium mb-2">Transfer Tax</p>
              {transferTax.rates && (
                <div className="space-y-1">
                  {transferTax.rates.map((bracket, i) => (
                    <p key={i} className="text-sm text-red-800">
                      {bracket.threshold ? `Up to ${formatCurrency(bracket.threshold)}: ` : `Above ${formatCurrency(bracket.above || 0)}: `}
                      <span className="font-bold">{bracket.rate}%</span>
                    </p>
                  ))}
                </div>
              )}
              {transferTax.vat_alternative && (
                <p className="text-xs text-red-600 mt-2">Or {transferTax.vat_alternative}% VAT for new properties</p>
              )}
            </div>
          )}

          {/* Capital Gains Tax */}
          {capitalGainsTax && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-700 font-medium">Capital Gains Tax</p>
              <p className="text-2xl font-bold text-amber-800">{capitalGainsTax.rate}%</p>
              {capitalGainsTax.exemptions && capitalGainsTax.exemptions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-amber-600 mb-1">Exemptions:</p>
                  {capitalGainsTax.exemptions.slice(0, 2).map((ex, i) => (
                    <p key={i} className="text-xs text-amber-700">• {ex}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Annual Property Tax */}
          {propertyTaxAnnual && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-sm text-orange-700 font-medium">Annual Property Tax</p>
              {propertyTaxAnnual.immovable_property_tax && (
                <p className="text-sm text-orange-800 font-semibold">{propertyTaxAnnual.immovable_property_tax}</p>
              )}
              {propertyTaxAnnual.municipal_taxes && (
                <p className="text-xs text-orange-600 mt-1">
                  Municipal: {propertyTaxAnnual.municipal_taxes.rate}
                </p>
              )}
              {propertyTaxAnnual.sewerage_tax?.typical && (
                <p className="text-xs text-orange-600">
                  Sewerage: ~{propertyTaxAnnual.sewerage_tax.typical}
                </p>
              )}
            </div>
          )}

          {/* Stamp Duty */}
          {stampDuty && (
            <div className="bg-stone-100 rounded-xl p-4 border border-stone-200">
              <p className="text-sm text-stone-700 font-medium">Stamp Duty</p>
              <p className="text-lg font-bold text-stone-800">{stampDuty.rate}</p>
              {stampDuty.max && (
                <p className="text-xs text-stone-500">Max: {formatCurrency(stampDuty.max)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mortgage Info */}
      {mortgageAvailability && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Mortgage Financing
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {typicalLtv?.eu_citizens && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-700">EU Citizens LTV</p>
                <p className="text-2xl font-bold text-blue-800">{typicalLtv.eu_citizens}%</p>
              </div>
            )}
            {typicalLtv?.non_eu && (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-indigo-700">Non-EU LTV</p>
                <p className="text-2xl font-bold text-indigo-800">{typicalLtv.non_eu}%</p>
              </div>
            )}
            {mortgageInterestRates && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm text-purple-700">Interest Rate ({mortgageInterestRates.type})</p>
                <p className="text-xl font-bold text-purple-800">
                  {mortgageInterestRates.min}% - {mortgageInterestRates.max}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restrictions */}
      {restrictions && restrictions.length > 0 && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Ownership Restrictions
          </h3>
          <div className="space-y-2">
            {restrictions.map((restriction, index) => (
              <div key={index} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-stone-600">{restriction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 bg-stone-50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rentalYield && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Rental Yield</p>
              <p className="text-sm font-semibold text-stone-700">{rentalYield.typical}</p>
              {rentalYield.prime && <p className="text-xs text-stone-500">Prime: {rentalYield.prime}</p>}
            </div>
          )}
          {propertyBuyingProcessWeeks && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Buying Process</p>
              <p className="text-sm font-semibold text-stone-700">{propertyBuyingProcessWeeks} weeks</p>
            </div>
          )}
          {titleDeedSystem && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Title Deed System</p>
              <p className="text-sm font-semibold text-stone-700">{titleDeedSystem}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
