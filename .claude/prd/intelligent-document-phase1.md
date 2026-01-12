# Plan: IntelligentDocument Foundation (Phase 1)

## Problem Statement

Currently, destination pages are **static** - they don't respond to conversation. When a user asks ATLAS about visa requirements while viewing Portugal's page, the page doesn't react. We need pages that "think" - where content sections highlight, update, and respond to voice/chat queries.

This creates the "shock and awe" effect: user asks "What's the minimum income for Portugal's D7 visa?" and the visa section immediately highlights with the answer visible.

## Approach

Create a wrapper component (`IntelligentDocument`) that:
1. Registers CopilotKit actions to control page sections
2. Wraps content in `DocumentSection` components that can be highlighted/focused
3. Provides context to the agent about what sections are available

This follows the pattern from fractional.quest where pages respond to conversation.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/intelligent/IntelligentDocument.tsx` | **NEW** - Main wrapper component |
| `src/components/intelligent/DocumentSection.tsx` | **NEW** - Highlightable section |
| `src/components/intelligent/index.ts` | **NEW** - Exports |
| `src/app/destinations/[slug]/DestinationClient.tsx` | Wrap with IntelligentDocument |
| `src/app/page.tsx` | Add useCopilotAction for frontend actions |

## Implementation Steps

### Step 1: Create IntelligentDocument Component

```tsx
// src/components/intelligent/IntelligentDocument.tsx
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

export function IntelligentDocument({
  pageContext,
  availableSections = [],
  children
}: IntelligentDocumentProps) {
  const [highlightedSections, setHighlightedSections] = useState<string[]>([]);
  const [activeDestination, setActiveDestination] = useState<string | null>(null);

  const highlightSection = useCallback((sectionId: string) => {
    setHighlightedSections(prev =>
      prev.includes(sectionId) ? prev : [...prev, sectionId]
    );
    // Auto-scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightedSections([]);
  }, []);

  // Make page context readable to agent
  useCopilotReadable({
    description: "Current page context and available sections",
    value: {
      pageContext,
      availableSections,
      highlightedSections,
      activeDestination,
    },
  });

  // Frontend action: Update which sections are highlighted
  useCopilotAction({
    name: "update_destination_view",
    description: "Highlight specific sections on the page to draw attention to relevant content",
    parameters: [
      {
        name: "sections",
        type: "object",
        description: "Array of section IDs to highlight",
        attributes: [{ name: "items", type: "string" }]
      },
      {
        name: "highlight",
        type: "boolean",
        description: "Whether to highlight (true) or clear (false)"
      }
    ],
    handler: async ({ sections, highlight }) => {
      if (highlight && sections?.items) {
        sections.items.forEach((s: string) => highlightSection(s));
      } else {
        clearHighlights();
      }
      return { success: true, highlighted: sections?.items || [] };
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
```

### Step 2: Create DocumentSection Component

```tsx
// src/components/intelligent/DocumentSection.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useDocumentContext } from "./IntelligentDocument";

interface DocumentSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function DocumentSection({ id, children, className = "" }: DocumentSectionProps) {
  const { highlightedSections } = useDocumentContext();
  const isHighlighted = highlightedSections.includes(id);
  const ref = useRef<HTMLDivElement>(null);

  // Highlight animation
  useEffect(() => {
    if (isHighlighted && ref.current) {
      ref.current.classList.add("animate-highlight");
      const timer = setTimeout(() => {
        ref.current?.classList.remove("animate-highlight");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      id={id}
      ref={ref}
      className={`transition-all duration-500 ${
        isHighlighted
          ? "ring-2 ring-amber-400 ring-offset-4 bg-amber-50/50 rounded-xl"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
```

### Step 3: Add CSS Animation

Add to `globals.css`:
```css
@keyframes highlight-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
  50% { box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.3); }
}

.animate-highlight {
  animation: highlight-pulse 1s ease-in-out 2;
}
```

### Step 4: Add Frontend Actions to Main Page

Add these `useCopilotAction` hooks to `src/app/page.tsx`:

```tsx
// Currency context state
const [userCurrency, setUserCurrency] = useState("USD");
const [comparisonMode, setComparisonMode] = useState<{
  dest1: string;
  dest2: string;
  aspects: string[];
} | null>(null);

// Action: Set user currency for conversions
useCopilotAction({
  name: "set_user_currency",
  description: "Set the user's home currency for all cost displays and conversions",
  parameters: [
    { name: "currency", type: "string", description: "ISO currency code (USD, EUR, GBP, etc.)" }
  ],
  handler: async ({ currency }) => {
    setUserCurrency(currency.toUpperCase());
    return { success: true, currency: currency.toUpperCase() };
  },
});

// Action: Compare two destinations
useCopilotAction({
  name: "compare_destinations",
  description: "Open side-by-side comparison view of two destinations",
  parameters: [
    { name: "destination1", type: "string", description: "First destination to compare" },
    { name: "destination2", type: "string", description: "Second destination to compare" },
    { name: "aspects", type: "object", description: "Aspects to compare", attributes: [{ name: "items", type: "string" }] }
  ],
  handler: async ({ destination1, destination2, aspects }) => {
    setComparisonMode({
      dest1: destination1,
      dest2: destination2,
      aspects: aspects?.items || ["cost", "visa", "lifestyle"]
    });
    return { success: true };
  },
});
```

### Step 5: Wrap Destination Pages

Update `DestinationClient.tsx`:

```tsx
import { IntelligentDocument, DocumentSection } from "@/components/intelligent";

export default function DestinationClient({ slug }: { slug: string }) {
  // ... existing code ...

  return (
    <IntelligentDocument
      pageContext={`${destination?.country_name} relocation guide`}
      availableSections={["overview", "visas", "costs", "jobs", "gallery"]}
    >
      <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
        {/* Hero - same as before */}

        {/* Tab Content */}
        <DocumentSection id="overview">
          {/* Overview content */}
        </DocumentSection>

        <DocumentSection id="visas">
          {/* Visa content */}
        </DocumentSection>

        <DocumentSection id="costs">
          {/* Cost content */}
        </DocumentSection>

        <DocumentSection id="jobs">
          {/* Job market content */}
        </DocumentSection>
      </div>
    </IntelligentDocument>
  );
}
```

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Section doesn't exist | `highlightSection` checks for element before scrolling |
| Multiple highlights | Array accumulates, all stay highlighted until cleared |
| Mobile scroll | Uses `scrollIntoView` with `block: "center"` |
| Agent calls on wrong page | `useCopilotReadable` tells agent what sections exist |

## Testing

1. Navigate to `/destinations/portugal`
2. Open CopilotKit sidebar
3. Ask: "Show me the visa requirements"
4. **Expected**: Visa section highlights with amber ring, scrolls into view
5. Ask: "What about cost of living?"
6. **Expected**: Cost section highlights, previous highlight may clear

## Success Criteria

- [ ] User asks about visa → visa section highlights
- [ ] User asks about costs → cost section scrolls into view with highlight
- [ ] Agent knows what sections are available via `useCopilotReadable`
- [ ] Highlight animation runs for 2 seconds then fades
- [ ] Works on mobile (smooth scroll)

## Rollback

Delete the `src/components/intelligent/` folder and revert DestinationClient.tsx changes. No database changes required.

---

## Next Steps (After Phase 1)

1. **Phase 2**: Create LiveComponents (LiveVisaCard, LiveCostChart, LiveCurrencyConverter)
2. **Phase 3**: Add Two-Stage voice pattern with TSCA anchoring
3. **Phase 4**: Expand to 100+ MDX pages
