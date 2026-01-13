"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

// Phase types
export type ConversationPhase = "landing" | "conversation" | "confirmed";

// Section types for timeline
export type SectionId =
  | "overview"
  | "visas"
  | "costs"
  | "jobs"
  | "education"
  | "company"
  | "property"
  | "expatriate"
  | "residency";

// Full destination data from confirm_destination tool
export interface ConfirmedDestination {
  slug: string;
  destination: string;
  flag: string;
  region?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  language?: string;
  quick_facts: Array<{ icon: string; label: string; value: string }>;
  highlights: Array<{ text: string; icon?: string }>;
  visas: Array<Record<string, unknown>>;
  cost_of_living: Array<Record<string, unknown>>;
  job_market: Record<string, unknown>;
  faqs: Array<{ question: string; answer: string }>;
  education_stats: Record<string, unknown>;
  company_incorporation: Record<string, unknown>;
  property_info: Record<string, unknown>;
  expatriate_scheme: Record<string, unknown>;
  residency_requirements: Record<string, unknown>;
}

// State shape
interface ConversationState {
  phase: ConversationPhase;
  confirmedDestination: ConfirmedDestination | null;
  activeSection: SectionId;
  revealedSections: SectionId[];
  backgroundUrl: string;
  isTransitioning: boolean;
}

// Action types
type ConversationAction =
  | { type: "SET_PHASE"; payload: ConversationPhase }
  | { type: "CONFIRM_DESTINATION"; payload: ConfirmedDestination }
  | { type: "SET_ACTIVE_SECTION"; payload: SectionId }
  | { type: "ADD_REVEALED_SECTION"; payload: SectionId }
  | { type: "SET_BACKGROUND"; payload: string }
  | { type: "SET_TRANSITIONING"; payload: boolean }
  | { type: "RESET" };

// Initial state
const initialState: ConversationState = {
  phase: "landing",
  confirmedDestination: null,
  activeSection: "overview",
  revealedSections: [],
  backgroundUrl: "",
  isTransitioning: false,
};

// Reducer
function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.payload };

    case "CONFIRM_DESTINATION": {
      // Determine which sections have data
      const dest = action.payload;
      const revealed: SectionId[] = ["overview"]; // Always show overview

      if (dest.visas && dest.visas.length > 0) revealed.push("visas");
      if (dest.cost_of_living && dest.cost_of_living.length > 0) revealed.push("costs");
      if (dest.job_market && Object.keys(dest.job_market).length > 0) revealed.push("jobs");
      if (dest.education_stats && Object.keys(dest.education_stats).length > 0) revealed.push("education");
      if (dest.company_incorporation && Object.keys(dest.company_incorporation).length > 0) revealed.push("company");
      if (dest.property_info && Object.keys(dest.property_info).length > 0) revealed.push("property");
      if (dest.expatriate_scheme && Object.keys(dest.expatriate_scheme).length > 0) revealed.push("expatriate");
      if (dest.residency_requirements && Object.keys(dest.residency_requirements).length > 0) revealed.push("residency");

      return {
        ...state,
        phase: "confirmed",
        confirmedDestination: dest,
        revealedSections: revealed,
        activeSection: "overview",
        backgroundUrl: dest.hero_image_url || state.backgroundUrl,
      };
    }

    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };

    case "ADD_REVEALED_SECTION":
      if (state.revealedSections.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        revealedSections: [...state.revealedSections, action.payload],
      };

    case "SET_BACKGROUND":
      return { ...state, backgroundUrl: action.payload };

    case "SET_TRANSITIONING":
      return { ...state, isTransitioning: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// Context type
interface ConversationContextType {
  state: ConversationState;
  setPhase: (phase: ConversationPhase) => void;
  confirmDestination: (data: ConfirmedDestination) => void;
  setActiveSection: (section: SectionId) => void;
  setBackground: (url: string) => void;
  startConversation: () => void;
  reset: () => void;
}

// Create context
const ConversationContext = createContext<ConversationContextType | null>(null);

// Provider component
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  const setPhase = useCallback((phase: ConversationPhase) => {
    dispatch({ type: "SET_PHASE", payload: phase });
  }, []);

  const confirmDestination = useCallback((data: ConfirmedDestination) => {
    dispatch({ type: "SET_TRANSITIONING", payload: true });

    // Small delay for transition effect
    setTimeout(() => {
      dispatch({ type: "CONFIRM_DESTINATION", payload: data });
      dispatch({ type: "SET_TRANSITIONING", payload: false });
    }, 300);
  }, []);

  const setActiveSection = useCallback((section: SectionId) => {
    dispatch({ type: "SET_ACTIVE_SECTION", payload: section });
  }, []);

  const setBackground = useCallback((url: string) => {
    dispatch({ type: "SET_BACKGROUND", payload: url });
  }, []);

  const startConversation = useCallback(() => {
    dispatch({ type: "SET_PHASE", payload: "conversation" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: ConversationContextType = {
    state,
    setPhase,
    confirmDestination,
    setActiveSection,
    setBackground,
    startConversation,
    reset,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

// Hook
export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
}

// Selector hooks for performance
export function useConversationPhase() {
  const { state } = useConversation();
  return state.phase;
}

export function useConfirmedDestination() {
  const { state } = useConversation();
  return state.confirmedDestination;
}

export function useRevealedSections() {
  const { state } = useConversation();
  return state.revealedSections;
}

export default ConversationContext;
