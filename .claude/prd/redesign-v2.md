# Relocation Quest v2 - Complete Redesign PRD

## Vision
Create an **illustrious, visually stunning** relocation platform that rivals the best travel/lifestyle sites. Users should be **immediately impressed** by rich imagery, live data visualizations, and an AI assistant that dynamically updates the entire page based on conversation.

Think: **Airbnb meets Bloomberg Terminal meets AI Concierge**

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┬──────────────────────┐
│                      MAIN PANEL (70%)                      │   SIDEBAR (30%)      │
│  ┌──────────────────────────────────────────────────────┐  │                      │
│  │  HERO: Full-bleed Unsplash image with gradient       │  │   ┌──────────────┐  │
│  │  Country flag, name, "Your next chapter awaits"      │  │   │ CopilotChat  │  │
│  └──────────────────────────────────────────────────────┘  │   │              │  │
│                                                            │   │ "Tell me     │  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │   │  about       │  │
│  │ Cost    │ │ Safety  │ │ Quality │ │ Climate │          │   │  Cyprus..."  │  │
│  │ Index   │ │ Score   │ │ of Life │ │ Widget  │          │   │              │  │
│  │ 🔢 72   │ │ 🛡️ A+   │ │ ⭐ 8.2  │ │ ☀️ 25°  │          │   │ [AI updates  │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │   │  everything] │  │
│                                                            │   │              │  │
│  ┌──────────────────────────────────────────────────────┐  │   └──────────────┘  │
│  │  INTERACTIVE SECTIONS (Expandable, AI-controllable)  │  │                      │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │  │   ┌──────────────┐  │
│  │  │ Visa   │ │ Cost   │ │ Health │ │ Tax    │        │  │   │              │  │
│  │  │ 📋     │ │ 💰     │ │ 🏥     │ │ 📊     │        │  │   │ HUME VOICE   │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │  │   │ WIDGET       │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │  │   │ 🎙️           │  │
│  │  │ School │ │ Housing│ │ Jobs   │ │ Safety │        │  │   │              │  │
│  │  │ 📚     │ │ 🏠     │ │ 💼     │ │ 🛡️     │        │  │   └──────────────┘  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │  │                      │
│  └──────────────────────────────────────────────────────┘  │                      │
│                                                            │                      │
│  ┌──────────────────────────────────────────────────────┐  │                      │
│  │  CITY PROFILES - Cards with Unsplash images          │  │                      │
│  │  Limassol | Nicosia | Paphos | Larnaca               │  │                      │
│  └──────────────────────────────────────────────────────┘  │                      │
└────────────────────────────────────────────────────────────┴──────────────────────┘
```

## Tech Stack (Unchanged Core)
- **Frontend**: Next.js 15 + Tailwind + CopilotKit
- **Backend Agent**: Pydantic AI on Railway
- **Database**: Neon PostgreSQL (destinations, articles, user preferences)
- **Voice**: Hume AI
- **Memory**: Zep Cloud (with `relocation_` user prefix)
- **Images**: Unsplash API

## New Additions
- **A2UI (AG-UI)**: Google/CopilotKit standard for agentic UIs
- **useCoAgent**: Shared state between frontend and Pydantic AI agent
- **MDX**: Rich content per destination
- **Recharts/Nivo**: Data visualizations
- **Framer Motion**: Smooth animations

---

## Destination Sections (Comprehensive)

Each destination page will have **20+ expandable sections**, all AI-controllable:

### 1. Overview & Quick Stats
- Country flag, name, region
- Population, timezone, currency
- Languages spoken
- Quick verdict score (1-10)

### 2. Visa & Immigration 📋
- Tourist visa requirements
- Work permits (types, requirements, costs)
- Digital nomad visa (if available)
- Golden visa / investment routes
- Permanent residency path
- Citizenship timeline
- **Live Component**: `<VisaTimeline />` - Interactive timeline showing your path

### 3. Cost of Living 💰
- Monthly budget breakdown (single/couple/family)
- Rent by city and neighborhood
- Grocery costs
- Dining out costs
- Utilities (electricity, water, internet)
- **Live Component**: `<CostCalculator />` - Adjust inputs, see live totals
- **Live Component**: `<CostComparisonChart />` - Compare to user's home city

### 4. Healthcare System 🏥
- Public vs private healthcare
- Health insurance costs
- Quality of hospitals
- Wait times
- Specialist availability
- Dental care
- Mental health services
- **Live Component**: `<HealthcareRating />` - Visual score breakdown

### 5. Tax & Finance 📊
- Income tax rates (brackets)
- Corporate tax
- VAT rate
- Tax treaties
- Non-dom programs (if any)
- Banking options
- Crypto-friendliness
- **Live Component**: `<TaxCalculator />` - Input income, see tax breakdown

### 6. Company Incorporation 🏢
- Entity types (LLC, Ltd, etc.)
- Registration cost
- Timeline to incorporate
- Annual maintenance costs
- Nominee director requirements
- Virtual office options
- **Live Component**: `<IncorporationChecklist />` - Interactive checklist

### 7. Education & Schooling 📚
- International schools (with fees)
- Public school quality
- Universities
- Language of instruction
- IB/British/American curriculum availability
- **Live Component**: `<SchoolFinder />` - Filter by type, curriculum, location

### 8. Housing & Real Estate 🏠
- Average prices by city
- Rent vs buy analysis
- Popular neighborhoods
- Expat-friendly areas
- Property buying process for foreigners
- Rental deposit requirements
- **Live Component**: `<PropertyPriceMap />` - Interactive map with prices
- **Live Component**: `<RentVsBuyCalculator />`

### 9. Job Market & Remote Work 💼
- Top industries
- Average salaries by role
- Remote work infrastructure
- Coworking spaces
- Startup ecosystem
- LinkedIn job market size
- **Live Component**: `<SalaryComparison />` - Your role vs local market

### 10. Safety & Crime 🛡️
- Overall safety index
- Crime rates by type
- Safe neighborhoods
- Areas to avoid
- Political stability
- Natural disaster risk
- **Live Component**: `<SafetyRadar />` - Visual breakdown

### 11. Climate & Weather ☀️
- Average temperatures by month
- Rainfall patterns
- Best time to visit/move
- Air quality
- Natural beauty
- **Live Component**: `<ClimateChart />` - 12-month temperature/rainfall

### 12. Quality of Life ⭐
- Overall QoL index
- Work-life balance
- Leisure activities
- Cultural scene
- Nightlife
- Sports facilities
- Nature access
- **Live Component**: `<QualityOfLifeRadar />` - Multi-axis radar chart

### 13. Food & Cuisine 🍽️
- Local cuisine highlights
- Dietary options (vegan, halal, kosher)
- Restaurant scene
- Grocery quality
- Food delivery apps
- **Live Component**: `<FoodScene />` - Visual food culture overview

### 14. Transportation 🚗
- Public transit quality
- Driving requirements
- License conversion
- Car costs
- Ride-sharing availability
- Cycling infrastructure
- **Live Component**: `<TransportOptions />` - Comparison cards

### 15. Language & Culture 🗣️
- Official language(s)
- English proficiency level
- Cultural norms
- Business etiquette
- Religious landscape
- **Live Component**: `<LanguageBarrier />` - Visual difficulty scale

### 16. Expat Community 👥
- Size of expat population
- Nationalities represented
- Expat meetup groups
- Facebook groups
- Forums & resources
- **Live Component**: `<ExpatCommunitySize />` - Pie chart of nationalities

### 17. Internet & Connectivity 📶
- Average speeds
- Mobile networks
- 5G availability
- Best providers
- Cost comparison
- **Live Component**: `<InternetSpeed />` - Speed gauge

### 18. Banking & Money 🏦
- Opening a bank account (requirements)
- International transfers
- ATM fees
- Currency exchange tips
- Crypto regulations
- **Live Component**: `<CurrencyConverter />` - Live rates

### 19. City Profiles 🏙️
- Main cities with:
  - Population
  - Character/vibe
  - Best for (families/singles/retirees)
  - Top neighborhoods
  - Unsplash gallery
- **Live Component**: `<CityCard />` - Expandable city deep-dives

### 20. Practical Logistics 📦
- Moving companies
- Shipping costs
- Pet relocation
- What to bring vs buy there
- First week checklist
- **Live Component**: `<RelocationChecklist />` - Interactive todo list

---

## User Journey & Pydantic AI Integration

### Flow: User expresses interest in Cyprus

1. **User says**: "I'm interested in Cyprus for relocation"

2. **Pydantic AI Agent**:
   - Stores preference to Zep: `relocation_user123 interested in Cyprus`
   - Updates `useCoAgent` state: `{ selectedDestination: "cyprus", interests: ["visa", "cost"] }`
   - Triggers `show_destination` tool → Main panel updates to Cyprus

3. **A2UI Confirmation**:
   - Agent asks: "Great choice! Cyprus has excellent tax benefits. Should I save this as a potential destination for you?"
   - User confirms → Stored to Neon `user_preferences` table
   - Agent: "Saved! I'll remember Cyprus is on your shortlist. Want me to compare it with another country?"

4. **Continuous Context**:
   - All future queries consider Cyprus interest
   - "What about schools?" → Shows Cyprus schools section
   - Comparison queries: "How does Portugal compare?" → Side-by-side view

### Pydantic AI Tools (New/Updated)

```python
# Save user destination interest
@atlas_agent.tool
async def save_destination_interest(
    ctx: RunContext[ATLASDeps],
    destination: str,
    interest_level: str,  # "exploring", "serious", "committed"
    notes: str = ""
) -> dict:
    """Save user's interest in a destination to their profile."""
    user_id = ctx.deps.state.get("user", {}).get("id")
    if user_id:
        # Store to Neon
        await store_user_preference(user_id, destination, interest_level, notes)
        # Store to Zep for memory
        await store_to_memory(user_id, f"User interested in {destination} ({interest_level})")
    return {"saved": True, "destination": destination}

