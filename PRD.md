# Relocation Quest V2 - Product Requirements Document

> **Vision**: The world's most intelligent relocation advisor - where every page thinks, responds, and guides users through their international move journey.

## Problem Statement

People relocating internationally face overwhelming complexity:
- Visa requirements vary by nationality, profession, and destination
- Cost of living data is scattered and outdated
- Currency fluctuations affect budgets significantly
- Tax implications are poorly understood
- No single source provides personalized, real-time guidance

**Current solutions fail because**:
- Static content doesn't adapt to user's specific situation
- Chatbots are disconnected from page content
- No voice interface for hands-free research
- Generic advice doesn't account for individual circumstances

## Target Users

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| **Digital Nomads** | Remote workers seeking visa options | Visa comparison, cost of living, internet quality |
| **Corporate Relocators** | Employees moving for work | Tax implications, family visas, housing costs |
| **Retirees** | People retiring abroad | Healthcare, pension access, residency requirements |
| **Entrepreneurs** | Starting businesses abroad | Startup visas, tax incentives, business costs |

## Core Value Proposition

**"Ask Atlas anything about your move"** - A voice-first, AI-powered advisor that:
1. Understands your specific situation (nationality, profession, family status)
2. Shows relevant data directly on the page as you ask
3. Compares destinations in real-time
4. Calculates costs in your home currency
5. Tracks visa requirements and deadlines

---

## Feature Requirements

### Phase 1: Intelligent Document Pattern (Priority)

**Goal**: Every page content "thinks" and responds to conversation.

#### 1.1 IntelligentDocument Wrapper

```tsx
<IntelligentDocument pageContext="Portugal Digital Nomad Visa">
  <DocumentSection id="visa-requirements">
    <LiveVisaCard destination="portugal" visaType="digital-nomad" />
  </DocumentSection>
  <DocumentSection id="cost-of-living">
    <LiveCostChart destination="portugal" userCurrency={userCurrency} />
  </DocumentSection>
  <DocumentSection id="currency">
    <LiveCurrencyConverter from={userCurrency} to="EUR" />
  </DocumentSection>
</IntelligentDocument>
```

**Acceptance Criteria**:
- [ ] User asks "What's the minimum income requirement?" → Visa section highlights, shows €3,500/month
- [ ] User asks "How much is rent in Lisbon?" → Cost section updates, shows breakdown
- [ ] User asks "Convert that to dollars" → Currency converter activates with live rates
- [ ] All sections can be highlighted/updated via agent actions

#### 1.2 Live Components

| Component | Data Source | Updates When |
|-----------|-------------|--------------|
| `LiveVisaCard` | destinations.visas JSONB | User asks about visa |
| `LiveCostChart` | destinations.costs JSONB | User asks about costs |
| `LiveCurrencyConverter` | External API | User mentions currency |
| `LiveJobMarket` | destinations.job_market JSONB | User asks about work |
| `LiveComparisonTable` | Multiple destinations | User compares places |
| `LiveTimeline` | Calculated from visa data | User asks about timeline |

#### 1.3 Agent Actions (Frontend)

```typescript
useCopilotAction({
  name: "update_destination_view",
  description: "Update displayed destination and highlight relevant sections",
  parameters: [
    { name: "destination", type: "string" },
    { name: "sections", type: "array", items: { type: "string" } },
    { name: "highlight", type: "boolean" }
  ],
  handler: async ({ destination, sections, highlight }) => {
    setActiveDestination(destination);
    if (highlight) highlightSections(sections);
    return { success: true };
  }
});

useCopilotAction({
  name: "set_user_currency",
  description: "Set user's home currency for conversions",
  parameters: [{ name: "currency", type: "string" }],
  handler: async ({ currency }) => {
    setUserCurrency(currency);
    return { success: true, currency };
  }
});

useCopilotAction({
  name: "compare_destinations",
  description: "Show side-by-side comparison of two destinations",
  parameters: [
    { name: "destination1", type: "string" },
    { name: "destination2", type: "string" },
    { name: "aspects", type: "array" }
  ],
  handler: async ({ destination1, destination2, aspects }) => {
    setComparisonMode({ dest1: destination1, dest2: destination2, aspects });
    return { success: true };
  }
});
```

