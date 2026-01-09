import Link from "next/link";

const TOOLS = [
  {
    slug: "cost-calculator",
    title: "Cost of Living Calculator",
    description: "Compare living costs across destinations and plan your monthly budget",
    icon: "💰",
    status: "live",
  },
  {
    slug: "compare",
    title: "Destination Comparison",
    description: "Compare two destinations side-by-side on visas, costs, and lifestyle",
    icon: "⚖️",
    status: "live",
  },
  {
    slug: "visa-timeline",
    title: "Visa Timeline Planner",
    description: "Plan your visa application with step-by-step timelines",
    icon: "📋",
    status: "live",
  },
  {
    slug: "quiz",
    title: "Relocation Readiness Quiz",
    description: "Find out which destinations match your priorities",
    icon: "🎯",
    status: "live",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Relocation Tools</h1>
          <p className="text-white/80 text-lg">
            Interactive tools to help plan your move abroad
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.status === "live" ? `/tools/${tool.slug}` : "#"}
              className={`bg-white rounded-xl shadow-sm p-6 transition-all ${
                tool.status === "live"
                  ? "hover:shadow-md hover:border-amber-200 border-2 border-transparent cursor-pointer"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{tool.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-stone-800">{tool.title}</h2>
                    {tool.status === "coming" && (
                      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600">{tool.description}</p>
                </div>
                {tool.status === "live" && (
                  <div className="text-amber-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-stone-800 mb-2">Need personalized advice?</h3>
          <p className="text-stone-600 mb-4">
            Talk to ATLAS, our AI relocation advisor, for custom recommendations
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            <span>Talk to ATLAS</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
