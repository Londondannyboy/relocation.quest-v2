"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VoiceProvider, useVoice } from "@humeai/voice-react";

interface VoiceButtonProps {
  onMessage: (text: string, role?: "user" | "assistant") => void;
  userId?: string;
  userName?: string;
  isReturningUser?: boolean;
  userFacts?: string[];
}

function VoiceButton({ onMessage, userId, userName, isReturningUser, userFacts }: VoiceButtonProps) {
  const { connect, disconnect, status, messages, sendUserInput } = useVoice();
  const [isPending, setIsPending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastSentMsgId = useRef<string | null>(null);

  // Build system prompt with user context for Hume
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

  // Track if ATLAS is speaking
  useEffect(() => {
    const playbackMsgs = messages.filter((m: any) =>
      m.type === "assistant_message" || m.type === "assistant_end"
    );
    const lastPlayback = playbackMsgs[playbackMsgs.length - 1];
    setIsPlaying(lastPlayback?.type === "assistant_message");
  }, [messages]);

  // Forward conversation messages to parent (which sends to CopilotKit)
  useEffect(() => {
    const conversationMsgs = messages.filter(
      (m: any) => (m.type === "user_message" || m.type === "assistant_message") && m.message?.content
    );

    if (conversationMsgs.length > 0) {
      const lastMsg = conversationMsgs[conversationMsgs.length - 1] as any;
      const msgId = lastMsg?.id || `${conversationMsgs.length}-${lastMsg?.message?.content?.slice(0, 20)}`;

      if (lastMsg?.message?.content && msgId !== lastSentMsgId.current) {
        const isUser = lastMsg.type === "user_message";
        console.log(`[ATLAS Voice] ${isUser ? 'User' : 'ATLAS'}:`, lastMsg.message.content.slice(0, 80));
        lastSentMsgId.current = msgId;
        onMessage(lastMsg.message.content, isUser ? "user" : "assistant");
      }
    }
  }, [messages, onMessage]);

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

        console.log('[ATLAS Session] ================================');
        console.log('[ATLAS Session] userName:', userName);
        console.log('[ATLAS Session] userId:', userId);
        console.log('[ATLAS Session] isReturningUser:', isReturningUser);
        console.log('[ATLAS Session] ================================');

        await connect({
          auth: { type: 'accessToken' as const, value: accessToken },
          configId: configId,
          sessionSettings: {
            type: 'session_settings' as const,
            systemPrompt,
            customSessionId: sessionIdWithName,
          }
        });

        console.log('[ATLAS Session] Connected successfully');

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

  return (
    <div className="flex flex-col items-center gap-2 relative z-50">
      {/* ATLAS Avatar - clickable to start voice */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`relative z-50 w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden transition-all cursor-pointer ${
          isConnected
            ? isPlaying
              ? "ring-4 ring-amber-400 animate-pulse shadow-[0_0_30px_rgba(251,191,36,0.5)]"
              : "ring-4 ring-green-400 shadow-[0_0_30px_rgba(74,222,128,0.5)]"
            : isPending
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-105 hover:shadow-[0_0_40px_rgba(244,234,213,0.4)] border-4 border-[#f4ead5]/30"
        } shadow-2xl`}
        style={{ pointerEvents: 'auto' }}
        title={isConnected ? (isPlaying ? "ATLAS is speaking..." : "Listening... (tap to stop)") : "Tap to speak with ATLAS"}
      >
        {/* ATLAS avatar image */}
        <img
          src="/atlas-avatar.jpg"
          alt="ATLAS - Your Relocation Advisor"
          className={`w-full h-full object-cover ${isPending ? 'grayscale' : ''}`}
        />

        {/* Overlay for connected states */}
        {isConnected && (
          <div className={`absolute inset-0 flex items-center justify-center ${
            isPlaying ? 'bg-amber-500/30' : 'bg-green-500/30'
          }`}>
            {isPlaying ? (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${20 + (i % 2) * 15}px`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-8 h-8 bg-white/80 rounded-full animate-ping" />
            )}
          </div>
        )}

        {/* Loading spinner */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* ATLAS name badge */}
      <div className="bg-[#f4ead5] text-[#2a231a] text-sm px-4 py-1.5 rounded-full font-semibold shadow-lg -mt-4">
        ATLAS
      </div>

      {/* Status text */}
      <span className={`text-sm font-medium mt-1 ${isConnected ? 'text-white' : 'text-[#d4c4a8]'}`}>
        {isPending
          ? "Connecting..."
          : isConnected
          ? isPlaying
            ? "ATLAS is speaking..."
            : "Listening..."
          : "Tap to speak with ATLAS"}
      </span>
    </div>
  );
}

export function VoiceInput({
  onMessage,
  userId,
  userName,
  isReturningUser,
  userFacts,
}: {
  onMessage: (text: string, role?: "user" | "assistant") => void;
  userId?: string;
  userName?: string;
  isReturningUser?: boolean;
  userFacts?: string[];
}) {
  return (
    <VoiceProvider
      onError={(err) => console.error("[ATLAS Voice] Error:", err)}
      onOpen={() => console.log("[ATLAS Voice] Connected")}
      onClose={(e) => console.log("[ATLAS Voice] Closed:", e)}
    >
      <VoiceButton
        onMessage={onMessage}
        userId={userId}
        userName={userName}
        isReturningUser={isReturningUser}
        userFacts={userFacts}
      />
    </VoiceProvider>
  );
}
