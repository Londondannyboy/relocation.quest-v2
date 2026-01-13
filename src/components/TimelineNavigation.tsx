"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  label: string;
  icon: string;
}

const SECTIONS: Section[] = [
  { id: "overview", label: "Overview", icon: "🌍" },
  { id: "visas", label: "Visas", icon: "📋" },
  { id: "costs", label: "Cost of Living", icon: "💰" },
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "company", label: "Company", icon: "🏢" },
  { id: "property", label: "Property", icon: "🏠" },
  { id: "expatriate", label: "Tax Scheme", icon: "📊" },
  { id: "residency", label: "Residency", icon: "🛂" },
];

interface TimelineNavigationProps {
  activeSection?: string;
  availableSections?: string[];
  onSectionClick?: (sectionId: string) => void;
}

export function TimelineNavigation({
  activeSection = "overview",
  availableSections,
  onSectionClick,
}: TimelineNavigationProps) {
  const [currentSection, setCurrentSection] = useState(activeSection);

  useEffect(() => {
    setCurrentSection(activeSection);
  }, [activeSection]);

  // Filter to only show sections that have data
  const visibleSections = availableSections
    ? SECTIONS.filter((s) => availableSections.includes(s.id))
    : SECTIONS;

  const handleClick = (sectionId: string) => {
    setCurrentSection(sectionId);
    onSectionClick?.(sectionId);

    // Smooth scroll to section
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = visibleSections.map((s) => ({
        id: s.id,
        element: document.getElementById(`section-${s.id}`),
      }));

      const scrollPosition = window.scrollY + 200; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const offsetTop = section.element.offsetTop;
          if (scrollPosition >= offsetTop) {
            setCurrentSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleSections]);

  const currentIndex = visibleSections.findIndex((s) => s.id === currentSection);
  const progress = visibleSections.length > 1
    ? (currentIndex / (visibleSections.length - 1)) * 100
    : 0;

  return (
    <nav className="sticky top-24 w-16 md:w-48 flex-shrink-0">
      <div className="relative">
        {/* Progress line background */}
        <div className="absolute left-[1.375rem] md:left-3 top-0 bottom-0 w-0.5 bg-white/10" />

        {/* Progress line fill */}
        <motion.div
          className="absolute left-[1.375rem] md:left-3 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />

        {/* Section dots */}
        <ul className="space-y-4">
          {visibleSections.map((section, index) => {
            const isActive = section.id === currentSection;
            const isPast = index <= currentIndex;

            return (
              <li key={section.id}>
                <button
                  onClick={() => handleClick(section.id)}
                  className={`
                    flex items-center gap-3 w-full text-left transition-all duration-200
                    ${isActive ? "opacity-100" : "opacity-60 hover:opacity-80"}
                  `}
                >
                  {/* Dot */}
                  <div
                    className={`
                      relative z-10 w-6 h-6 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isActive
                        ? "bg-gradient-to-br from-blue-500 to-purple-500 scale-110"
                        : isPast
                        ? "bg-blue-500/50"
                        : "bg-white/20"
                      }
                    `}
                  >
                    <span className="text-xs">{section.icon}</span>
                  </div>

                  {/* Label (hidden on mobile) */}
                  <span
                    className={`
                      hidden md:block text-sm transition-colors duration-200
                      ${isActive ? "text-white font-medium" : "text-white/60"}
                    `}
                  >
                    {section.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default TimelineNavigation;
