"use client";

interface Visa {
  name: string;
  description?: string;
  processingTime?: string;
  cost?: string;
  requirements?: string[];
  isWorkPermit?: boolean;
  isResidencyPath?: boolean;
}

interface VisaGridProps {
  country: string;
  flag: string;
  visas: Visa[];
  hero_image_url?: string;
}

/**
 * Beautiful visa options grid
 * Shows all visa types with key info at a glance
 */
export function VisaGrid({ country, flag, visas, hero_image_url }: VisaGridProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* Header */}
      <div className="relative h-32 overflow-hidden">
        {hero_image_url ? (
          <img src={hero_image_url} alt={country} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{flag}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{country} Visa Options</h2>
              <p className="text-white/80 text-sm">{visas.length} pathways available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visa Cards */}
      <div className="p-4 space-y-3">
        {visas.map((visa, index) => (
          <div
            key={index}
            className="bg-stone-50 rounded-xl p-4 border border-stone-100 hover:border-blue-200 hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-stone-800">{visa.name}</h3>
                {visa.description && (
                  <p className="text-sm text-stone-500 mt-1">{visa.description}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1 ml-3">
                {visa.isWorkPermit && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                    Work Permit
                  </span>
                )}
                {visa.isResidencyPath && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                    PR Pathway
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex gap-6 mt-4">
              {visa.processingTime && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Processing</p>
                    <p className="text-sm font-semibold text-stone-700">{visa.processingTime}</p>
                  </div>
                </div>
              )}

              {visa.cost && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Cost</p>
                    <p className="text-sm font-semibold text-stone-700">{visa.cost}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Requirements Preview */}
            {visa.requirements && visa.requirements.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-200">
                <p className="text-xs text-stone-400 mb-2">Key Requirements</p>
                <div className="flex flex-wrap gap-1">
                  {visa.requirements.slice(0, 3).map((req, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-white text-stone-600 text-xs rounded-lg border border-stone-200"
                    >
                      {req}
                    </span>
                  ))}
                  {visa.requirements.length > 3 && (
                    <span className="px-2 py-1 text-stone-400 text-xs">
                      +{visa.requirements.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 p-4 bg-stone-50">
        <p className="text-xs text-stone-500 text-center">
          Requirements and fees may change. Always verify with official sources.
        </p>
      </div>
    </div>
  );
}
