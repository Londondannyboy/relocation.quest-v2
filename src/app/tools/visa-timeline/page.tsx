"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Visa {
  name: string;
  type?: string;
  duration?: string;
  cost?: string;
  processingTime?: string;
  requirements?: string[];
  isWorkPermit?: boolean;
  isResidencyPath?: boolean;
}

interface Destination {
  slug: string;
  country_name: string;
  flag: string;
  region: string;
  visas?: Visa[] | string;
}

// Standard visa application timeline steps
const TIMELINE_STEPS = [
  {
    id: 1,
    title: "Research & Planning",
    duration: "2-4 weeks",
    description: "Research visa types, eligibility requirements, and gather information about the destination",
    tasks: [
      "Review visa options for your situation",
      "Check eligibility requirements",
      "Calculate budget for application fees",
      "Research destination cities and cost of living",
    ],
    icon: "🔍",
  },
  {
    id: 2,
    title: "Document Preparation",
    duration: "2-6 weeks",
    description: "Collect, prepare, and organize all required documents",
    tasks: [
      "Gather passport (valid 6+ months)",
      "Obtain proof of income/savings",
      "Get health insurance documentation",
      "Prepare accommodation proof",
      "Collect criminal background check",
      "Get documents translated if required",
    ],
    icon: "📄",
  },
  {
    id: 3,
    title: "Application Submission",
    duration: "1-2 weeks",
    description: "Submit your visa application through the official channel",
    tasks: [
      "Complete application forms",
      "Pay application fees",
      "Submit documents online or in-person",
      "Schedule biometrics appointment if needed",
      "Keep copies of everything submitted",
    ],
    icon: "📤",
  },
  {
    id: 4,
    title: "Processing & Wait",
    duration: "Variable",
    description: "Wait for your application to be processed",
    tasks: [
      "Monitor application status",
      "Respond to any additional requests",
      "Prepare for potential interview",
      "Continue planning your move",
    ],
    icon: "⏳",
  },
  {
    id: 5,
    title: "Approval & Travel",
    duration: "1-2 weeks",
    description: "Receive your visa and prepare for departure",
    tasks: [
      "Receive visa approval",
      "Book flights",
      "Arrange accommodation",
      "Notify bank and services",
      "Pack and prepare for move",
    ],
    icon: "✈️",
  },
  {
    id: 6,
    title: "Arrival & Registration",
    duration: "First month",
    description: "Complete arrival formalities and settle in",
    tasks: [
      "Register with local authorities",
      "Get residence card if required",
      "Open local bank account",
      "Get local phone number",
      "Register for healthcare",
    ],
    icon: "🏠",
  },
];