### Phase 2: Voice-First Experience

**Goal**: Every page has voice interaction with Atlas.

#### 2.1 Voice Widget Placement

- **Main pages**: Floating voice button (bottom-right)
- **Destination pages**: Avatar in hero section
- **Tool pages**: Integrated with form inputs

#### 2.2 Two-Stage Voice Pattern

```
User: "Tell me about Portugal's digital nomad visa"
Atlas (Stage 1, <0.7s): "Portugal's D7 visa is popular with remote workers. Shall I show you the requirements?"
User: "Yes"
Atlas (Stage 2): [LiveVisaCard renders] "Here are the key requirements..."
```

#### 2.3 Context Anchoring for Relocation

```python
RELOCATION_ANCHOR = """
## CURRENT CONTEXT
Destination: {current_destination}
User nationality: {nationality}
User profession: {profession}
Budget range: {budget}

## RECENT CONVERSATION
{history}

## PAGE SECTIONS AVAILABLE
{available_sections}

When user asks about costs, use update_destination_view to highlight cost section.
When user compares, use compare_destinations action.
"""
```

### Phase 3: Smart Data Integration

#### 3.1 Real-Time Currency Conversion

```typescript
// All cost displays show dual currency
<CostDisplay
  amount={1500}
  currency="EUR"
  userCurrency={userCurrency}  // "USD"
  showBoth={true}
/>
// Displays: "€1,500 (~$1,620)"
```

#### 3.2 Personalized Visa Eligibility

```typescript
// Based on user profile
<VisaEligibility
  destination="portugal"
  nationality={userNationality}
  profession={userProfession}
  income={userIncome}
/>
// Shows: ✅ Eligible for D7 Visa | ⚠️ Need proof of €3,500/month income
```

#### 3.3 Cost of Living Calculator

```typescript
<CostCalculator
  destination="lisbon"
  lifestyle={userLifestyle}  // "comfortable" | "budget" | "luxury"
  familySize={familySize}
  userCurrency={userCurrency}
/>
// Interactive breakdown: Rent, Food, Transport, Healthcare, Entertainment
```

### Phase 4: Content Expansion

#### 4.1 Page Types to Create

| Page Type | Count | Example |
|-----------|-------|---------|
| Destination hubs | 17 | `/destinations/portugal` |
| Visa guides | 50+ | `/visas/portugal-digital-nomad` |
| Cost of living | 17 | `/cost-of-living/lisbon` |
| Comparison pages | 20+ | `/compare/portugal-vs-spain` |
| Profession guides | 10+ | `/guides/developers-abroad` |
| Nationality guides | 20+ | `/guides/americans-in-europe` |

#### 4.2 MDX Content Structure

```mdx
---
title: "Portugal Digital Nomad Visa Guide 2026"
destination: portugal
visaType: digital-nomad
lastUpdated: 2026-01-12
---

<IntelligentDocument pageContext="Portugal D7 Visa">

# Portugal Digital Nomad Visa

<LiveVisaCard destination="portugal" visaType="digital-nomad" />

## Income Requirements

<DocumentSection id="income">
Portugal requires proof of **passive income** of at least:

<LiveIncomeRequirement
  destination="portugal"
  visaType="digital-nomad"
  showInUserCurrency={true}
/>

</DocumentSection>

## Cost of Living

<DocumentSection id="costs">
<LiveCostChart destination="portugal" city="lisbon" />
</DocumentSection>

</IntelligentDocument>
```

---

## Technical Architecture

### Frontend Components

