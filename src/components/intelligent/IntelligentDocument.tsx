"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

interface DocumentContextValue {
  highlightedSections: string[];
  highlightSection: (sectionId: string) => void;
  clearHighlights: () => void;
  activeDestination: string | null;
  setActiveDestination: (dest: string | null) => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function useDocumentContext() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocumentContext must be used within IntelligentDocument");
  return ctx;
}

interface IntelligentDocumentProps {
  pageContext: string; // e.g., "Portugal Digital Nomad Visa"
  availableSections?: string[]; // e.g., ["visa-requirements", "cost-of-living", "job-market"]
  children: ReactNode;
}

/**
 * IntelligentDocument - Makes pages "think" and respond to conversation
 *
 * Wraps page content and provides:
 * 1. Context to the agent about available sections
 * 2. Actions to highlight/focus specific sections
 * 3. Smooth scrolling to highlighted content
 *
 * Usage:
 * <IntelligentDocument
 *   pageContext="Portugal relocation guide"
 *   availableSections={["overview", "visas", "costs", "jobs"]}
 * >
 *   <DocumentSection id="visas">...</DocumentSection>
 * </IntelligentDocument>
 */
export function IntelligentDocument({
  pageContext,
  availableSections = [],
  children
}: IntelligentDocumentProps) {
  const [highlightedSections, setHighlightedSections] = useState<string[]>([]);
  const [activeDestination, setActiveDestination] = useState<string | null>(null);

  const highlightSection = useCallback((sectionId: string) => {
    // Clear previous highlights and set new one
    setHighlightedSections([sectionId]);

    // Auto-scroll to section with slight delay for visual effect
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightedSections([]);
  }, []);

  // Make page context readable to agent
  useCopilotReadable({
    description: "Current page context and available sections for highlighting",
    value: {
      pageContext,
      availableSections,
      highlightedSections,
      activeDestination,
      hint: "Use update_destination_view action to highlight sections when user asks about specific topics",
    },
  });

  // Frontend action: Update which sections are highlighted
  useCopilotAction({
    name: "update_destination_view",
    description: "Highlight specific sections on the page to draw user's attention to relevant content. Use this when the user asks about visas, costs, jobs, etc. to make the relevant section visually prominent.",
    parameters: [
      {
        name: "sections",
        type: "string[]",
        description: "Array of section IDs to highlight (e.g., ['visas', 'costs'])",
      },
      {
        name: "highlight",
        type: "boolean",
        description: "Whether to highlight (true) or clear highlights (false)",
      }
    ],
    handler: async ({ sections, highlight }) => {
      if (highlight && Array.isArray(sections) && sections.length > 0) {
        // Highlight each section
        sections.forEach((sectionId: string) => {
          highlightSection(sectionId);
        });
        return {
          success: true,
          highlighted: sections,
          message: `Highlighted sections: ${sections.join(", ")}`
        };
      } else {
        clearHighlights();
        return { success: true, highlighted: [], message: "Cleared all highlights" };
      }
    },
  });

  const value: DocumentContextValue = {
    highlightedSections,
    highlightSection,
    clearHighlights,
    activeDestination,
    setActiveDestination,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}
