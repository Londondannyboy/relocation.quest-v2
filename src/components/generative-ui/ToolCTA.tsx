"use client";

import Link from "next/link";

interface ToolCTAProps {
  title: string;
  description: string;
  url: string;
  tool_type: "cost_calculator" | "comparison" | "visa_planner" | "quiz";
  destination?: string;
  destination1?: string;
  destination2?: string;
}

const TOOL_ICONS: Record<string, string> = {
  cost_calculator: "💰",
  comparison: "⚖️",
  visa_planner: "📋",
  quiz: "🎯",
};

const TOOL_COLORS: Record<string, { bg: string; border: string; text: string; button: string }> = {
  cost_calculator: {
    bg: "bg-gradient-to-r from-amber-50 to-orange-50",
    border: "border-amber-200",
    text: "text-amber-800",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  comparison: {
    bg: "bg-gradient-to-r from-indigo-50 to-purple-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    button: "bg-indigo-600 hover:bg-indigo-700",
  },
  visa_planner: {
    bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  quiz: {
    bg: "bg-gradient-to-r from-rose-50 to-pink-50",
    border: "border-rose-200",
    text: "text-rose-800",
    button: "bg-rose-600 hover:bg-rose-700",
  },
};

/**
 * ToolCTA - Call-to-action card for interactive tools
 * Renders a beautiful card that links to the tool page
 */
export function ToolCTA({
  title,
  description,
  url,
  tool_type,
  destination,
  destination1,
  destination2,
}: ToolCTAProps) {
  const colors = TOOL_COLORS[tool_type] || TOOL_COLORS.cost_calculator;
  const icon = TOOL_ICONS[tool_type] || "🔧";

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-5 shadow-sm`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-4xl flex-shrink-0">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg ${colors.text}`}>{title}</h3>
          <p className="text-stone-600 text-sm mt-1">{description}</p>

          {/* Context info */}
          {destination && (
            <p className="text-sm text-stone-500 mt-2">
              Pre-selected: <span className="font-medium">{destination}</span>
            </p>
          )}
          {destination1 && destination2 && (
            <p className="text-sm text-stone-500 mt-2">
              Comparing: <span className="font-medium">{destination1}</span> vs{" "}
              <span className="font-medium">{destination2}</span>
            </p>
          )}

          {/* CTA Button */}
          <Link
            href={url}
            className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${colors.button}`}
          >
            Open Tool
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
