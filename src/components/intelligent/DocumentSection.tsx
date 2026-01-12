"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useDocumentContext } from "./IntelligentDocument";

interface DocumentSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * DocumentSection - A section that can be highlighted by the AI
 *
 * Wrap content sections with this component to make them highlightable.
 * When the agent calls update_destination_view with this section's ID,
 * it will:
 * 1. Scroll into view
 * 2. Show an amber highlight ring
 * 3. Pulse animation for 2 seconds
 *
 * Usage:
 * <DocumentSection id="visas">
 *   <h2>Visa Options</h2>
 *   ...
 * </DocumentSection>
 */
export function DocumentSection({ id, children, className = "" }: DocumentSectionProps) {
  const { highlightedSections } = useDocumentContext();
  const isHighlighted = highlightedSections.includes(id);
  const ref = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when highlighted
  useEffect(() => {
    if (isHighlighted) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000); // Animation runs for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      id={id}
      ref={ref}
      className={`
        transition-all duration-500 rounded-xl
        ${isHighlighted ? "ring-2 ring-amber-400 ring-offset-4 bg-amber-50/30" : ""}
        ${isAnimating ? "animate-highlight-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Standalone highlight wrapper for use outside IntelligentDocument
 * Accepts isHighlighted prop directly
 */
export function HighlightableSection({
  id,
  isHighlighted = false,
  children,
  className = ""
}: {
  id: string;
  isHighlighted?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isHighlighted) {
      setIsAnimating(true);
      // Scroll into view
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      id={id}
      ref={ref}
      className={`
        transition-all duration-500 rounded-xl
        ${isHighlighted ? "ring-2 ring-amber-400 ring-offset-4 bg-amber-50/30" : ""}
        ${isAnimating ? "animate-highlight-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
