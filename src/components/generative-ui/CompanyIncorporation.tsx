"use client";

interface CompanyType {
  name: string;
  local_name?: string;
  min_directors: number;
  min_shareholders: number;
  local_director_required: boolean;
  local_secretary_required?: boolean;
  audit_required?: boolean;
  common_use?: string;
}

interface CostRange {
  min: number;
  max: number;
  currency: string;
  note?: string;
}

interface CompanyIncorporationProps {
  country: string;
  flag: string;
  corporateTaxRate?: number;
  effectiveTaxRateWithIncentives?: number;
  minimumShareCapital?: CostRange;
  incorporationTimeDays?: number;
  incorporationCostRange?: CostRange;
  annualComplianceCost?: CostRange;
  companyTypes?: CompanyType[];
  vatRegistrationThreshold?: number;
  standardVatRate?: number;
  ipBoxRegime?: boolean;
  ipBoxRate?: number;
  ipBoxDetails?: string;
  holdingCompanyBenefits?: string[];
  notionalInterestDeduction?: boolean;
  notionalInterestRate?: number;
  tonnageTaxAvailable?: boolean;
  tonnageTaxDetails?: string;
  bankAccountOpeningTime?: string;
  nomineeServicesAvailable?: boolean;
}

/**
 * Company incorporation component
 * Shows tax rates, setup costs, company types, and business benefits
 */
export function CompanyIncorporation({
  country,
  flag,
  corporateTaxRate,
  effectiveTaxRateWithIncentives,
  minimumShareCapital,
  incorporationTimeDays,
  incorporationCostRange,
  annualComplianceCost,
  companyTypes,
  vatRegistrationThreshold,
  standardVatRate,
  ipBoxRegime,
  ipBoxRate,
  ipBoxDetails,
  holdingCompanyBenefits,
  notionalInterestDeduction,
  notionalInterestRate,
  tonnageTaxAvailable,
  tonnageTaxDetails,
  bankAccountOpeningTime,
  nomineeServicesAvailable,
}: CompanyIncorporationProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* Header with Tax Rate Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Business in {country} {flag}</h2>
              <p className="text-white/80 text-sm">Company incorporation & tax</p>
            </div>
          </div>
          {corporateTaxRate !== undefined && (
            <div className="text-right">
              <p className="text-4xl font-bold text-white">{corporateTaxRate}%</p>
              <p className="text-white/80 text-sm">Corporate Tax</p>
              {effectiveTaxRateWithIncentives !== undefined && effectiveTaxRateWithIncentives < corporateTaxRate && (
                <p className="text-emerald-200 text-xs mt-1">
                  As low as {effectiveTaxRateWithIncentives}% with IP Box
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-stone-200">
        {incorporationTimeDays && (
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{incorporationTimeDays} days</p>
            <p className="text-xs text-stone-500">Setup Time</p>
          </div>
        )}
        {incorporationCostRange && (
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-600">
              {formatCurrency(incorporationCostRange.min, incorporationCostRange.currency)}+
            </p>
            <p className="text-xs text-stone-500">Setup Cost</p>
          </div>
        )}
        {standardVatRate !== undefined && (
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-600">{standardVatRate}%</p>
            <p className="text-xs text-stone-500">VAT Rate</p>
          </div>
        )}
        {vatRegistrationThreshold && (
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(vatRegistrationThreshold, "EUR")}</p>
            <p className="text-xs text-stone-500">VAT Threshold</p>
          </div>
        )}
      </div>

      {/* Company Types */}
      {companyTypes && companyTypes.length > 0 && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Company Types
          </h3>
          <div className="space-y-3">
            {companyTypes.map((type, index) => (
              <div key={index} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-stone-800">{type.name}</h4>
                    {type.local_name && (
                      <p className="text-sm text-stone-500 italic">{type.local_name}</p>
                    )}
                  </div>
                  {type.common_use && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {type.common_use}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-stone-600">{type.min_directors} director(s)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-stone-600">{type.min_shareholders} shareholder(s)</span>
                  </div>
                  {!type.local_director_required && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      No local director required
                    </span>
                  )}
                  {type.audit_required && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                      Audit required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax Incentives */}
      {(ipBoxRegime || holdingCompanyBenefits?.length || notionalInterestDeduction || tonnageTaxAvailable) && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tax Incentives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ipBoxRegime && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">IP BOX</span>
                  {ipBoxRate && <span className="text-lg font-bold text-purple-700">{ipBoxRate}%</span>}
                </div>
                <p className="text-sm text-purple-800 font-medium">Intellectual Property Regime</p>
                {ipBoxDetails && <p className="text-xs text-purple-600 mt-1">{ipBoxDetails}</p>}
              </div>
            )}
            {notionalInterestDeduction && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">NID</span>
                  {notionalInterestRate && <span className="text-lg font-bold text-blue-700">{notionalInterestRate}%</span>}
                </div>
                <p className="text-sm text-blue-800 font-medium">Notional Interest Deduction</p>
                <p className="text-xs text-blue-600 mt-1">Deduction on equity financing</p>
              </div>
            )}
            {tonnageTaxAvailable && (
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
                <span className="px-2 py-1 bg-teal-500 text-white text-xs font-bold rounded">TONNAGE TAX</span>
                <p className="text-sm text-teal-800 font-medium mt-2">Shipping Tax Regime</p>
                {tonnageTaxDetails && <p className="text-xs text-teal-600 mt-1">{tonnageTaxDetails}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Holding Company Benefits */}
      {holdingCompanyBenefits && holdingCompanyBenefits.length > 0 && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Holding Company Benefits
          </h3>
          <div className="space-y-2">
            {holdingCompanyBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-stone-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="p-6 bg-stone-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {minimumShareCapital && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Min. Share Capital</p>
              <p className="text-sm font-semibold text-stone-700">
                {minimumShareCapital.min === 0 ? "No minimum" : formatCurrency(minimumShareCapital.min, minimumShareCapital.currency)}
              </p>
              {minimumShareCapital.note && (
                <p className="text-xs text-stone-500">{minimumShareCapital.note}</p>
              )}
            </div>
          )}
          {annualComplianceCost && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Annual Compliance</p>
              <p className="text-sm font-semibold text-stone-700">
                {formatCurrency(annualComplianceCost.min, annualComplianceCost.currency)} - {formatCurrency(annualComplianceCost.max, annualComplianceCost.currency)}
              </p>
            </div>
          )}
          {bankAccountOpeningTime && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Bank Account</p>
              <p className="text-sm font-semibold text-stone-700">{bankAccountOpeningTime}</p>
            </div>
          )}
          {nomineeServicesAvailable !== undefined && (
            <div>
              <p className="text-xs text-stone-500 mb-1">Nominee Services</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                nomineeServicesAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
              }`}>
                {nomineeServicesAvailable ? "Available" : "Not Available"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
