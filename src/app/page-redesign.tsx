"use client";

import { useState, useEffect, useCallback } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useRenderToolCall, useCopilotChat } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { VoiceWidget } from "@/components/VoiceWidget";
import { SplitPanelLayout, MainPanel, ChatSidebar, MobileSidebarToggle } from "@/components/layout";
import { HomeHeroSection } from "@/components/destination/HeroSection";
import { useDestinationState, DESTINATION_SECTIONS } from "@/lib/hooks/useDestinationState";
import { authClient } from "@/lib/auth/client";

// Import existing generative UI components
import { DestinationCard, DestinationCardCompact } from "@/components/generative-ui/DestinationCard";
import { CostOfLivingChart } from "@/components/generative-ui/CostOfLivingChart";
import { DestinationComparison } from "@/components/generative-ui/DestinationComparison";
import { VisaGrid } from "@/components/generative-ui/VisaGrid";

/**
 * Redesigned Home Page
 *
 * Features:
 * - Split panel layout (main content + chat sidebar)
 * - Beautiful hero with rotating Unsplash images
 * - Destination grid with AI-controllable highlights
 * - CopilotChat in sidebar with Hume voice
 * - useCoAgent for shared state with Pydantic AI
 */
export default function HomeRedesign() {
  const { appendMessage } = useCopilotChat();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Shared state with agent
  const {
    state,
    setDestination,
    setUser,
  } = useDestinationState();

  // Mobile sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Featured destinations from DB
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user to agent state
  useEffect(() => {
    if (user?.id) {
      setUser({
        id: user.id,
        name: user.name || "Unknown",
        email: user.email || "",
      });
    }
  }, [user?.id, user?.name, user?.email, setUser]);

  // Fetch featured destinations
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/destinations?limit=12");
        if (res.ok) {
          const data = await res.json();
          setDestinations(data.destinations || []);
        }
      } catch (e) {
        console.error("[Home] Failed to fetch destinations:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  // Handle voice messages
  const handleVoiceMessage = useCallback(
    (text: string, role?: "user" | "assistant") => {
      if (role === "user") {
        appendMessage(new TextMessage({ content: text, role: Role.User }));
      }
    },
    [appendMessage]
  );

  // Handle destination click
  const handleDestinationClick = useCallback(
    (destination: string) => {
      setDestination(destination);
      appendMessage(
        new TextMessage({
          content: `Tell me about ${destination}`,
          role: Role.User,
        })
      );
    },
    [setDestination, appendMessage]
  );

  // =============================================================================
  // GENERATIVE UI: Render tool results from Pydantic AI agent
  // =============================================================================

  useRenderToolCall({
    name: "show_featured_destinations",
    render: ({ result, status }) => {
      if (status !== "complete" || !result?.destinations) return <ToolLoading title="Loading destinations..." />;
      return (
        <div className="grid grid-cols-2 gap-3">
          {result.destinations.slice(0, 6).map((dest: any) => (
            <DestinationCardCompact
              key={dest.slug}
              name={dest.name}
              flag={dest.flag}
              region={dest.region}
              hero_image_url={dest.hero_image_url}
              slug={dest.slug}
            />
          ))}
        </div>
      );
    },
  });

  useRenderToolCall({
    name: "get_destination_details",
    render: ({ result, status }) => {
      if (status !== "complete" || !result?.destination) return <ToolLoading title="Loading destination..." />;
      const d = result.destination;
      return (
        <DestinationCard
          name={d.name}
          flag={d.flag}
          region={d.region}
          language={d.language}
          hero_image_url={d.hero_image_url}
          hero_subtitle={d.tagline}
          quick_facts={d.quick_facts}
          highlights={d.highlights}
          visas={d.visas}
          slug={d.slug}
        />
      );
    },
  });

  useRenderToolCall({
    name: "show_cost_of_living",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Calculating costs..." />;
      return <CostOfLivingChart {...result} />;
    },
  });

  useRenderToolCall({
    name: "compare_two_destinations",
    render: ({ result, status }) => {
      if (status !== "complete" || !result) return <ToolLoading title="Comparing destinations..." />;
      return <DestinationComparison {...result} />;
    },
  });

  useRenderToolCall({
    name: "show_visa_options",
    render: ({ result, status }) => {
      if (status !== "complete" || !result?.visas) return <ToolLoading title="Loading visa options..." />;
      return (
        <VisaGrid
          visas={result.visas}
          country={result.country || ""}
          flag={result.flag || "🌍"}
          hero_image_url={result.hero_image_url}
        />
      );
    },
  });

  return (
    <SplitPanelLayout sidebarWidth="400px">
      {/* Main Content Area */}
      <MainPanel>
        {/* Hero Section */}
        <HomeHeroSection />

        {/* Featured Destinations */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Popular Destinations</h2>
              <p className="text-stone-600 mt-1">Explore top relocation destinations worldwide</p>
            </div>
            <a
              href="/destinations"
              className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-40 bg-stone-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {destinations.map((dest) => (
                <button
                  key={dest.slug}
                  onClick={() => handleDestinationClick(dest.country_name)}
                  className={`
                    relative rounded-xl overflow-hidden group h-40 shadow-md
                    hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
                    ${state.highlightedSections.includes(dest.slug) ? "ring-2 ring-amber-400 ring-offset-2" : ""}
                  `}
                >
                  <div className="absolute inset-0">
                    {dest.hero_image_url ? (
                      <img
                        src={dest.hero_image_url}
                        alt={dest.country_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-600 to-stone-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{dest.flag}</span>
                      <div className="text-left">
                        <h3 className="font-bold text-white text-sm">{dest.country_name}</h3>
                        <p className="text-white/70 text-xs">{dest.region}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="bg-stone-100 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-8">Explore by Topic</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {DESTINATION_SECTIONS.slice(0, 10).map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    appendMessage(
                      new TextMessage({
                        content: `Tell me about ${section.title.toLowerCase()} for relocation`,
                        role: Role.User,
                      })
                    );
                  }}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                >
                  <span className="text-2xl">{section.icon}</span>
                  <span className="font-medium text-stone-800 text-sm">{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Chat with ATLAS</h3>
              <p className="text-stone-600">Ask questions about visa requirements, cost of living, or compare destinations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎙️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Voice Support</h3>
              <p className="text-stone-600">Talk naturally with our AI voice assistant powered by Hume</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Live Data</h3>
              <p className="text-stone-600">Get real-time information on costs, visa timelines, and more</p>
            </div>
          </div>
        </section>
      </MainPanel>

      {/* Chat Sidebar */}
      <ChatSidebar className={isMobileSidebarOpen ? "flex" : ""}>
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-stone-900 to-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🌍</span>
            </div>
            <div>
              <h2 className="font-bold text-white">ATLAS</h2>
              <p className="text-stone-400 text-xs">Your Relocation Guide</p>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <CopilotChat
            className="h-full"
            labels={{
              initial: "Hi! I'm ATLAS, your AI relocation guide. Ask me about visa requirements, cost of living, or help finding your perfect destination.",
            }}
          />
        </div>

        {/* Voice Widget */}
        <div className="p-4 border-t border-stone-200 bg-stone-50">
          <VoiceWidget onMessage={handleVoiceMessage} />
        </div>
      </ChatSidebar>

      {/* Mobile Toggle */}
      <MobileSidebarToggle
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isOpen={isMobileSidebarOpen}
      />
    </SplitPanelLayout>
  );
}

/**
 * Tool Loading Component
 */
function ToolLoading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-stone-600 text-sm">{title}</span>
    </div>
  );
}