```
src/components/
├── intelligent/
│   ├── IntelligentDocument.tsx    # Wrapper with CopilotKit actions
│   ├── DocumentSection.tsx        # Highlightable section
│   └── InlineChat.tsx             # Chat embedded in content
├── live/
│   ├── LiveVisaCard.tsx           # Dynamic visa requirements
│   ├── LiveCostChart.tsx          # Interactive cost breakdown
│   ├── LiveCurrencyConverter.tsx  # Real-time conversion
│   ├── LiveJobMarket.tsx          # Job market data
│   ├── LiveComparisonTable.tsx    # Side-by-side compare
│   └── LiveTimeline.tsx           # Visa/move timeline
├── voice/
│   └── AtlasVoiceWidget.tsx       # Voice interface
└── generative-ui/
    └── [existing components]       # Keep current components
```

### Agent Tools (Backend)

```python
# New tools to add
@agent.tool
async def get_visa_requirements(
    ctx,
    destination: str,
    nationality: str,
    visa_type: str
) -> dict:
    """Get specific visa requirements based on user's nationality."""

@agent.tool
async def calculate_cost_of_living(
    ctx,
    destination: str,
    city: str,
    lifestyle: str,
    family_size: int,
    user_currency: str
) -> dict:
    """Calculate monthly costs with currency conversion."""

@agent.tool
async def convert_currency(
    ctx,
    amount: float,
    from_currency: str,
    to_currency: str
) -> dict:
    """Get real-time currency conversion."""

@agent.tool
async def check_visa_eligibility(
    ctx,
    destination: str,
    nationality: str,
    profession: str,
    income: float
) -> dict:
    """Check if user is eligible for specific visa types."""
```

### Database Enhancements

```sql
-- Add user profiles for personalization
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  nationality TEXT,
  profession TEXT,
  family_size INTEGER DEFAULT 1,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_currency TEXT DEFAULT 'USD',
  interests JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add visa eligibility rules
CREATE TABLE visa_rules (
  id SERIAL PRIMARY KEY,
  destination TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  nationality TEXT,  -- NULL means all nationalities
  min_income INTEGER,
  profession_requirements JSONB,
  documents_required JSONB,
  processing_time_days INTEGER,
  validity_months INTEGER
);
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Voice activation rate | 30% of sessions | Analytics |
| Pages with IntelligentDocument | 100% of destination pages | Code coverage |
| Agent action usage | 5+ actions per session | Agent logs |
| User return rate | 40% weekly | Analytics |
| Time to first meaningful interaction | <10 seconds | Performance monitoring |

---

## Implementation Phases

### Phase 1: IntelligentDocument Foundation (Week 1)
- [ ] Create IntelligentDocument wrapper component
- [ ] Create DocumentSection with highlight capability
- [ ] Add 3 frontend CopilotKit actions
- [ ] Apply to 3 destination pages as pilot

### Phase 2: Live Components (Week 2)
- [ ] Create LiveVisaCard component
- [ ] Create LiveCostChart component
- [ ] Create LiveCurrencyConverter component
- [ ] Integrate with existing agent tools

### Phase 3: Voice Enhancement (Week 3)
- [ ] Add Two-Stage response pattern
- [ ] Implement context anchoring for relocation
- [ ] Add voice widget to all pages
- [ ] Test 5-turn conversation coherence

### Phase 4: Content Expansion (Ongoing)
- [ ] Create MDX templates for each page type
- [ ] Generate visa guide pages
- [ ] Generate comparison pages
- [ ] Add profession-specific guides

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Currency API rate limits | Medium | High | Cache rates, update hourly |
| Visa data becomes stale | High | High | Add lastUpdated, source links |
| Voice latency >2s | Medium | Medium | Two-stage pattern, caching |
| User context lost | Low | High | Zep memory, session persistence |

---

## Open Questions

- [ ] Which currency API to use? (Open Exchange Rates, Fixer.io)
- [ ] How to handle visa rules that vary by nationality?
- [ ] Should we add PDF export for visa checklists?
- [ ] Integration with booking/apartment sites?

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-12 | Initial PRD created | Dan + Claude |
