"use client";

import { useState } from "react";

interface QuickFact {
  label: string;
  value: string;
  icon?: string;
}

interface Visa {
  name: string;
  description?: string;
  processingTime?: string;
  cost?: string;
  isWorkPermit?: boolean;
  isResidencyPath?: boolean;
}

interface DestinationCardProps {
  name: string;
  flag: string;
  region: string;
  language?: string;
  hero_image_url?: string;
  hero_subtitle?: string;
  quick_facts?: QuickFact[];
  highlights?: { text: string; icon?: string }[];
  visas?: Visa[];
  slug?: string;
}

/**
 * Stunning DestinationCard - Full-featured destination overview
 * Shows flag, key facts, highlights, and visa snapshot
 */
export function DestinationCard({
  name,
  flag,
  region,
  language,
  hero_image_url,
  hero_subtitle,
  quick_facts = [],
  highlights = [],
  visas = [],
  slug,
}: DestinationCardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "visas">("overview");

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* Hero Section */}
      <div className="relative h-48 overflow-hidden">
        {hero_image_url ? (
          <img
            src={hero_image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-600 via-amber-700 to-stone-800" />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Country info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl drop-shadow-lg">{flag}</span>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{name}</h2>
              <p className="text-white/80 text-sm">{region}</p>
            </div>
          </div>
          {hero_subtitle && (
            <p className="text-white/90 text-sm mt-2 line-clamp-2">{hero_subtitle}</p>
          )}
        </div>

        {/* View full guide link */}
        {slug && (
          <a
            href={`/destinations/${slug}`}
            className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30 hover:bg-white/30 transition-colors"
          >
            Full Guide →
          </a>
        )}
      </div>

      {/* Quick Facts Bar */}
      {quick_facts.length > 0 && (
        <div className="grid grid-cols-4 gap-px bg-stone-200">
          {quick_facts.slice(0, 4).map((fact, i) => (
            <div key={i} className="bg-stone-50 p-3 text-center">
              <span className="text-lg">{fact.icon || "📌"}</span>
              <p className="text-xs text-stone-500 mt-1">{fact.label}</p>
              <p className="text-sm font-semibold text-stone-800 truncate">{fact.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "text-amber-600 border-b-2 border-amber-600 bg-amber-50/50"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("visas")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "visas"
              ? "text-amber-600 border-b-2 border-amber-600 bg-amber-50/50"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Visa Options ({visas.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Language */}
            {language && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-stone-400">Language:</span>
                <span className="font-medium text-stone-700">{language}</span>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                  Why {name}?
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {highlights.slice(0, 6).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-stone-700 bg-green-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-green-600 font-bold">{h.icon || "✓"}</span>
                      <span className="line-clamp-1">{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "visas" && (
          <div className="space-y-3">
            {visas.slice(0, 4).map((visa, i) => (
              <div
                key={i}
                className="bg-stone-50 rounded-xl p-4 border border-stone-100 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-800">{visa.name}</h4>
                    {visa.description && (
                      <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                        {visa.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    {visa.isWorkPermit && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Work
                      </span>
                    )}
                    {visa.isResidencyPath && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        PR Path
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-stone-500">
                  {visa.processingTime && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {visa.processingTime}
                    </span>
                  )}
                  {visa.cost && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {visa.cost}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact destination card for grids
 */
export function DestinationCardCompact({
  name,
  flag,
  region,
  hero_image_url,
  slug,
}: Pick<DestinationCardProps, "name" | "flag" | "region" | "hero_image_url" | "slug">) {
  return (
    <a
      href={slug ? `/destinations/${slug}` : "#"}
      className="block relative rounded-xl overflow-hidden group h-32 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="absolute inset-0">
        {hero_image_url ? (
          <img src={hero_image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-600 to-stone-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{flag}</span>
          <div>
            <h3 className="font-bold text-white text-sm">{name}</h3>
            <p className="text-white/70 text-xs">{region}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
