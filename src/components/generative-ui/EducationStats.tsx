"use client";

interface NotableInstitution {
  name: string;
  type: string;
  ranking?: number;
  level?: string;
  curriculum?: string;
  programs?: string[];
}

interface TuitionRange {
  min: number;
  max: number;
  currency: string;
  note?: string;
}

interface EducationStatsProps {
  country: string;
  flag: string;
  universityRankingRange?: string;
  internationalSchoolsCount?: number;
  publicSchoolsCount?: number;
  tuitionRange?: {
    local_public?: TuitionRange;
    international_private?: TuitionRange;
    university_public?: TuitionRange;
    university_private?: TuitionRange;
  };
  languagesOfInstruction?: string[];
  notableInstitutions?: NotableInstitution[];
  studentVisaAvailable?: boolean;
  postStudyWorkRights?: string;
  internationalStudentPopulation?: number;
  educationQualityIndex?: number;
}

/**
 * Education statistics component
 * Shows university rankings, school counts, tuition ranges, and notable institutions
 */
export function EducationStats({
  country,
  flag,
  universityRankingRange,
  internationalSchoolsCount,
  publicSchoolsCount,
  tuitionRange,
  languagesOfInstruction,
  notableInstitutions,
  studentVisaAvailable,
  postStudyWorkRights,
  internationalStudentPopulation,
  educationQualityIndex,
}: EducationStatsProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Education in {country} {flag}</h2>
            <p className="text-white/80 text-sm">Schools, universities & opportunities</p>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-stone-200">
        {universityRankingRange && (
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{universityRankingRange}</p>
            <p className="text-xs text-stone-500">University Ranking</p>
          </div>
        )}
        {internationalSchoolsCount && (
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{internationalSchoolsCount}+</p>
            <p className="text-xs text-stone-500">International Schools</p>
          </div>
        )}
        {publicSchoolsCount && (
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">{publicSchoolsCount}+</p>
            <p className="text-xs text-stone-500">Public Schools</p>
          </div>
        )}
        {educationQualityIndex && (
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{educationQualityIndex}/100</p>
            <p className="text-xs text-stone-500">Quality Index</p>
          </div>
        )}
      </div>

      {/* Tuition Ranges */}
      {tuitionRange && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Annual Tuition Fees
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tuitionRange.local_public && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-700 font-medium">Public Schools</p>
                <p className="text-lg font-bold text-emerald-800">
                  {tuitionRange.local_public.min === 0 ? "Free" : formatCurrency(tuitionRange.local_public.min, tuitionRange.local_public.currency)}
                  {tuitionRange.local_public.max > 0 && tuitionRange.local_public.min !== tuitionRange.local_public.max &&
                    ` - ${formatCurrency(tuitionRange.local_public.max, tuitionRange.local_public.currency)}`}
                </p>
                {tuitionRange.local_public.note && (
                  <p className="text-xs text-emerald-600 mt-1">{tuitionRange.local_public.note}</p>
                )}
              </div>
            )}
            {tuitionRange.international_private && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">International Private</p>
                <p className="text-lg font-bold text-blue-800">
                  {formatCurrency(tuitionRange.international_private.min, tuitionRange.international_private.currency)}
                  {" - "}
                  {formatCurrency(tuitionRange.international_private.max, tuitionRange.international_private.currency)}
                </p>
              </div>
            )}
            {tuitionRange.university_public && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm text-purple-700 font-medium">Public University</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatCurrency(tuitionRange.university_public.min, tuitionRange.university_public.currency)}
                  {" - "}
                  {formatCurrency(tuitionRange.university_public.max, tuitionRange.university_public.currency)}
                </p>
              </div>
            )}
            {tuitionRange.university_private && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-amber-700 font-medium">Private University</p>
                <p className="text-lg font-bold text-amber-800">
                  {formatCurrency(tuitionRange.university_private.min, tuitionRange.university_private.currency)}
                  {" - "}
                  {formatCurrency(tuitionRange.university_private.max, tuitionRange.university_private.currency)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notable Institutions */}
      {notableInstitutions && notableInstitutions.length > 0 && (
        <div className="p-6 border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Notable Institutions
          </h3>
          <div className="space-y-3">
            {notableInstitutions.map((inst, index) => (
              <div key={index} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-stone-800">{inst.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        inst.type === "public" ? "bg-emerald-100 text-emerald-700" :
                        inst.type === "private" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {inst.type.charAt(0).toUpperCase() + inst.type.slice(1)}
                      </span>
                      {inst.ranking && (
                        <span className="text-xs text-stone-500">Rank #{inst.ranking}</span>
                      )}
                      {inst.level && (
                        <span className="text-xs text-stone-500">{inst.level}</span>
                      )}
                      {inst.curriculum && (
                        <span className="text-xs text-stone-500">{inst.curriculum} Curriculum</span>
                      )}
                    </div>
                  </div>
                </div>
                {inst.programs && inst.programs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {inst.programs.map((prog, i) => (
                      <span key={i} className="px-2 py-1 bg-white text-stone-600 text-xs rounded-lg border border-stone-200">
                        {prog}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages & Additional Info */}
      <div className="p-6 bg-stone-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {languagesOfInstruction && languagesOfInstruction.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 mb-2">Languages of Instruction</p>
              <div className="flex flex-wrap gap-1">
                {languagesOfInstruction.map((lang, i) => (
                  <span key={i} className="px-2 py-1 bg-white text-stone-700 text-sm rounded-lg border border-stone-200">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
          {studentVisaAvailable !== undefined && (
            <div>
              <p className="text-xs text-stone-500 mb-2">Student Visa</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                studentVisaAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {studentVisaAvailable ? "Available" : "Not Available"}
              </span>
            </div>
          )}
          {postStudyWorkRights && (
            <div>
              <p className="text-xs text-stone-500 mb-2">Post-Study Work Rights</p>
              <p className="text-sm font-semibold text-stone-700">{postStudyWorkRights}</p>
            </div>
          )}
        </div>
        {internationalStudentPopulation && (
          <div className="mt-4 pt-4 border-t border-stone-200">
            <p className="text-xs text-stone-500">
              {internationalStudentPopulation.toLocaleString()} international students currently enrolled
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