# Update main panel view
@atlas_agent.tool
async def update_main_panel(
    ctx: RunContext[ATLASDeps],
    view: str,  # "destination", "comparison", "calculator"
    destination: str = None,
    section: str = None,  # "visa", "cost", "healthcare", etc.
    data: dict = None
) -> dict:
    """Update the main panel view. Frontend will receive this via useCoAgent."""
    return {
        "panel_update": {
            "view": view,
            "destination": destination,
            "section": section,
            "data": data
        }
    }
```

---

## Component Library (New)

### Live Data Components (CopilotKit Generative UI)

| Component | Description | Data Source |
|-----------|-------------|-------------|
| `<CostCalculator />` | Interactive monthly budget | Neon + user inputs |
| `<VisaTimeline />` | Path to residency/citizenship | Neon visa data |
| `<TaxCalculator />` | Income tax breakdown | Neon tax brackets |
| `<QualityOfLifeRadar />` | Multi-axis radar chart | Neon QoL scores |
| `<SafetyRadar />` | Crime/safety breakdown | Neon safety data |
| `<ClimateChart />` | 12-month temp/rain chart | Neon climate data |
| `<CurrencyConverter />` | Live exchange rates | External API |
| `<PropertyPriceMap />` | Interactive price heatmap | Neon property data |
| `<CityCard />` | Expandable city profile | Neon + Unsplash |
| `<ComparisonTable />` | Side-by-side destinations | Neon |
| `<RelocationChecklist />` | Interactive todo list | User state |

### Static/MDX Components

| Component | Description |
|-----------|-------------|
| `<HeroSection />` | Full-bleed Unsplash hero |
| `<QuickStats />` | Row of key metrics |
| `<SectionCard />` | Expandable section container |
| `<InfoGrid />` | Grid of info items |
| `<ProsCons />` | Visual pros/cons list |
| `<Callout />` | Important tips/warnings |
| `<ImageGallery />` | Unsplash gallery |

---

## Database Schema Updates (Neon)

```sql
-- New table: User destination preferences
CREATE TABLE user_destination_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  destination_slug TEXT NOT NULL REFERENCES destinations(slug),
  interest_level TEXT CHECK (interest_level IN ('exploring', 'serious', 'committed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table: Destination sections (for expandable content)
CREATE TABLE destination_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug TEXT NOT NULL REFERENCES destinations(slug),
  section_key TEXT NOT NULL,  -- 'visa', 'cost', 'healthcare', etc.
  title TEXT NOT NULL,
  icon TEXT,
  content_mdx TEXT,  -- MDX content
  data_json JSONB,   -- Structured data for live components
  display_order INT DEFAULT 0,
  enabled BOOLEAN DEFAULT true
);

-- New table: City profiles
CREATE TABLE destination_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug TEXT NOT NULL REFERENCES destinations(slug),
  city_name TEXT NOT NULL,
  population INT,
  description TEXT,
  best_for TEXT[],  -- ['families', 'digital nomads', 'retirees']
  neighborhoods JSONB,
  image_url TEXT,
  display_order INT DEFAULT 0
);

