"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VoiceProvider, useVoice } from "@humeai/voice-react";

interface VoiceWidgetButtonProps {
  onMessage: (text: string, role?: "user" | "assistant") => void;
  onDestinationMentioned?: (destination: string) => void;
  userId?: string;
  userName?: string;
  isReturningUser?: boolean;
  userFacts?: string[];
  size?: 'small' | 'large';
  centered?: boolean;
}

// Destinations to detect in conversation
const DESTINATIONS = [
  'portugal', 'lisbon', 'porto',
  'spain', 'barcelona', 'madrid',
  'cyprus', 'nicosia', 'limassol',
  'dubai', 'abu dhabi', 'uae',
  'malta', 'valletta',
  'thailand', 'bangkok', 'phuket',
  'bali', 'indonesia',
  'mexico', 'mexico city', 'playa del carmen',
  'canada', 'toronto', 'vancouver',
  'australia', 'sydney', 'melbourne',
  'germany', 'berlin', 'munich',
  'netherlands', 'amsterdam',
  'france', 'paris',
  'italy', 'rome', 'milan',
  'greece', 'athens',
  'croatia', 'zagreb', 'split',
  'estonia', 'tallinn',
];

function VoiceWidgetButton({
  onMessage,
  onDestinationMentioned,
  userId,
  userName,
  isReturningUser,
  userFacts,
  size = 'small',
  centered = false,
}: VoiceWidgetButtonProps) {
  const { connect, disconnect, status, messages, sendUserInput } = useVoice();
  const [isPending, setIsPending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastSentMsgId = useRef<string | null>(null);
  const lastDetectedDestination = useRef<string | null>(null);

  // Build system prompt with user context
  const buildSystemPrompt = () => {
    const topicsList = userFacts?.slice(0, 3).join(', ') || '';

    return `USER_CONTEXT:
name: ${userName || 'unknown'}
${topicsList ? `recent_interests: ${topicsList}` : ''}
status: ${isReturningUser ? `returning_user` : 'new_user'}

RETURNING_USER_GREETING:
${isReturningUser && userName ? `This is ${userName}'s return visit. Greet them warmly: "Welcome back, ${userName}! Ready to continue exploring your relocation options?"` : ''}
${!isReturningUser && userName ? `New user named ${userName}. Greet them: "Hello ${userName}! I'm ATLAS, your relocation advisor. Where are you thinking of moving?"` : ''}
${!userName ? `Unknown user. Greet them: "Hello! I'm ATLAS, your AI relocation advisor. Where would you like to relocate?"` : ''}

IDENTITY:
- You ARE ATLAS, an expert relocation advisor
- NEVER say "As a language model" or "I don't have access"
- Expertise: visa requirements, cost of living, digital nomad options, job markets

RULES:
- Use their name occasionally (not every message)
- Provide data-driven advice (costs, timelines, requirements)
- End with a relevant follow-up question
- Compare destinations when helpful`;
  };

  // Detect destination mentions in messages
  const detectDestination = (text: string) => {
    const lowerText = text.toLowerCase();
    for (const dest of DESTINATIONS) {
      if (lowerText.includes(dest) && dest !== lastDetectedDestination.current) {
        lastDetectedDestination.current = dest;
        onDestinationMentioned?.(dest);
        return;
      }
    }
  };

  // Track if ATLAS is speaking
  useEffect(() => {
    const playbackMsgs = messages.filter((m: any) =>
      m.type === "assistant_message" || m.type === "assistant_end"
    );
    const lastPlayback = playbackMsgs[playbackMsgs.length - 1];
    setIsPlaying(lastPlayback?.type === "assistant_message");
  }, [messages]);

  // Forward conversation messages and detect destinations
  useEffect(() => {
    const conversationMsgs = messages.filter(
      (m: any) => (m.type === "user_message" || m.type === "assistant_message") && m.message?.content
    );

    if (conversationMsgs.length > 0) {
      const lastMsg = conversationMsgs[conversationMsgs.length - 1] as any;
      const msgId = lastMsg?.id || `${conversationMsgs.length}-${lastMsg?.message?.content?.slice(0, 20)}`;

      if (lastMsg?.message?.content && msgId !== lastSentMsgId.current) {
        const isUser = lastMsg.type === "user_message";
        const content = lastMsg.message.content;

        lastSentMsgId.current = msgId;
        onMessage(content, isUser ? "user" : "assistant");

        // Detect destinations in both user and assistant messages
        detectDestination(content);
      }
    }
  }, [messages, onMessage, onDestinationMentioned]);

  const handleToggle = useCallback(async () => {
    if (status.value === "connected") {
      disconnect();
    } else {
      setIsPending(true);

      try {
        const res = await fetch("/api/hume-token");
        const { accessToken } = await res.json();

        const systemPrompt = buildSystemPrompt();
        const configId = (process.env.NEXT_PUBLIC_HUME_CONFIG_ID || "").trim();

        const sessionIdWithName = userName
          ? `${userName}|${userId || Date.now()}`
          : `anon_${Date.now()}`;

        await connect({
          auth: { type: 'accessToken' as const, value: accessToken },
          configId: configId,
          sessionSettings: {
            type: 'session_settings' as const,
            systemPrompt,
            customSessionId: sessionIdWithName,
          }
        });

        setTimeout(() => {
          sendUserInput("speak your greeting");
        }, 500);

      } catch (e) {
        console.error("Voice connect error:", e);
      } finally {
        setIsPending(false);
      }
    }
  }, [connect, disconnect, status.value, sendUserInput, userId, userName]);

  const isConnected = status.value === "connected";

  // Size classes based on prop
  const sizeClasses = size === 'large'
    ? 'w-28 h-28 md:w-36 md:h-36'
    : 'w-16 h-16';

  const iconSize = size === 'large' ? 'w-12 h-12 md:w-14 md:h-14' : 'w-7 h-7';
  const spinnerSize = size === 'large' ? 'w-10 h-10' : 'w-6 h-6';

  // Position classes - fixed bottom-right OR inline
  const positionClasses = centered
    ? '' // No fixed positioning when centered
    : 'fixed bottom-6 right-6 z-50';

  return (
    <div className={`flex flex-col items-center gap-4 ${centered ? '' : ''}`}>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`
          ${positionClasses}
          ${sizeClasses}
          rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${size === 'large' ? 'shadow-[0_0_60px_rgba(251,191,36,0.3)]' : 'shadow-2xl'}
          ${isConnected
            ? isPlaying
              ? 'bg-amber-500 scale-110 shadow-amber-500/50'
              : 'bg-green-500 shadow-green-500/50'
            : isPending
              ? 'bg-gray-400 cursor-not-allowed'
              : size === 'large'
                ? 'bg-white/90 hover:bg-white hover:scale-105 border-4 border-white/50 hover:border-amber-300'
                : 'bg-white hover:bg-amber-50 hover:scale-110 shadow-black/20 hover:shadow-amber-500/30'
          }
          ${size === 'large' && !isConnected && !isPending ? 'animate-pulse' : ''}
        `}
        title={isConnected ? (isPlaying ? "ATLAS is speaking..." : "Listening...") : "Tap to talk to ATLAS"}
      >
        {isPending ? (
          <div className={`${spinnerSize} border-4 border-amber-500 border-t-transparent rounded-full animate-spin`} />
        ) : isConnected ? (
          isPlaying ? (
            // Speaking animation - sound waves
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`${size === 'large' ? 'w-2' : 'w-1'} bg-white rounded-full animate-pulse`}
                  style={{
                    height: size === 'large' ? `${24 + (i % 2) * 16}px` : `${12 + (i % 2) * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.4s'
                  }}
                />
              ))}
            </div>
          ) : (
            // Listening animation - pulsing mic
            <div className="relative">
              <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              </svg>
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            </div>
          )
        ) : (
          // Idle mic icon
          <svg className={`${iconSize} text-stone-700`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
          </svg>
        )}
      </button>

      {/* Status/instruction label - only when centered */}
      {centered && (
        <span className={`
          text-lg font-medium
          ${isConnected
            ? isPlaying
              ? 'text-amber-400'
              : 'text-green-400'
            : 'text-white/80'
          }
        `}>
          {isPending
            ? "Connecting..."
            : isConnected
              ? isPlaying
                ? "ATLAS is speaking..."
                : "Listening..."
              : "Tap to talk to ATLAS"
          }
        </span>
      )}

      {/* Floating status label - only when NOT centered */}
      {!centered && isConnected && (
        <span className={`
          absolute -top-8 left-1/2 -translate-x-1/2
          px-2 py-1 rounded text-xs font-medium whitespace-nowrap
          ${isPlaying ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}
        `}>
          {isPlaying ? 'Speaking...' : 'Listening...'}
        </span>
      )}
    </div>
  );
}

export function VoiceWidget({
  onMessage,
  onDestinationMentioned,
  userId,
  userName,
  isReturningUser,
  userFacts,
  size = 'small',
  centered = false,
}: {
  onMessage: (text: string, role?: "user" | "assistant") => void;
  onDestinationMentioned?: (destination: string) => void;
  userId?: string;
  userName?: string;
  isReturningUser?: boolean;
  userFacts?: string[];
  size?: 'small' | 'large';
  centered?: boolean;
}) {
  return (
    <VoiceProvider
      onError={(err) => console.error("[ATLAS Voice] Error:", err)}
      onOpen={() => console.log("[ATLAS Voice] Connected")}
      onClose={(e) => console.log("[ATLAS Voice] Closed:", e)}
    >
      <VoiceWidgetButton
        onMessage={onMessage}
        onDestinationMentioned={onDestinationMentioned}
        userId={userId}
        userName={userName}
        isReturningUser={isReturningUser}
        userFacts={userFacts}
        size={size}
        centered={centered}
      />
    </VoiceProvider>
  );
}
