"use client";

import { useState, ReactNode } from "react";

interface SectionCardProps {
  id: string;
  title: string;
  icon: string;
  description?: string;
  isActive?: boolean;
  isHighlighted?: boolean;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
  onToggle?: (id: string, isExpanded: boolean) => void;
}

/**
 * SectionCard - Expandable section container
 *
 * Features:
 * - Smooth expand/collapse animation
 * - Highlight state for AI-driven attention
 * - Icon and description support
 * - Keyboard accessible
 */
export function SectionCard({
  id,
  title,
  icon,
  description,
  isActive = false,
  isHighlighted = false,
  defaultExpanded = false,
  children,
  className = "",
  onToggle
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(id, newState);
  };

  return (
    <div
      id={id}
      className={`
        bg-white
        rounded-2xl
        border
        shadow-sm
        overflow-hidden
        transition-all duration-300
        ${isHighlighted ? "ring-2 ring-amber-400 ring-offset-2 shadow-lg" : "border-stone-200"}
        ${isActive ? "border-amber-300 shadow-md" : ""}
        ${className}
      `}
    >
      {/* Header - Always visible */}
      <button
        onClick={handleToggle}
        className={`
          w-full
          flex items-center gap-4
          p-5
          text-left
          hover:bg-stone-50
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400
        `}
        aria-expanded={isExpanded}
        aria-controls={`${id}-content`}
      >
        {/* Icon */}
        <div
          className={`
            flex-shrink-0
            w-12 h-12
            flex items-center justify-center
            rounded-xl
            text-2xl
            ${isExpanded ? "bg-amber-100" : "bg-stone-100"}
            transition-colors
          `}
        >
          {icon}
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
          {description && (
            <p className="text-sm text-stone-500 truncate">{description}</p>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        <div
          className={`
            flex-shrink-0
            w-8 h-8
            flex items-center justify-center
            rounded-full
            bg-stone-100
            transition-transform duration-300
            ${isExpanded ? "rotate-180" : ""}
          `}
        >
          <svg
            className="w-5 h-5 text-stone-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Content - Expandable */}
      <div
        id={`${id}-content`}
        className={`
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="p-5 pt-0 border-t border-stone-100">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * SectionGrid - Grid layout for multiple sections
 */
export function SectionGrid({
  children,
  columns = 2,
  className = ""
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  };

  return (
    <div
      className={`
        grid
        ${gridCols[columns]}
        gap-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * SectionNavigation - Horizontal scrolling section tabs
 */
export function SectionNavigation({
  sections,
  activeSection,
  onSelect,
  className = ""
}: {
  sections: Array<{ id: string; title: string; icon: string }>;
  activeSection?: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`
        w-full overflow-x-auto
        bg-white border-b border-stone-200
        sticky top-0 z-10
        ${className}
      `}
    >
      <nav className="flex gap-1 px-4 py-2 min-w-max">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={`
              flex items-center gap-2
              px-4 py-2
              rounded-lg
              text-sm font-medium
              transition-all
              ${activeSection === section.id
                ? "bg-amber-100 text-amber-700"
                : "text-stone-600 hover:bg-stone-100"
              }
            `}
          >
            <span>{section.icon}</span>
            <span>{section.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/**
 * MiniSectionCard - Compact version for grids
 */
export function MiniSectionCard({
  id,
  title,
  icon,
  value,
  onClick,
  isActive = false,
  className = ""
}: {
  id: string;
  title: string;
  icon: string;
  value?: string;
  onClick?: (id: string) => void;
  isActive?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={() => onClick?.(id)}
      className={`
        p-4
        bg-white
        rounded-xl
        border
        text-left
        transition-all
        hover:shadow-md hover:border-amber-200
        ${isActive ? "border-amber-400 shadow-md bg-amber-50" : "border-stone-200"}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-medium text-stone-900">{title}</h4>
          {value && (
            <p className="text-sm text-stone-500">{value}</p>
          )}
        </div>
      </div>
    </button>
  );
}