-- Enhanced destinations table
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS
  quick_stats JSONB,  -- {costIndex, safetyScore, qolScore, climate}
  hero_images TEXT[], -- Multiple Unsplash URLs for variety
  sections_enabled TEXT[]; -- Which sections to show
```

---

## File Structure (New)

```
src/
├── app/
│   ├── page.tsx                    # Home - REDESIGNED
│   ├── destinations/
│   │   ├── page.tsx                # Destinations grid
│   │   └── [slug]/
│   │       ├── page.tsx            # Server component (metadata)
│   │       └── DestinationView.tsx # Client component (main panel + sidebar)
│   └── compare/
│       └── page.tsx                # Side-by-side comparison
├── components/
│   ├── layout/
│   │   ├── SplitPanelLayout.tsx    # Main + Sidebar layout
│   │   ├── MainPanel.tsx           # Left content area
│   │   └── ChatSidebar.tsx         # Right sidebar with CopilotChat
│   ├── destination/
│   │   ├── HeroSection.tsx
│   │   ├── QuickStats.tsx
│   │   ├── SectionGrid.tsx
│   │   ├── SectionCard.tsx
│   │   └── CityProfiles.tsx
│   ├── live/                       # CopilotKit Live Components
│   │   ├── CostCalculator.tsx
│   │   ├── VisaTimeline.tsx
│   │   ├── TaxCalculator.tsx
│   │   ├── QualityOfLifeRadar.tsx
│   │   ├── SafetyRadar.tsx
│   │   ├── ClimateChart.tsx
│   │   ├── CurrencyConverter.tsx
│   │   ├── PropertyPriceMap.tsx
│   │   ├── CityCard.tsx
│   │   ├── ComparisonTable.tsx
│   │   └── RelocationChecklist.tsx
│   ├── mdx/                        # MDX Components
│   │   ├── Callout.tsx
│   │   ├── ProsCons.tsx
│   │   ├── InfoGrid.tsx
│   │   └── ImageGallery.tsx
│   └── voice/
│       └── VoiceWidget.tsx         # Hume (unchanged)
├── content/
│   └── destinations/               # MDX files per destination
│       ├── portugal.mdx
│       ├── cyprus.mdx
│       ├── spain.mdx
│       └── ...
└── lib/
    ├── hooks/
    │   ├── useDestinationState.ts  # useCoAgent wrapper
    │   └── useUserPreferences.ts
    └── api/
        └── destinations.ts         # Neon queries
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `SplitPanelLayout` component
- [ ] Redesign home page with new layout
- [ ] Set up `useCoAgent` state structure
- [ ] Create `HeroSection` with Unsplash
- [ ] Create `QuickStats` component

