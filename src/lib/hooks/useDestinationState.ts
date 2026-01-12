"use client";

import { useCoAgent } from "@copilotkit/react-core";

/**
 * Destination State - Shared between frontend and Pydantic AI agent
 *
 * This state is synchronized via CopilotKit's useCoAgent hook.
 * The agent can update this state to control the UI.
 */
export interface DestinationState {
  // Current view
  currentDestination: string | null;
  activeSection: string | null;
  highlightedSections: string[];

  // User preferences
  userCurrency: string;
  comparisonDestinations: string[];

  // UI state
  isSidebarOpen: boolean;
  isComparisonMode: boolean;

  // Panel updates from agent
  panelUpdate: {
    view: "destination" | "comparison" | "calculator" | "home";
    destination?: string;
    section?: string;
    data?: Record<string, unknown>;
  } | null;

  // User info (synced from auth)
  user?: {
    id: string;
    name: string;
    email: string;
  };

  // Saved destinations
  savedDestinations: Array<{
    slug: string;
    interestLevel: "exploring" | "serious" | "committed";
    notes?: string;
  }>;
}

const initialState: DestinationState = {
  currentDestination: null,
  activeSection: null,
  highlightedSections: [],
  userCurrency: "USD",
  comparisonDestinations: [],
  isSidebarOpen: true,
  isComparisonMode: false,
  panelUpdate: null,
  user: undefined,
  savedDestinations: [],
};

/**
 * useDestinationState - Custom hook for destination state management
 *
 * Wraps useCoAgent to provide typed state and common actions.
 *
 * Usage:
 * const { state, setDestination, highlightSection } = useDestinationState();
 */
export function useDestinationState() {
  const { state, setState } = useCoAgent<DestinationState>({
    name: "atlas_agent",
    initialState,
  });

  // Ensure state has all required properties
  const safeState: DestinationState = {
    ...initialState,
    ...state,
  };

  // Helper actions
  const setDestination = (destination: string | null) => {
    setState((prev) => ({
      ...initialState,
      ...prev,
      currentDestination: destination,
      activeSection: null,
      highlightedSections: [],
    }));
  };

  const setActiveSection = (section: string | null) => {
    setState((prev) => ({
      ...initialState,
      ...prev,
      activeSection: section,
    }));
  };

  const highlightSection = (sectionId: string) => {
    setState((prev) => ({
      ...initialState,
      ...prev,
      highlightedSections: [sectionId],
    }));

    // Auto-scroll to section
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    // Clear highlight after animation
    setTimeout(() => {
      setState((prev) => ({
        ...initialState,
        ...prev,
        highlightedSections: (prev?.highlightedSections || []).filter((id) => id !== sectionId),
      }));
    }, 3000);
  };

  const clearHighlights = () => {
    setState((prev) => ({
      ...initialState,
      ...prev,
      highlightedSections: [],
    }));
  };

  const setCurrency = (currency: string) => {
    setState((prev) => ({
      ...initialState,
      ...prev,
      userCurrency: currency.toUpperCase(),
    }));
  };

  const toggleComparison = (destination: string) => {
    setState((prev) => {
      const currentDests = prev?.comparisonDestinations || [];
      const isAlreadyComparing = currentDests.includes(destination);
      return {
        ...initialState,
        ...prev,
        comparisonDestinations: isAlreadyComparing
          ? currentDests.filter((d) => d !== destination)
          : [...currentDests.slice(-1), destination], // Keep max 2
        isComparisonMode: !isAlreadyComparing || currentDests.length > 1,
      };
    });
  };

  const saveDestination = (
    slug: string,
    interestLevel: "exploring" | "serious" | "committed",
    notes?: string
  ) => {
    setState((prev) => {
      const currentSaved = prev?.savedDestinations || [];
      const existing = currentSaved.findIndex((d) => d.slug === slug);
      const newSaved = [...currentSaved];

      if (existing >= 0) {
        newSaved[existing] = { slug, interestLevel, notes };
      } else {
        newSaved.push({ slug, interestLevel, notes });
      }

      return {
        ...initialState,
        ...prev,
        savedDestinations: newSaved,
      };
    });
  };

  const setUser = (user: { id: string; name: string; email: string } | undefined) => {
    setState((prev) => ({
      ...initialState,
      ...prev,
      user,
    }));
  };

  return {
    state: safeState,
    setState,

    // Actions
    setDestination,
    setActiveSection,
    highlightSection,
    clearHighlights,
    setCurrency,
    toggleComparison,
    saveDestination,
    setUser,

    // Computed
    isHighlighted: (sectionId: string) => safeState.highlightedSections.includes(sectionId),
    hasSavedDestination: (slug: string) =>
      safeState.savedDestinations.some((d) => d.slug === slug),
  };
}

/**
 * Destination sections definition
 */
export const DESTINATION_SECTIONS = [
  { id: "visa", title: "Visa & Immigration", icon: "📋" },
  { id: "cost", title: "Cost of Living", icon: "💰" },
  { id: "healthcare", title: "Healthcare", icon: "🏥" },
  { id: "tax", title: "Tax & Finance", icon: "📊" },
  { id: "incorporation", title: "Company Incorporation", icon: "🏢" },
  { id: "education", title: "Education & Schooling", icon: "📚" },
  { id: "housing", title: "Housing & Real Estate", icon: "🏠" },
  { id: "jobs", title: "Job Market", icon: "💼" },
  { id: "safety", title: "Safety & Crime", icon: "🛡️" },
  { id: "climate", title: "Climate & Weather", icon: "☀️" },
  { id: "qol", title: "Quality of Life", icon: "⭐" },
  { id: "food", title: "Food & Cuisine", icon: "🍽️" },
  { id: "transport", title: "Transportation", icon: "🚗" },
  { id: "language", title: "Language & Culture", icon: "🗣️" },
  { id: "expat", title: "Expat Community", icon: "👥" },
  { id: "internet", title: "Internet & Connectivity", icon: "📶" },
  { id: "banking", title: "Banking & Money", icon: "🏦" },
  { id: "cities", title: "City Profiles", icon: "🏙️" },
  { id: "logistics", title: "Practical Logistics", icon: "📦" },
] as const;

export type SectionId = typeof DESTINATION_SECTIONS[number]["id"];
