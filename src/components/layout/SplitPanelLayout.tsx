"use client";

import { ReactNode } from "react";

interface SplitPanelLayoutProps {
  children: ReactNode;
  sidebarWidth?: string; // e.g., "380px" or "30%"
  className?: string;
}

/**
 * SplitPanelLayout - Main layout for the redesigned Relocation Quest
 *
 * Provides a responsive split-panel layout:
 * - Main panel (left): Rich content, visualizations, destination info
 * - Sidebar (right): CopilotChat + Hume voice widget
 *
 * On mobile: Sidebar becomes a slide-out drawer
 *
 * Usage:
 * <SplitPanelLayout>
 *   <MainPanel>...</MainPanel>
 *   <ChatSidebar>...</ChatSidebar>
 * </SplitPanelLayout>
 */
export function SplitPanelLayout({
  children,
  sidebarWidth = "380px",
  className = ""
}: SplitPanelLayoutProps) {
  return (
    <div
      className={`
        min-h-screen w-full
        flex flex-col lg:flex-row
        bg-gradient-to-br from-stone-50 via-white to-stone-100
        ${className}
      `}
      style={{
        // CSS custom property for sidebar width
        "--sidebar-width": sidebarWidth,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * MainPanel - Left content area (70% on desktop)
 * Contains hero, stats, sections, city profiles
 */
export function MainPanel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`
        flex-1
        lg:mr-[var(--sidebar-width)]
        overflow-y-auto
        ${className}
      `}
    >
      {children}
    </main>
  );
}

/**
 * ChatSidebar - Right sidebar (30% on desktop, fixed position)
 * Contains CopilotChat and Hume voice widget
 */
export function ChatSidebar({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={`
        fixed right-0 top-0 bottom-0
        w-[var(--sidebar-width)]
        bg-white
        border-l border-stone-200
        shadow-xl
        flex flex-col
        z-40

        /* Mobile: Hidden by default, shown via toggle */
        hidden lg:flex

        ${className}
      `}
    >
      {children}
    </aside>
  );
}

/**
 * MobileSidebarToggle - Button to open sidebar on mobile
 */
export function MobileSidebarToggle({
  onClick,
  isOpen = false
}: {
  onClick: () => void;
  isOpen?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        lg:hidden
        fixed bottom-24 right-4
        z-50
        w-14 h-14
        rounded-full
        bg-stone-900 text-white
        shadow-lg
        flex items-center justify-center
        transition-transform
        ${isOpen ? "rotate-180" : ""}
      `}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={isOpen
            ? "M6 18L18 6M6 6l12 12"
            : "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          }
        />
      </svg>
    </button>
  );
}
