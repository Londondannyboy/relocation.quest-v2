"use client";

interface ResidencyPathway {
  name: string;
  type?: string;
  minimum_income_monthly?: number;
  minimum_income_annual?: number;
  income_currency?: string;
  income_proof?: string;
  employment_type?: string;
  requires_job_offer?: boolean;
  employer_sponsor?: boolean;
  initial_duration_months?: number;
  renewable?: boolean;
  max_duration_years?: number;
  path_to_pr?: boolean;
  years_to_pr?: number;
  path_to_citizenship?: boolean;
  years_to_citizenship?: number;
  processing_time_weeks?: number;
  processing_time_months?: number;
  application_fee?: number;
  health_insurance_required?: boolean;
  health_insurance_min_coverage?: number;
  clean_criminal_record?: boolean;
  can_bring_family?: boolean;
  family_income_addition?: string;
  deposit_required?: { amount: number; currency: string; note?: string };
  investment_options?: { type: string; minimum: number; currency: string }[];
  valid_for?: string;
}

interface CitizenshipInfo {
  available: boolean;
  years_residency_required?: number;
  continuous_residency_last_year?: boolean;
  language_requirement?: string;
  citizenship_test?: boolean;
  dual_citizenship_allowed?: boolean;
  citizenship_by_investment?: boolean;
  citizenship_by_investment_note?: string;
  naturalization_fee?: number;
}

interface ResidencyRequirementsProps {
  country: string;
  flag: string;
  pathways?: ResidencyPathway[];
  citizenship?: CitizenshipInfo;
  physical_presence_requirement?: { days_per_year?: number; note?: string };
  eu_benefits?: { schengen_access?: boolean; work_in_eu?: boolean; note?: string };
}

export function ResidencyRequirements({
  country,
  flag,
  pathways,
  citizenship,
  physical_presence_requirement,
  eu_benefits,
}: ResidencyRequirementsProps) {
  const hasData = (pathways && pathways.length > 0) || citizenship;

  if (!hasData) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          {flag} Residency in {country}
        </h3>
        <p className="text-white/60">Residency information coming soon.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
      <h3 className="text-xl font-semibold text-white">
        {flag} Residency & Citizenship - {country}
      </h3>

      {/* EU Benefits Badge */}
      {eu_benefits && (eu_benefits.schengen_access || eu_benefits.work_in_eu) && (
        <div className="flex flex-wrap gap-2">
          {eu_benefits.schengen_access && (
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
              🇪🇺 Schengen Access
            </span>
          )}
          {eu_benefits.work_in_eu && (
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
              🇪🇺 Work in EU
            </span>
          )}
        </div>
      )}

      {/* Residency Pathways */}
      {pathways && pathways.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/70 mb-4">Residency Pathways</h4>
          <div className="space-y-4">
            {pathways.map((pathway, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-white">{pathway.name}</h5>
                    {pathway.type && (
                      <span className="text-xs text-white/50 uppercase">{pathway.type}</span>
                    )}
                  </div>
                  {pathway.processing_time_weeks && (
                    <div className="text-sm text-white/60">
                      ~{pathway.processing_time_weeks} weeks processing
                    </div>
                  )}
                  {pathway.processing_time_months && !pathway.processing_time_weeks && (
                    <div className="text-sm text-white/60">
                      ~{pathway.processing_time_months} months processing
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {pathway.minimum_income_monthly && (
                    <div>
                      <div className="text-xs text-white/50">Min. Monthly Income</div>
                      <div className="font-medium text-white">
                        {formatCurrency(pathway.minimum_income_monthly, pathway.income_currency)}
                      </div>
                    </div>
                  )}
                  {pathway.minimum_income_annual && (
                    <div>
                      <div className="text-xs text-white/50">Min. Annual Income</div>
                      <div className="font-medium text-white">
                        {formatCurrency(pathway.minimum_income_annual, pathway.income_currency)}
                      </div>
                    </div>
                  )}
                  {pathway.initial_duration_months && (
                    <div>
                      <div className="text-xs text-white/50">Initial Duration</div>
                      <div className="font-medium text-white">
                        {pathway.initial_duration_months} months
                      </div>
                    </div>
                  )}
                  {pathway.application_fee !== undefined && (
                    <div>
                      <div className="text-xs text-white/50">Application Fee</div>
                      <div className="font-medium text-white">
                        {pathway.application_fee === 0 ? 'Free' : formatCurrency(pathway.application_fee, pathway.income_currency)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Investment Options */}
                {pathway.investment_options && pathway.investment_options.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-white/50 mb-1">Investment Options</div>
                    <div className="flex flex-wrap gap-2">
                      {pathway.investment_options.map((opt, j) => (
                        <span key={j} className="px-2 py-1 bg-white/10 rounded text-sm text-white">
                          {opt.type}: {formatCurrency(opt.minimum, opt.currency)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pathway Features */}
                <div className="flex flex-wrap gap-3 text-sm">
                  {pathway.path_to_pr && (
                    <span className="text-green-400">
                      ✓ Path to PR {pathway.years_to_pr && `(${pathway.years_to_pr}y)`}
                    </span>
                  )}
                  {pathway.path_to_citizenship && (
                    <span className="text-green-400">
                      ✓ Path to Citizenship {pathway.years_to_citizenship && `(${pathway.years_to_citizenship}y)`}
                    </span>
                  )}
                  {pathway.can_bring_family && (
                    <span className="text-blue-400">✓ Family Included</span>
                  )}
                  {pathway.renewable && (
                    <span className="text-white/60">✓ Renewable</span>
                  )}
                  {pathway.requires_job_offer && (
                    <span className="text-yellow-400">⚠ Job Offer Required</span>
                  )}
                  {pathway.employer_sponsor && (
                    <span className="text-yellow-400">⚠ Employer Sponsor</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citizenship */}
      {citizenship && (
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-white/70 mb-3">Citizenship</h4>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              {citizenship.years_residency_required && (
                <div>
                  <div className="text-xs text-white/50">Years Required</div>
                  <div className="text-xl font-bold text-white">{citizenship.years_residency_required}</div>
                </div>
              )}
              {citizenship.language_requirement && (
                <div>
                  <div className="text-xs text-white/50">Language</div>
                  <div className="font-medium text-white">{citizenship.language_requirement}</div>
                </div>
              )}
              {citizenship.naturalization_fee !== undefined && (
                <div>
                  <div className="text-xs text-white/50">Naturalization Fee</div>
                  <div className="font-medium text-white">{formatCurrency(citizenship.naturalization_fee)}</div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              {citizenship.dual_citizenship_allowed && (
                <span className="text-green-400">✓ Dual Citizenship Allowed</span>
              )}
              {citizenship.citizenship_test && (
                <span className="text-yellow-400">⚠ Citizenship Test Required</span>
              )}
              {citizenship.continuous_residency_last_year && (
                <span className="text-white/60">Continuous residency required in final year</span>
              )}
            </div>

            {citizenship.citizenship_by_investment_note && (
              <p className="text-sm text-white/50 mt-2">{citizenship.citizenship_by_investment_note}</p>
            )}
          </div>
        </div>
      )}

      {/* Physical Presence */}
      {physical_presence_requirement && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/70">
            <span>📍</span>
            <span>
              Physical Presence: {physical_presence_requirement.days_per_year && `${physical_presence_requirement.days_per_year} days/year`}
              {physical_presence_requirement.note && ` - ${physical_presence_requirement.note}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResidencyRequirements;