export default function VisaTimelinePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<string>("");
  const [selectedVisa, setSelectedVisa] = useState<Visa | null>(null);
  const [destData, setDestData] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  // Fetch destinations on mount
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/destinations?limit=50");
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

  // Fetch destination data when selection changes
  useEffect(() => {
    async function fetchDestData() {
      if (!selectedDest) {
        setDestData(null);
        setSelectedVisa(null);
        return;
      }
      try {
        const res = await fetch(`/api/destinations/${selectedDest}`);
        if (res.ok) {
          const data = await res.json();
          setDestData(data);
        }
      } catch (error) {
        console.error("Failed to fetch destination:", error);
      }
    }
    fetchDestData();
  }, [selectedDest]);

  // Parse JSON strings if needed
  const getVisas = (): Visa[] => {
    if (!destData?.visas) return [];
    if (typeof destData.visas === "string") {
      try {
        return JSON.parse(destData.visas);
      } catch {
        return [];
      }
    }
    return destData.visas;
  };

  // Calculate total timeline
  const getTotalDuration = () => {
    if (!selectedVisa?.processingTime) return "3-6 months typical";
    return selectedVisa.processingTime;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/tools" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Visa Timeline Planner</h1>
          <p className="text-white/90 text-lg">
            Plan your visa application with step-by-step guidance
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
                  setSelectedVisa(null);
                }}
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Choose a country...</option>
                {destinations.map((dest) => (
                  <option key={dest.slug} value={dest.slug}>
                    {dest.flag} {dest.country_name}
                  </option>
                ))}
              </select>

              {/* Visa Type Selector */}
              {destData && getVisas().length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm text-stone-600 mb-2">Select Visa Type</label>
                  <div className="space-y-2">
                    {getVisas().map((visa, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVisa(visa)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedVisa?.name === visa.name
                            ? "bg-emerald-100 border-2 border-emerald-500"
                            : "bg-stone-50 border-2 border-transparent hover:border-stone-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-stone-800">{visa.name}</div>
                            {visa.duration && (
                              <div className="text-sm text-stone-500">{visa.duration}</div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {visa.isWorkPermit && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Work
                              </span>
                            )}
                            {visa.isResidencyPath && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                PR
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visa Details */}
            {selectedVisa && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-stone-800 mb-4">Visa Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Processing Time</span>
                    <span className="font-medium">{selectedVisa.processingTime || "Varies"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Cost</span>
                    <span className="font-medium text-emerald-600">{selectedVisa.cost || "Varies"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Duration</span>
                    <span className="font-medium">{selectedVisa.duration || "N/A"}</span>
                  </div>
                </div>

                {selectedVisa.requirements && selectedVisa.requirements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <h3 className="text-sm font-medium text-stone-700 mb-2">Key Requirements</h3>
                    <ul className="space-y-1">
                      {selectedVisa.requirements.slice(0, 5).map((req, idx) => (
                        <li key={idx} className="text-sm text-stone-600 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Timeline */}
          <div className="md:col-span-2">
            {selectedVisa ? (
              <div className="space-y-6">
                {/* Timeline Header */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-stone-800">
                        {destData?.flag} {destData?.country_name}: {selectedVisa.name}
                      </h2>
                      <p className="text-stone-500">Step-by-step application timeline</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{getTotalDuration()}</div>
                      <div className="text-sm text-stone-500">total processing</div>
                    </div>
                  </div>
                </div>

                {/* Timeline Steps */}
                <div className="space-y-4">
                  {TIMELINE_STEPS.map((step, idx) => (
                    <div
                      key={step.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
                      >
                        {/* Step Number */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          expandedStep === step.id ? "bg-emerald-100" : "bg-stone-100"
                        }`}>
                          {step.icon}
                        </div>

                        {/* Step Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-stone-800">
                              Step {step.id}: {step.title}
                            </h3>
                          </div>
                          <p className="text-sm text-stone-500">{step.description}</p>
                        </div>

                        {/* Duration */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-emerald-600">{step.duration}</div>
                          <svg
                            className={`w-5 h-5 text-stone-400 mx-auto mt-1 transition-transform ${
                              expandedStep === step.id ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expandedStep === step.id && (
                        <div className="px-4 pb-4 pt-2 border-t border-stone-100">
                          <div className="ml-16">
                            <h4 className="text-sm font-medium text-stone-700 mb-2">Tasks to Complete:</h4>
                            <ul className="space-y-2">
                              {step.tasks.map((task, tIdx) => (
                                <li key={tIdx} className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    className="mt-1 rounded border-stone-300 text-emerald-500 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-stone-600">{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Connector Line */}
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div className="h-4 flex justify-center">
                          <div className="w-0.5 h-full bg-stone-200" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="bg-emerald-50 rounded-xl p-6 text-center">
                  <h3 className="font-semibold text-stone-800 mb-2">Ready to start your application?</h3>
                  <p className="text-stone-600 mb-4">
                    Visit the official {destData?.country_name} immigration website for the latest requirements
                  </p>
                  <Link
                    href={`/destinations/${destData?.slug}`}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    View Full {destData?.country_name} Guide
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-stone-800 mb-2">Select a Destination & Visa</h3>
                <p className="text-stone-500 max-w-md mx-auto">
                  Choose a country and visa type from the panel on the left to see a step-by-step timeline for your visa application.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
