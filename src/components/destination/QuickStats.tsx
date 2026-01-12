"use client";

interface QuickStatsProps {
  costIndex?: number; // 0-100
  safetyScore?: string; // A+, A, B+, B, C+, C
  qolScore?: number; // 0-10
  climate?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  className?: string;
}

/**
 * QuickStats - Row of key metrics for a destination
 *
 * Displays at-a-glance stats with visual indicators
 */
export function QuickStats({
  costIndex,
  safetyScore,
  qolScore,
  climate,
  currency,
  language,
  timezone,
  className = ""
}: QuickStatsProps) {
  return (
    <div
      className={`
        w-full
        bg-white
        border-y border-stone-200
        shadow-sm
        ${className}
      `}
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
          {/* Cost Index */}
          {costIndex !== undefined && (
            <StatCard
              icon="💰"
              label="Cost Index"
              value={costIndex.toString()}
              subtext={getCostLabel(costIndex)}
              color={getCostColor(costIndex)}
            />
          )}

          {/* Safety Score */}
          {safetyScore && (
            <StatCard
              icon="🛡️"
              label="Safety"
              value={safetyScore}
              subtext={getSafetyLabel(safetyScore)}
              color={getSafetyColor(safetyScore)}
            />
          )}

          {/* Quality of Life */}
          {qolScore !== undefined && (
            <StatCard
              icon="⭐"
              label="Quality of Life"
              value={qolScore.toFixed(1)}
              subtext="/10"
              color={getQoLColor(qolScore)}
            />
          )}

          {/* Climate */}
          {climate && (
            <StatCard
              icon="☀️"
              label="Climate"
              value={climate}
              subtext=""
            />
          )}

          {/* Currency */}
          {currency && (
            <StatCard
              icon="💱"
              label="Currency"
              value={currency}
              subtext=""
            />
          )}

          {/* Language */}
          {language && (
            <StatCard
              icon="🗣️"
              label="Language"
              value={language}
              subtext=""
            />
          )}

          {/* Timezone */}
          {timezone && (
            <StatCard
              icon="🕐"
              label="Timezone"
              value={timezone}
              subtext=""
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * StatCard - Individual stat display
 */
function StatCard({
  icon,
  label,
  value,
  subtext,
  color = "text-stone-900"
}: {
  icon: string;
  label: string;
  value: string;
  subtext: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-default">
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-xs text-stone-500 uppercase tracking-wide">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      {subtext && (
        <span className="text-xs text-stone-400">{subtext}</span>
      )}
    </div>
  );
}

/**
 * CompactQuickStats - Horizontal scrolling version for mobile
 */
export function CompactQuickStats({
  stats,
  className = ""
}: {
  stats: Array<{ icon: string; label: string; value: string }>;
  className?: string;
}) {
  return (
    <div
      className={`
        w-full overflow-x-auto
        bg-white border-y border-stone-200
        ${className}
      `}
    >
      <div className="flex gap-6 px-4 py-4 min-w-max">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xl">{stat.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs text-stone-500">{stat.label}</span>
              <span className="font-semibold text-stone-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper functions for colors and labels
function getCostLabel(index: number): string {
  if (index < 40) return "Very Affordable";
  if (index < 60) return "Affordable";
  if (index < 80) return "Moderate";
  return "Expensive";
}

function getCostColor(index: number): string {
  if (index < 40) return "text-green-600";
  if (index < 60) return "text-green-500";
  if (index < 80) return "text-amber-500";
  return "text-red-500";
}

function getSafetyLabel(score: string): string {
  const labels: Record<string, string> = {
    "A+": "Excellent",
    "A": "Very Good",
    "B+": "Good",
    "B": "Moderate",
    "C+": "Below Average",
    "C": "Caution"
  };
  return labels[score] || "";
}

function getSafetyColor(score: string): string {
  if (score.startsWith("A")) return "text-green-600";
  if (score.startsWith("B")) return "text-amber-500";
  return "text-red-500";
}

function getQoLColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-amber-500";
  return "text-red-500";
}
