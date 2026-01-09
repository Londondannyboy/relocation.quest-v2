"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import { useRenderToolCall, useCopilotChat, useCoAgent } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { VoiceWidget } from "@/components/VoiceWidget";
import { ArticleGrid } from "@/components/generative-ui/ArticleGrid";
import { ArticleCard } from "@/components/generative-ui/ArticleCard";
import { LocationMap } from "@/components/generative-ui/LocationMap";
import { Timeline } from "@/components/generative-ui/Timeline";
import { TopicContext } from "@/components/generative-ui/TopicContext";
import { TopicImage } from "@/components/generative-ui/TopicImage";
// New polished components for shock and awe
import { DestinationCard, DestinationCardCompact } from "@/components/generative-ui/DestinationCard";
import { CostOfLivingChart } from "@/components/generative-ui/CostOfLivingChart";
import { DestinationComparison } from "@/components/generative-ui/DestinationComparison";
import { VisaGrid } from "@/components/generative-ui/VisaGrid";
import { ToolCTA } from "@/components/generative-ui/ToolCTA";
import { DestinationExpertMessage, DestinationExpertThinking } from "@/components/DestinationExpert";
import { CustomUserMessage, ChatUserContext } from "@/components/ChatMessages";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";

// Animated example prompts that rotate
const EXAMPLE_PROMPTS = [
  "Compare Portugal and Spain for digital nomads",
  "What visa do I need for Thailand?",
  "Cost of living in Bali vs Mexico City",
  "Best countries for remote work",
  "How do I get a Golden Visa in Greece?",
  "UK relocation tax allowance explained",
];