### Phase 2: Live Components (Week 2)
- [ ] `CostCalculator` with Recharts
- [ ] `QualityOfLifeRadar` with Nivo
- [ ] `ClimateChart`
- [ ] `CurrencyConverter`
- [ ] Register all with `useRenderToolCall`

### Phase 3: Sections & MDX (Week 3)
- [ ] Create all 20 section components
- [ ] Set up MDX processing
- [ ] Write Cyprus content as pilot
- [ ] Create `SectionCard` expandable UI
- [ ] Database migrations for new tables

### Phase 4: AI Integration (Week 4)
- [ ] Update Pydantic AI tools for panel control
- [ ] Implement A2UI confirmation flows
- [ ] Add `save_destination_interest` tool
- [ ] Connect Zep memory for preferences
- [ ] Test full user journey

### Phase 5: Polish & Expand (Week 5)
- [ ] Add Framer Motion animations
- [ ] Complete MDX content for all 17 destinations
- [ ] Performance optimization
- [ ] Mobile responsive refinements
- [ ] SEO optimization

---

## Success Metrics

1. **Visual Impact**: First-time visitors say "wow"
2. **Engagement**: Users explore 3+ sections per visit
3. **AI Utility**: 50%+ of users interact with chat
4. **Conversion**: Users save destinations to profile
5. **SEO**: Destination pages rank for "[country] relocation guide"

---

## Example: Cyprus Destination Page

When user navigates to `/destinations/cyprus`:

```tsx
// DestinationView.tsx
export function DestinationView({ slug }: { slug: string }) {
  const { state, setState } = useCoAgent<DestinationState>({
    name: "atlas_agent",
    initialState: {
      destination: slug,
      activeSection: null,
      userCurrency: "USD"
    }
  });

  return (
    <SplitPanelLayout>
      <MainPanel>
        <HeroSection
          destination={state.destination}
          image={/* Unsplash */}
        />
        <QuickStats
          costIndex={72}
          safetyScore="A+"
          qolScore={8.2}
          climate="Mediterranean"
        />
        <SectionGrid>
          <SectionCard
            id="visa"
            title="Visa & Immigration"
            icon="📋"
            isActive={state.activeSection === "visa"}
          >
            <VisaTimeline destination={slug} />
          </SectionCard>
          <SectionCard id="cost" title="Cost of Living" icon="💰">
            <CostCalculator
              destination={slug}
              userCurrency={state.userCurrency}
            />
          </SectionCard>
          {/* ... 18 more sections */}
        </SectionGrid>
        <CityProfiles destination={slug} />
      </MainPanel>

      <ChatSidebar>
        <CopilotChat
          labels={{ title: "ATLAS", initial: "Ask me anything about Cyprus..." }}
        />
        <VoiceWidget />
      </ChatSidebar>
    </SplitPanelLayout>
  );
}
```

---

## Questions for Confirmation

1. **Color Palette**: Keep current stone/amber or go more vibrant?
2. **Home Page**: Full map view or destination cards grid?
3. **Priority Destinations**: Which 5 to build first with full content?
4. **Data Sources**: Any external APIs for live data (climate, currency)?

---

*This PRD defines the complete redesign vision. Ready for implementation approval.*
