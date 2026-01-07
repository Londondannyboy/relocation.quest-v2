"use client";

import { useState, useEffect } from "react";

interface DestinationExpertAvatarProps {
  speaking?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

/**
 * DestinationExpertAvatar - Visual indicator when the Destination Expert is "speaking"
 *
 * Displays a distinct avatar with animation when the expert is active.
 * Used alongside ATLAS's responses to clearly indicate which agent is contributing.
 */
export function DestinationExpertAvatar({
  speaking = false,
  size = "md",
  showLabel = true,
}: DestinationExpertAvatarProps) {
  const [pulseActive, setPulseActive] = useState(false);

  // Animate when speaking
  useEffect(() => {
    if (speaking) {
      setPulseActive(true);
      const timer = setTimeout(() => setPulseActive(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [speaking]);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Avatar with Destination Expert image */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          overflow-hidden
          border-2 border-amber-300
          transition-all duration-300
          ${pulseActive ? "animate-pulse ring-2 ring-amber-400 ring-opacity-50" : ""}
          ${speaking ? "shadow-lg shadow-amber-200" : ""}
        `}
        title="Destination Expert"
      >
        <img
          src="/destination-expert-avatar.png"
          alt="Destination Expert"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={`
            text-amber-700 font-medium
            ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}
          `}
        >
          Destination Expert
        </span>
      )}
    </div>
  );
}

/**
 * DestinationExpertMessage - Wrapper for messages from the Destination Expert
 *
 * Provides visual distinction for expert responses in the chat.
 */
interface DestinationExpertMessageProps {
  children: React.ReactNode;
  brief?: string;
}

export function DestinationExpertMessage({ children, brief }: DestinationExpertMessageProps) {
  return (
    <div className="destination-expert-message my-4">
      {/* Header with avatar */}
      <div className="flex items-center gap-2 mb-2">
        <DestinationExpertAvatar speaking size="sm" showLabel />
      </div>

      {/* Brief summary if provided */}
      {brief && (
        <p className="text-sm text-amber-700 italic mb-2">{brief}</p>
      )}

      {/* Content (usually Generative UI components) */}
      <div className="pl-8 border-l-2 border-amber-200">{children}</div>
    </div>
  );
}

/**
 * DestinationExpertThinking - Loading state while expert is searching
 */
export function DestinationExpertThinking() {
  return (
    <div className="flex items-center gap-3 text-amber-600 my-4">
      <DestinationExpertAvatar speaking size="sm" showLabel={false} />
      <span className="text-sm animate-pulse">
        Finding destination information...
      </span>
    </div>
  );
}

export default DestinationExpertAvatar;