function AnimatedExamples() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % EXAMPLE_PROMPTS.length);
        setIsVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-8 flex items-center justify-center overflow-hidden">
      <p className={`text-white/70 text-sm md:text-base transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        &ldquo;{EXAMPLE_PROMPTS[currentIndex]}&rdquo;
      </p>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="flex items-center justify-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-2 text-white/60 text-xs">
        <span>Powered by</span>
      </div>
      <a href="https://copilotkit.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span className="text-xs font-medium">CopilotKit</span>
      </a>
      <a href="https://hume.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span className="text-xs font-medium">Hume AI</span>
      </a>
      <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
        <span className="text-xs font-medium">Neon</span>
      </a>
    </div>
  );
}

// Loading component for tool results
function ToolLoading({ title }: { title: string }) {
  return (
    <div className="bg-stone-50 rounded-lg p-4 animate-pulse">
      <div className="text-sm text-stone-400">{title}</div>
      <div className="flex items-center justify-center h-20">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

function TopicButton({ topic, onClick }: { topic: string; onClick: (topic: string) => void }) {
  return (
    <button
      onClick={() => onClick(topic)}
      className="px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 bg-[#1a1612]/60 text-white hover:bg-[#f4ead5] hover:text-[#2a231a] hover:scale-105 cursor-pointer border-2 border-white/40 hover:border-[#8b6914] backdrop-blur-sm shadow-lg"
    >
      {topic}
    </button>
  );
}

// Smart assistant message - shows BOTH ATLAS's intro AND Destination Expert UI when available
function SmartAssistantMessage({ message }: { message?: { generativeUI?: () => React.ReactNode; content?: string } }) {
  // Get generative UI from tools (Destination Expert's output)
  const generativeUI = message?.generativeUI?.();

  // Check if generativeUI actually has content (not null, undefined, or empty)
  const hasValidGenerativeUI = generativeUI !== null && generativeUI !== undefined;

  // Get ATLAS's text content - clean it up
  const rawContent = typeof message?.content === "string" ? message.content : "";
  // Filter out empty, whitespace-only, or tool call artifacts
  const textContent = rawContent.trim();
  const isValidText = textContent.length > 2 &&
    !textContent.startsWith("{") &&
    !textContent.includes("tool_call") &&
    !textContent.includes("delegate_to");

  // If there's tool UI (Destination Expert) with actual content, show BOTH ATLAS's intro AND expert's content
  if (hasValidGenerativeUI) {
    return (
      <div className="space-y-3 mb-4">
        {/* ATLAS's brief intro if present */}
        {isValidText && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300">
                <img src="/atlas-icon.svg" alt="ATLAS" className="w-full h-full" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-amber-800">ATLAS</span>
              </div>
              <div className="bg-amber-50 rounded-lg rounded-tl-none p-3 text-stone-800 border-l-2 border-amber-300">
                {textContent}
              </div>
            </div>
          </div>
        )}

        {/* Destination Expert's research results - only show if there's actual content */}
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300">
              <img src="/expert-icon.svg" alt="Destination Expert" className="w-full h-full" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-amber-700">Destination Expert</span>
            </div>
            <div className="bg-amber-50/50 rounded-lg rounded-tl-none p-3 text-stone-800 border-l-2 border-amber-200">
              {generativeUI}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's valid text but no tool UI, show ATLAS's response only
  if (isValidText) {
    return (
      <div className="flex gap-3 mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300">
            <img src="/atlas-icon.svg" alt="ATLAS" className="w-full h-full" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-amber-800">ATLAS</span>
          </div>
          <div className="bg-amber-50 rounded-lg rounded-tl-none p-3 text-stone-800 border-l-2 border-amber-300">
            {textContent}
          </div>
        </div>
      </div>
    );
  }

  // Nothing valid to show - return null (no empty messages!)
  return null;
}

// Context for sharing background setter with render callbacks
import { createContext, useContext } from 'react';
const BackgroundContext = createContext<{ setBackground: (url: string | null) => void }>({ setBackground: () => {} });

// Component to set background when mounted (used in render callbacks)
function BackgroundUpdater({ imageUrl }: { imageUrl: string }) {
  const { setBackground } = useContext(BackgroundContext);
  useEffect(() => {
    if (imageUrl) {
      console.log('[BackgroundUpdater] Setting background to:', imageUrl);
      setBackground(imageUrl);
    }
  }, [imageUrl, setBackground]);
  return null;
}

// Helper to extract topic from user query (for Zep storage)
function extractTopicFromQuery(query: string): string | null {
  const lowerQuery = query.toLowerCase();

  // Common query patterns to extract topic from
  const patterns = [
    /tell me about (.+)/i,
    /what (?:is|was|are|were) (?:the )?(.+)/i,
    /(?:show|find) (?:me )?(?:an? )?(?:image|picture|photo) of (.+)/i,
    /where (?:is|was) (?:the )?(.+)/i,
    /(?:who|what) (?:is|was) (.+)/i,
    /history of (.+)/i,
    /learn about (.+)/i,
    /explore (.+)/i,
    /(.+?) history/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      // Clean up the extracted topic
      let topic = match[1].trim()
        .replace(/\?+$/, '')  // Remove trailing ?
        .replace(/^the /i, '')  // Remove leading "the"
        .replace(/please$/i, '')  // Remove trailing "please"
        .trim();

      // Only return if topic is meaningful (2+ words or known location)
      if (topic.length >= 4) {
        // Capitalize first letter of each word
        return topic.split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }
  }

  // Fallback: Check for known destination topics in the query
  const knownTopics = [
    'portugal', 'spain', 'cyprus', 'dubai', 'malta', 'canada',
    'australia', 'digital nomad', 'visa', 'cost of living',
    'relocation', 'remote work', 'expat', 'move abroad',
  ];

  for (const topic of knownTopics) {
    if (lowerQuery.includes(topic)) {
      return topic.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  return null;
}

// Helper to store topic interest to Zep (for returning user context)
async function storeTopicToZep(userId: string, topic: string, name?: string) {
  if (!userId || !topic || topic.length < 3) return;
  try {
    await fetch('/api/zep/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: 'topic_interest',
        topic,
        name,
      }),
    });
    console.log('[Zep] Stored topic interest:', topic);
  } catch (e) {
    console.warn('[Zep] Failed to store topic:', e);
  }
}

// Helper to store user profile to Zep
async function storeUserProfileToZep(userId: string, name: string) {
  if (!userId || !name) return;
  try {
    await fetch('/api/zep/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: 'user_profile',
        name,
      }),
    });
    console.log('[Zep] Stored user profile:', name);
  } catch (e) {
    console.warn('[Zep] Failed to store profile:', e);
  }
}

// Helper to store messages to Zep memory
async function storeToZep(userId: string, message: string, role: "user" | "assistant", name?: string) {
  if (!userId || message.length < 5) return;
  try {
    await fetch('/api/zep/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message, role, name }),
    });
  } catch (e) {
    console.error('[ATLAS] Failed to store to Zep:', e);
  }
}

// Agent state - synced to backend via useCoAgent
type AgentState = {
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export default function Home() {
  const { appendMessage } = useCopilotChat();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // User profile state for Zep personalization
  const [userProfile, setUserProfile] = useState<{
    preferred_name?: string;
    isReturningUser?: boolean;
    facts?: string[];
  }>({});

  // Dynamic background based on current topic or revolving hero images
  const [topicBackground, setTopicBackground] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch hero images for revolving background
  useEffect(() => {
    async function fetchHeroImages() {
      try {
        const res = await fetch('/api/unsplash?type=hero');
        if (res.ok) {
          const data = await res.json();
          setHeroImages(data.images || []);
        }
      } catch (e) {
        console.error('[Background] Failed to fetch hero images:', e);
      }
    }
    fetchHeroImages();
  }, []);

  // Revolving background effect (only when no specific destination is set)
  useEffect(() => {
    if (topicBackground || heroImages.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentHeroIndex(prev => (prev + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 500); // Half-second fade
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [topicBackground, heroImages.length]);

  // Handler for when a destination is mentioned in voice chat
  const handleDestinationMentioned = useCallback(async (destination: string) => {
    console.log('[Background] Destination mentioned:', destination);
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(destination)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setIsTransitioning(true);
          setTimeout(() => {
            setTopicBackground(data.url);
            setIsTransitioning(false);
          }, 300);
        }
      }
    } catch (e) {
      console.error('[Background] Failed to fetch destination image:', e);
    }
  }, []);

  // Fetch user profile and Zep context on mount
  useEffect(() => {
    async function fetchUserContext() {
      if (!user?.id) return;

      // Fetch user profile from our DB
      try {
        const profileRes = await fetch('/api/user-profile');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserProfile(prev => ({ ...prev, preferred_name: profile.preferred_name }));
        }
      } catch (e) {
        console.error('[ATLAS] Failed to fetch profile:', e);
      }

      // Fetch Zep context
      try {
        const zepRes = await fetch(`/api/zep/user?userId=${user.id}`);
        if (zepRes.ok) {
          const zepData = await zepRes.json();
          setUserProfile(prev => ({
            ...prev,
            isReturningUser: zepData.isReturningUser,
            facts: zepData.facts?.map((f: { fact?: string }) => f.fact).filter(Boolean),
          }));
          console.log('[ATLAS] User context:', zepData.isReturningUser ? 'returning' : 'new', 'with', zepData.facts?.length || 0, 'facts');
        }
      } catch (e) {
        console.error('[ATLAS] Failed to fetch Zep context:', e);
      }
    }
    fetchUserContext();
  }, [user?.id]);

  // Get user's first name for personalization
  const userName = userProfile.preferred_name || user?.name?.split(' ')[0] || user?.name;

  // Sync user to agent state via useCoAgent
  // The backend tool get_my_profile reads from ctx.deps.state.user
  const { state: agentState, setState: setAgentState } = useCoAgent<AgentState>({
    name: "atlas_agent",
    initialState: { user: undefined },
  });

  // Sync logged-in user to agent state and store profile to Zep
  useEffect(() => {
    if (user?.id && !agentState?.user?.id) {
      const userInfo = {
        id: user.id,
        name: userName || user.name || 'Unknown',
        email: user.email || '',
      };
      setAgentState(prev => ({ ...prev, user: userInfo }));
      console.log('[ATLAS] User synced to agent state:', userInfo);

      // Store user profile to Zep for returning user recognition
      const displayName = userName || user.name?.split(' ')[0];
      if (displayName) {
        storeUserProfileToZep(user.id, displayName);
      }
    }
  }, [user?.id, user?.name, user?.email, userName, agentState?.user?.id, setAgentState]);

  // Handle voice messages
  // IMPORTANT: Only forward USER messages to CopilotKit to trigger tools
  // ATLAS's VOICE responses should NOT be printed - voice IS the response
  // Destination Expert UI will appear via useRenderToolCall when tools run
  const handleVoiceMessage = useCallback((text: string, role?: "user" | "assistant") => {
    console.log(`[ATLAS] Voice ${role}: ${text.slice(0, 50)}...`);

    // Only forward USER messages to CopilotKit
    // This triggers the agent which runs tools -> Destination Expert UI appears
    // ATLAS's spoken response should NOT appear as text (ruins the magic)
    if (role === "user") {
      appendMessage(new TextMessage({ content: text, role: Role.User }));

      // Extract topic from user query and store to Zep
      if (user?.id) {
        const topic = extractTopicFromQuery(text);
        if (topic) {
          storeTopicToZep(user.id, topic, userProfile.preferred_name);
        }
      }
    }
    // Note: ATLAS's voice response is handled by Hume - don't duplicate in chat
  }, [appendMessage, user?.id, userProfile.preferred_name]);

  const handleTopicClick = useCallback((topic: string) => {
    // 1. Immediately change background (don't wait for agent)
    handleDestinationMentioned(topic);

    // 2. Send to CopilotKit for agent processing
    const message = `Tell me about ${topic}`;
    appendMessage(new TextMessage({ content: message, role: Role.User }));

    // 3. Store topic as structured entity to Zep
    if (user?.id) {
      storeTopicToZep(user.id, topic, userProfile.preferred_name);
    }
  }, [appendMessage, handleDestinationMentioned, user?.id, userProfile.preferred_name]);

  // =============================================================================
  // GENERATIVE UI: Render tool results from Pydantic AI agent
  // These render IN the CopilotSidebar chat when the agent calls tools
  // =============================================================================

  useRenderToolCall({
    name: "search_destinations",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Searching articles..." />;
      if (!result?.found) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "No articles found"}
          </div>
        );
      }
      return <ArticleGrid articles={result.articles} query={result.query} />;
    },
  });

  useRenderToolCall({
    name: "show_article_card",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Loading article..." />;
      if (!result?.found || !result?.card) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "Article not found"}
          </div>
        );
      }
      return <ArticleCard {...result.card} />;
    },
  });

  useRenderToolCall({
    name: "show_map",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Loading map..." />;
      if (!result?.found || !result?.location) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "Location not found"}
          </div>
        );
      }
      return <LocationMap location={result.location} />;
    },
  });

  useRenderToolCall({
    name: "show_timeline",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Loading timeline..." />;
      if (!result?.found || !result?.events) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "No timeline available"}
          </div>
        );
      }
      return <Timeline era={result.era} events={result.events} />;
    },
  });

  // =============================================================================
  // NEW SHOCK & AWE COMPONENTS
  // These render beautiful UI for destination, visa, and cost queries
  // =============================================================================

  // Featured destinations grid
  useRenderToolCall({
    name: "show_featured_destinations",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Loading destinations..." />;
      if (!result?.found || !result?.destinations) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "Couldn't load destinations"}
          </div>
        );
      }
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-800">Featured Destinations</h3>
            <span className="text-sm text-stone-500">{result.total_destinations} countries</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {result.destinations.slice(0, 8).map((dest: { name: string; flag: string; region: string; slug: string; highlight?: string; featured?: boolean }) => (
              <DestinationCardCompact
                key={dest.slug}
                name={dest.name}
                flag={dest.flag}
                region={dest.region}
                slug={dest.slug}
              />
            ))}
          </div>
        </div>
      );
    },
  });

  // Visa options grid
  useRenderToolCall({
    name: "show_visa_timeline",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Loading visa information..." />;
      if (!result?.found || !result?.events) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "No visa information available"}
          </div>
        );
      }
      return (
        <VisaGrid
          country={result.destination}
          flag={result.flag || "🌍"}
          visas={result.events.map((e: { title: string; description: string; requirements?: string[]; isWorkPermit?: boolean; isResidencyPath?: boolean }) => ({
            name: e.title,
            description: e.description,
            requirements: e.requirements,
            isWorkPermit: e.isWorkPermit,
            isResidencyPath: e.isResidencyPath,
          }))}
          hero_image_url={result.hero_image_url}
        />
      );
    },
  });

  // Cost of living chart
  useRenderToolCall({
    name: "show_cost_of_living",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Loading cost data..." />;
      if (!result?.found || !result?.cities) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "No cost data available"}
          </div>
        );
      }
      return (
        <CostOfLivingChart
          country={result.country}
          flag={result.flag || "🌍"}
          cities={result.cities}
          job_market={result.job_market}
        />
      );
    },
  });

  // Destination comparison
  useRenderToolCall({
    name: "compare_two_destinations",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Comparing destinations..." />;
      if (!result?.found || !result?.comparison) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "Couldn't compare destinations"}
          </div>
        );
      }
      return <DestinationComparison comparison={result.comparison} />;
    },
  });

  // Full destination details
  useRenderToolCall({
    name: "get_destination_details",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Loading destination..." />;
      if (!result?.found || !result?.destination) {
        return (
          <div className="p-4 bg-stone-50 rounded-lg text-stone-500">
            {result?.message || "Destination not found"}
          </div>
        );
      }
      return (
        <DestinationCard
          name={result.destination.name}
          flag={result.destination.flag}
          region={result.destination.region}
          language={result.destination.language}
          hero_image_url={result.destination.hero_image_url}
          hero_subtitle={result.destination.hero_subtitle}
          quick_facts={result.quick_facts}
          highlights={result.highlights}
          visas={result.visas}
          slug={result.destination.slug || result.destination.name?.toLowerCase().replace(/\s+/g, '-')}
        />
      );
    },
  });

  // =============================================================================
  // INTERACTIVE TOOLS: Render CTAs to open tool pages
  // =============================================================================

  useRenderToolCall({
    name: "show_cost_calculator",
    render: ({ result, status }) => {
      if (status !== "complete" || !result?.found) return <ToolLoading title="Loading calculator..." />;
      return (
        <ToolCTA
          title={result.title}
          description={result.description}
          url={result.url}
          tool_type="cost_calculator"
          destination={result.destination}
        />
      );
    },
  });

  useRenderToolCall({
    name: "show_comparison_tool",
    render: ({ result, status }) => {
      if (status !== "complete" || !result?.found) return <ToolLoading title="Loading comparison..." />;
      return (
        <ToolCTA
          title={result.title}
          description={result.description}
          url={result.url}
          tool_type="comparison"
          destination1={result.destination1}
          destination2={result.destination2}
        />
      );
    },
  });

  useRenderToolCall({
    name: "show_visa_planner",
    render: ({ result, status }) => {
      if (status !== "complete" || !result?.found) return <ToolLoading title="Loading planner..." />;
      return (
        <ToolCTA
          title={result.title}
          description={result.description}
          url={result.url}
          tool_type="visa_planner"
          destination={result.destination}
        />
      );
    },
  });

  useRenderToolCall({
    name: "show_relocation_quiz",
    render: ({ result, status }) => {
      if (status !== "complete" || !result?.found) return <ToolLoading title="Loading quiz..." />;
      return (
        <ToolCTA
          title={result.title}
          description={result.description}
          url={result.url}
          tool_type="quiz"
        />
      );
    },
  });

  // =============================================================================
  // DESTINATION EXPERT: Render delegated research results
  // When ATLAS delegates to the Destination Expert, render with distinct styling
  // =============================================================================

  useRenderToolCall({
    name: "delegate_to_destination_expert",
    render: ({ result, status }) => {
      // Loading state
      if (status !== "complete" || !result) {
        return <DestinationExpertThinking />;
      }

      // Error state
      if (!result?.found) {
        return (
          <DestinationExpertMessage brief={result?.content}>
            <div className="p-4 bg-amber-50 rounded-lg text-amber-700">
              I couldn&apos;t find anything in the archives about that topic.
            </div>
          </DestinationExpertMessage>
        );
      }

      // Render the appropriate UI component based on what Destination Expert returned
      const uiComponent = result?.ui_component;
      const uiData = result?.ui_data || result;

      // Debug: Log what we received
      console.log('[Destination Expert UI] Result:', { uiComponent, hasUiData: !!result?.ui_data, heroImage: uiData?.hero_image });

      // TopicContext is rendered directly (it includes its own Destination Expert header)
      if (uiComponent === "TopicContext") {
        return (
          <>
            {/* Update hero background when topic has an image */}
            {uiData?.hero_image && <BackgroundUpdater imageUrl={uiData.hero_image} />}
            <TopicContext
              query={uiData?.query || ""}
              brief={uiData?.brief}
              articles={uiData?.articles}
              location={uiData?.location}
              era={uiData?.era}
              timeline_events={uiData?.timeline_events}
              hero_image={uiData?.hero_image}
            />
          </>
        );
      }

      // TopicImage - single image display (for "show me image of X")
      if (uiComponent === "TopicImage" && uiData?.hero_image) {
        return (
          <>
            <BackgroundUpdater imageUrl={uiData.hero_image} />
            <DestinationExpertMessage brief={uiData?.brief}>
              <TopicImage
                query={uiData?.query || ""}
                hero_image={uiData.hero_image}
                brief={uiData?.brief}
              />
            </DestinationExpertMessage>
          </>
        );
      }

      // Wrap other Destination Expert outputs in DestinationExpertMessage for distinct styling
      return (
        <DestinationExpertMessage brief={uiData?.brief || result?.content}>
          {uiComponent === "ArticleGrid" && uiData?.articles && (
            <ArticleGrid articles={uiData.articles} query={uiData.query} />
          )}
          {uiComponent === "LocationMap" && uiData?.location && (
            <LocationMap location={uiData.location} />
          )}
          {uiComponent === "Timeline" && uiData?.events && (
            <Timeline era={uiData.era} events={uiData.events} />
          )}
          {!uiComponent && result?.content && (
            <p className="text-stone-600">{result.content}</p>
          )}
        </DestinationExpertMessage>
      );
    },
  });

  // Build dynamic instructions with user context
  // NOTE: The backend middleware extracts user info by looking for "User Name:", "User ID:", etc.
  const instructions = user
    ? `You are ATLAS, a warm and knowledgeable relocation advisor helping people move abroad. You have expertise in visa requirements, cost of living, and destination guides.

## USER CONTEXT (for backend extraction)
- User Name: ${userName || user.name || 'unknown'}
- User ID: ${user.id}
- User Email: ${user.email || 'unknown'}
- Status: ${userProfile.isReturningUser ? 'Returning user' : 'New user'}
${userProfile.facts?.length ? `- Recent interests: ${userProfile.facts.slice(0, 3).join(', ')}` : ''}

## RULES FOR THIS USER
${userName ? `The user's name is "${userName}". Use their name occasionally (not every message).` : 'The user has not provided their name yet.'}
${userProfile.isReturningUser ? 'This is a RETURNING user - greet them warmly.' : ''}

## CRITICAL IDENTITY RULES
- NEVER say "I am a language model" or "I don't have access to personal information"
- You ARE ATLAS, a relocation expert. Stay in character always.
- NEVER output code, tool names, function calls, or technical text - speak naturally
- If asked "what is my name": ${userName ? `Answer "You're ${userName}, of course!"` : 'Say "I don\'t believe you\'ve told me your name yet. What should I call you?"'}
- If asked about yourself: "I'm ATLAS, your AI relocation advisor. I help people discover their perfect destination and navigate the move abroad."

## DESTINATION EXPERT DELEGATION
- Use delegate_to_destination_expert tool when users ask about destinations, visas, cost of living, or want to see visual content
- For major searches, say "Let me check the latest information..." BEFORE calling delegate_to_destination_expert
- For follow-up queries, just delegate silently
- The Destination Expert will find guides, comparison data, visa timelines - weave these findings into your advice

## TOOL USAGE
- delegate_to_destination_expert: For finding destination guides, visa info, cost comparisons
- search_destinations: For searching specific destination content

## OUTPUT RULES
- Keep responses SHORT and conversational (2-3 sentences max for greetings)
- NEVER output code snippets, function names, or technical syntax
- NEVER repeat yourself or echo facts back verbatim
- Speak naturally as an advisor helping someone plan their move
- End responses with a relevant follow-up question`
    : `You are ATLAS, a warm and knowledgeable relocation advisor helping people move abroad. The user is not logged in.

## CRITICAL IDENTITY RULES
- NEVER say "I am a language model" or "I don't have access to personal information"
- You ARE ATLAS, a relocation expert. Stay in character always.
- NEVER output code, tool names, function calls, or technical text - speak naturally
- If asked "what is my name": Say "I don't believe you've told me your name yet. What should I call you?"
- If asked about yourself: "I'm ATLAS, your AI relocation advisor. I help people discover their perfect destination and navigate the move abroad."

## DESTINATION EXPERT DELEGATION
- Use delegate_to_destination_expert tool when users ask about destinations, visas, cost of living, or want to see visual content
- For major searches, say "Let me check the latest information..." BEFORE calling delegate_to_destination_expert
- The Destination Expert will find guides, comparison data, visa timelines - weave these findings into your advice

## TOOL USAGE
- delegate_to_destination_expert: For finding destination guides, visa info, cost comparisons
- search_destinations: For searching specific destination content

## OUTPUT RULES
- Keep responses SHORT and conversational (2-3 sentences max for greetings)
- NEVER output code snippets, function names, or technical syntax
- Speak naturally as an advisor helping someone plan their move
- End responses with a relevant follow-up question`;

  // Build personalized initial message - keep it SHORT
  // Use extracted interests (not raw facts) for better UX
  const initialMessage = (() => {
    // Get clean interest from extracted interests array (not raw facts)
    const recentInterest = userProfile.facts
      ?.map((f: string) => {
        // Extract topic from fact patterns
        const match = f.match(/(?:interested in|asked about|discussed|talked about|curious about)\s+(.+)/i);
        return match?.[1]?.replace(/['"]/g, '').trim();
      })
      .filter(Boolean)[0];

    if (userName && userProfile.isReturningUser && recentInterest) {
      return `Welcome back, ${userName}. Last time we discussed ${recentInterest}. Shall we continue, or explore a new destination?`;
    } else if (userName && userProfile.isReturningUser) {
      return `Welcome back, ${userName}. Ready to continue your relocation journey?`;
    } else if (userName) {
      return `Hello ${userName}. I'm ATLAS, your relocation advisor. Where are you thinking of moving?`;
    } else {
      return "Hello. I'm ATLAS. Where would you like to relocate?";
    }
  })();

  // User context for custom chat components
  const chatUserContextValue = {
    userName: userName || user?.name?.split(' ')[0] || 'You',
    userImage: (user as any)?.image || undefined,
  };

  // Background context value - memoized to prevent re-renders
  const backgroundContextValue = { setBackground: setTopicBackground };

  return (
    <BackgroundContext.Provider value={backgroundContextValue}>
    <ChatUserContext.Provider value={chatUserContextValue}>
      <CopilotSidebar
        defaultOpen={false}
        clickOutsideToClose={false}
        instructions={instructions}
        labels={{
          title: "Destination Expert",
          initial: initialMessage,
        }}
        className="border-l border-stone-200"
        UserMessage={CustomUserMessage}
        AssistantMessage={SmartAssistantMessage}
      >
      {/* Main Content - Voice-First Hero */}
      <div className="bg-white text-black min-h-screen">
        {/* Hero Section - Full Screen with Revolving Background */}
        <section className="relative min-h-screen flex items-center justify-center bg-[#1a1612] overflow-hidden">
          {/* Background - Revolving or destination-specific */}
          <div className="absolute inset-0 z-0">
            <img
              src={topicBackground || heroImages[currentHeroIndex] || "/world-destinations.jpg"}
              alt=""
              className={`w-full h-full object-cover transition-all duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-70'}`}
              style={{ filter: 'brightness(0.85) contrast(1.05)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-lg">
              Relocation Quest
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto drop-shadow">
              Your AI guide to moving abroad
            </p>

            {/* Animated Examples */}
            <div className="mb-8">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Ask ATLAS anything</p>
              <AnimatedExamples />
            </div>

            {/* Centered Voice Widget - Main CTA */}
            <div className="mb-8">
              <VoiceWidget
                onMessage={handleVoiceMessage}
                onDestinationMentioned={handleDestinationMentioned}
                userId={user?.id}
                userName={userProfile.preferred_name || user?.name?.split(' ')[0] || user?.name}
                isReturningUser={userProfile.isReturningUser}
                userFacts={userProfile.facts}
                size="large"
                centered={true}
              />
            </div>

            {/* Topic Pills */}
            <div className="w-full max-w-xl mx-auto">
              <p className="text-white/60 text-sm mb-3">Or explore destinations:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Portugal', 'Spain', 'UK', 'Dubai', 'Thailand', 'Mexico'].map((topic) => (
                  <TopicButton key={topic} topic={topic} onClick={handleTopicClick} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['Digital Nomad Visa', 'Cost of Living', 'Tax Allowance'].map((topic) => (
                  <TopicButton key={topic} topic={topic} onClick={handleTopicClick} />
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12">
              <TrustBadges />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">210+</p>
                <p className="text-xs text-gray-500">Articles</p>
              </div>
              <div>
                <p className="text-2xl font-bold">40+</p>
                <p className="text-xs text-gray-500">Visa Types Covered</p>
              </div>
              <div>
                <p className="text-2xl font-bold">17</p>
                <p className="text-xs text-gray-500">Detailed Destinations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-serif font-bold text-center mb-2">Featured Destinations</h2>
            <p className="text-gray-500 text-center mb-8">17 countries with detailed visa, cost, and lifestyle guides</p>

            {/* Popular Destinations */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { slug: 'portugal', name: 'Portugal', flag: '🇵🇹' },
                { slug: 'spain', name: 'Spain', flag: '🇪🇸' },
                { slug: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
                { slug: 'dubai', name: 'Dubai', flag: '🇦🇪' },
                { slug: 'canada', name: 'Canada', flag: '🇨🇦' },
                { slug: 'australia', name: 'Australia', flag: '🇦🇺' },
              ].map((dest) => (
                <a
                  key={dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all text-center"
                >
                  <span className="text-3xl mb-2 block">{dest.flag}</span>
                  <span className="font-medium text-gray-900 group-hover:text-amber-700">{dest.name}</span>
                </a>
              ))}
            </div>

            {/* More Destinations */}
            <h3 className="text-lg font-medium text-center mb-4 text-gray-700">More Destinations</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
              {[
                { slug: 'cyprus', name: 'Cyprus', flag: '🇨🇾' },
                { slug: 'new-zealand', name: 'New Zealand', flag: '🇳🇿' },
                { slug: 'germany', name: 'Germany', flag: '🇩🇪' },
                { slug: 'france', name: 'France', flag: '🇫🇷' },
                { slug: 'netherlands', name: 'Netherlands', flag: '🇳🇱' },
                { slug: 'mexico', name: 'Mexico', flag: '🇲🇽' },
                { slug: 'thailand', name: 'Thailand', flag: '🇹🇭' },
                { slug: 'malta', name: 'Malta', flag: '🇲🇹' },
                { slug: 'greece', name: 'Greece', flag: '🇬🇷' },
                { slug: 'italy', name: 'Italy', flag: '🇮🇹' },
                { slug: 'indonesia', name: 'Bali', flag: '🇮🇩' },
              ].map((dest) => (
                <a
                  key={dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="group p-2 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all text-center"
                >
                  <span className="text-xl mb-1 block">{dest.flag}</span>
                  <span className="text-xs text-gray-700 group-hover:text-amber-700">{dest.name}</span>
                </a>
              ))}
            </div>

            <div className="text-center mt-6">
              <a href="/destinations" className="text-amber-600 hover:text-amber-800 text-sm font-medium">
                View all destinations →
              </a>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-8 bg-stone-50">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              Powered by CopilotKit, Hume, and Neon
            </p>
          </div>
        </section>
      </div>
      </CopilotSidebar>
    </ChatUserContext.Provider>
    </BackgroundContext.Provider>
  );
}
