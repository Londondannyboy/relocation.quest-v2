"use client";

interface ExpatriateBenefit {
  type: string;
  description: string;
  effective_tax?: string;
  duration?: string;
}

interface AdditionalIncentive {
  name: string;
  description: string;
  eligibility?: string;
}

interface ExpatriateSchemeProps {
  country: string;
  flag: string;
  name?: string;
  introduced_year?: number;
  eligibility?: string[];
  benefits?: ExpatriateBenefit[];
  duration_years?: number;
  application_required?: boolean;
  application_cost?: number;
  additional_incentives?: AdditionalIncentive[];
}

export function ExpatriateScheme({
  country,
  flag,
  name,
  introduced_year,
  eligibility,
  benefits,
  duration_years,
  application_required,
  application_cost,
  additional_incentives,
}: ExpatriateSchemeProps) {
  const hasData = name || (benefits && benefits.length > 0);

  if (!hasData) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          {flag} Expatriate Tax Schemes - {country}
        </h3>
        <p className="text-white/60">Expatriate scheme information coming soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {flag} {name || `${country} Expatriate Scheme`}
          </h3>
          {introduced_year && (
            <p className="text-sm text-white/60 mt-1">
              Introduced in {introduced_year}
            </p>
          )}
        </div>
        {duration_years && (
          <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300">
            <div className="text-2xl font-bold">{duration_years}</div>
            <div className="text-xs">Years Duration</div>
          </div>
        )}
      </div>

      {/* Eligibility */}
      {eligibility && eligibility.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/70 mb-3">Eligibility Requirements</h4>
          <ul className="space-y-2">
            {eligibility.map((req, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-white/80">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {benefits && benefits.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/70 mb-3">Tax Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">★</span>
                  <span className="font-medium text-white">{benefit.type}</span>
                </div>
                <p className="text-sm text-white/70">{benefit.description}</p>
                {benefit.effective_tax && (
                  <div className="mt-2 text-sm">
                    <span className="text-white/50">Effective Tax: </span>
                    <span className="text-green-400 font-medium">{benefit.effective_tax}</span>
                  </div>
                )}
                {benefit.duration && (
                  <div className="text-sm text-white/50">Duration: {benefit.duration}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Incentives */}
      {additional_incentives && additional_incentives.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/70 mb-3">Additional Incentives</h4>
          <div className="space-y-2">
            {additional_incentives.map((incentive, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-white">{incentive.name}</div>
                <p className="text-sm text-white/60">{incentive.description}</p>
                {incentive.eligibility && (
                  <p className="text-xs text-white/40 mt-1">Eligibility: {incentive.eligibility}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Info */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${application_required ? 'bg-yellow-500' : 'bg-green-500'}`} />
          <span className="text-white/80">
            {application_required ? 'Application Required' : 'Automatic Eligibility'}
          </span>
        </div>
        {application_cost !== undefined && (
          <div className="flex items-center gap-3">
            <span className="text-white/60">Application Cost:</span>
            <span className="text-white font-medium">
              {application_cost === 0 ? 'Free' : `€${application_cost.toLocaleString()}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpatriateScheme;
