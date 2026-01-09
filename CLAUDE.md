# RELOCATION QUEST V2

**Voice-first AI relocation advisor - "Shock and Awe" demo showcasing CopilotKit + Hume EVI + Neon**

---

## Deployment URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://relocation-quest-v2.vercel.app | Deployed |
| **Agent** | https://atlas-agent-production.up.railway.app | Deployed |
| **Health Check** | https://atlas-agent-production.up.railway.app/health | Should return OK |

---

## Database (Neon PostgreSQL)

**Connection String (in .env.local):**
```
postgresql://neondb_owner:npg_3aW1xuoyUiYk@ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**Tables Created:**

| Table | Records | Purpose |
|-------|---------|---------|
| `articles` | 210 | Relocation content (guides, stories, nomad content) |
| `topic_images` | 22 | Destination background images with keyword arrays |
| `destinations` | 17 | Full structured destination data (Portugal, Spain, Cyprus, Dubai, Canada, Australia, UK, New Zealand, France, Germany, Netherlands, Mexico, Thailand, Malta, Greece, Italy, Indonesia/Bali) |
| `jobs` | 217 | Active job listings (migrated from V1) |
| `skills` | 500 | Skills reference table for job matching |
| `companies` | 0 | Company/agency listings (schema ready) |
| `contact_submissions` | 0 | Contact form submissions (schema ready) |
| `users` | - | User accounts |
| `user_data` | - | User preferences and preferred_name |

---

## Quick Start

```bash
# Frontend
cd /Users/dankeegan/relocation.quest-v2
npm install
npm run dev  # → localhost:3000

# Backend
cd agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.agent:app --reload --port 8000
```

---

## Architecture

```
User speaks → Hume EVI → ATLAS (Travel Advisor)
                              ↓
                    delegate_to_destination_expert
                              ↓
                    Queries: articles, destinations tables
                              ↓
                    Returns: destination data, comparison graphs,
                    visa timelines, cost breakdowns, hero images
                              ↓
                    CopilotKit renders rich UI components
                    Background changes to destination imagery
```

---

## Key Files

### Frontend (`src/`)

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main page - centered VoiceWidget, CopilotSidebar (collapsed by default), background switching |
| `app/layout.tsx` | Root layout, SEO metadata |
| `app/api/unsplash/route.ts` | Dynamic background images API |
| `components/VoiceWidget.tsx` | Hume EVI voice widget with `size` and `centered` props |
| `components/generative-ui/DestinationContext.tsx` | Destination info with tabs |
| `components/generative-ui/GuideCard.tsx` | Relocation guide cards |
| `lib/destinations/data.ts` | **LEGACY** - Static destination data (to be replaced by DB) |

### Backend (`agent/src/`)

| File | Purpose |
|------|---------|
| `agent.py` | ATLAS agent, CopilotKit endpoint, delegate_to_destination_expert tool |
| `database.py` | Neon queries - keyword search on `content_text`, topic images, user lookup |
| `tools.py` | Phonetic corrections, search functions |
| `railway.toml` | Forces Python deployment with nixpacks |

---

## Database Schema

### articles table
```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,           -- HTML for page rendering
    content_text TEXT,      -- Plain text for agent queries (no HTML)
    excerpt TEXT,
    hero_image_url TEXT,
    country VARCHAR(100),
    article_mode VARCHAR(50), -- guide, story, nomad, topic, voices
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    structured_data JSONB
);
```

### destinations table
```sql
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    flag VARCHAR(10),
    region VARCHAR(100),
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_gradient TEXT,
    language VARCHAR(50),
    enabled BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    quick_facts JSONB,      -- [{icon, label, value}]
    highlights JSONB,       -- [{title, description, icon}]
    visas JSONB,           -- [{name, type, duration, requirements, processingTime, cost}]
    cost_of_living JSONB,  -- {currency, items: [{category, item, cost, frequency}]}
    job_market JSONB,      -- {remote_friendly, in_demand_sectors, avg_salaries, work_culture}
    faqs JSONB,            -- [{question, answer}]
    meta_title TEXT,
    meta_description TEXT,
    hero_image_url TEXT
);
```

### topic_images table
```sql
CREATE TABLE topic_images (
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR(100) NOT NULL,
    topic_keywords TEXT[] NOT NULL,  -- Array for phonetic matching
    image_url TEXT NOT NULL,
    country VARCHAR(100)
);
```

---

## Environment Variables

### Frontend (.env.local / Vercel)
```
AGENT_URL=https://atlas-agent-production.up.railway.app/agui
DATABASE_URL=postgresql://neondb_owner:npg_3aW1xuoyUiYk@ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
HUME_API_KEY=FS313vtpHE8svozXdt7hAs3m0U4rd0dJwV1VW0fWF9cewu79
HUME_SECRET_KEY=4LF8hFTCcMhbl3fbuOO8UGAKpoXdJ91xWjnSUTrCfhsV8GN20A2Xkgs0Y4tPXXbN
NEXT_PUBLIC_HUME_CONFIG_ID=8d16f5df-8bf4-4641-a58d-84dca68fa7b0
UNSPLASH_ACCESS_KEY=<set on Vercel>
ZEP_API_KEY=<set on Vercel>
```

### Backend (Railway)
```
DATABASE_URL=postgresql://neondb_owner:npg_3aW1xuoyUiYk@ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
GROQ_API_KEY=<set on Railway>
VOYAGE_API_KEY=<set on Railway>
GOOGLE_API_KEY=<set on Railway>
ZEP_API_KEY=<set on Railway>
```

---

## UI State

### Implemented
- **VoiceWidget**: Centered in hero, large size (`w-28 h-28 md:w-36 md:h-36`), "Tap to talk to ATLAS" text
- **CopilotSidebar**: `defaultOpen={false}` - collapsed by default
- **Background switching**: Immediate on topic button click via `handleDestinationMentioned()`
- **Revolving hero images**: 6 destinations cycling every 8 seconds

### Key Code Patterns

**VoiceWidget Props:**
```tsx
<VoiceWidget
  size="large"      // 'small' | 'large'
  centered={true}   // removes fixed positioning
  onMessage={handleVoiceMessage}
  onDestinationMentioned={handleDestinationMentioned}
/>
```

**Immediate Background Change:**
```tsx
const handleTopicClick = useCallback((topic: string) => {
  // 1. Immediately change background
  handleDestinationMentioned(topic);
  // 2. Also send to CopilotKit
  appendMessage(new TextMessage({ content: `Tell me about ${topic}`, role: Role.User }));
}, [handleDestinationMentioned, appendMessage]);
```

---

## Agent Search (database.py)

Uses keyword search on `content_text` column (not vector search):

```python
async def search_articles_keyword(query_text: str, limit: int = 5, country: str = None):
    """Simple keyword search on articles using content_text column."""
    # Scores: title match = 3.0, excerpt = 2.0, content_text = 1.0
    # Orders by score DESC, published_at DESC
```

---

## Debugging Commands

```bash
# Check Railway agent health
curl https://atlas-agent-production.up.railway.app/health

# Check Railway logs
railway logs

# Test agent locally
cd agent && uvicorn src.agent:app --reload --port 8000
curl http://localhost:8000/health

# Database queries
psql "postgresql://neondb_owner:npg_3aW1xuoyUiYk@ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Count articles
SELECT COUNT(*) FROM articles;
SELECT article_mode, COUNT(*) FROM articles GROUP BY article_mode;

# Check destinations
SELECT country_name, slug FROM destinations;

# Check topic images
SELECT topic_name, topic_keywords FROM topic_images;
```

---

## What's Working (Updated Jan 9, 2026 - Phase 2 Complete)

### Infrastructure
- [x] Frontend deployed to Vercel
- [x] Agent deployed to Railway (Python with railway.toml)
- [x] Database migrated to dedicated Neon instance
- [x] 210 articles imported with content_text
- [x] 217 jobs migrated from V1
- [x] 500 skills migrated from V1
- [x] **17 destinations** with full structured data (not 6!)
- [x] 22 topic images for background switching

### Destinations in Database
Portugal, Spain, Cyprus, Dubai, Canada, Australia, UK, New Zealand, France, Germany, Netherlands, Mexico, Thailand, Malta, Greece, Italy, Indonesia/Bali

### Frontend Pages (All Created)
- [x] `/` - Main page with VoiceWidget, CopilotKit, AnimatedExamples, TrustBadges
- [x] `/destinations` - Index page listing all destinations
- [x] `/destinations/[slug]` - Dynamic pages with Image Gallery + Similar Destinations
- [x] `/guides` - Articles organized by category
- [x] `/guides/digital-nomad-visas` - SEO optimized visa guide
- [x] `/guides/cost-of-living` - Cost comparison page
- [x] `/tools` - Tools index page (NEW)
- [x] `/tools/cost-calculator` - Interactive cost of living calculator (NEW)
- [x] `/contact`, `/privacy`, `/terms`, `/articles`

### Generative UI Components (NEW)
All in `src/components/generative-ui/`:
- [x] `DestinationCard.tsx` - Full destination overview with tabs
- [x] `DestinationCardCompact` - Grid cards for recommendations
- [x] `CostOfLivingChart.tsx` - City-level cost breakdown with visual bars
- [x] `DestinationComparison.tsx` - Side-by-side comparison with tabs
- [x] `VisaGrid.tsx` - Visa options with badges and requirements
- All registered with `useRenderToolCall` in page.tsx

### Destination Page Features (NEW)
- [x] Image Gallery (6 Unsplash photos with lightbox)
- [x] Similar Destinations (4 related destinations, prioritizes same region)
- [x] Dynamic hero images per destination
- [x] Tabbed layout (Overview, Visas, Costs, Jobs)

### Agent Tools
- [x] `show_featured_destinations` - DB-driven
- [x] `show_visa_timeline` - Uses DB visa data
- [x] `show_cost_of_living` - City-level cost breakdown
- [x] `compare_two_destinations` - Compare any 2 destinations
- [x] `get_destination_details` - Comprehensive destination info
- [x] System prompt lists all 17 destinations

### Agent Fixes (Jan 9, 2026)
- [x] Search extracts key terms from natural language ("tell me about Portugal" → "portugal")
- [x] Fixed affirmation detection (removed overly broad "tell me" match)
- [x] Voyage API fallback (uses keyword search when no API key)
- [x] Groq→Gemini model fallback for CLM endpoint

### Interactive Tools (Jan 9, 2026)
All at `/tools/*`:
- [x] Cost of Living Calculator (`/tools/cost-calculator`)
- [x] Destination Comparison Tool (`/tools/compare`)
- [x] Visa Timeline Planner (`/tools/visa-timeline`)
- [x] Relocation Readiness Quiz (`/tools/quiz`)

### CopilotKit Tool Integration
Agent tools that render ToolCTA components in chat:
- [x] `show_cost_calculator` - Opens cost calculator
- [x] `show_comparison_tool` - Opens comparison tool
- [x] `show_visa_planner` - Opens visa planner
- [x] `show_relocation_quiz` - Opens quiz

### SEO (Jan 9, 2026)
- [x] Article pages: Server-rendered with generateMetadata
- [x] JSON-LD schemas: Article, Organization, WebSite
- [x] Open Graph metadata on all pages
- [x] Twitter cards on all pages
- [x] Canonical URLs
- [x] Dynamic sitemap (DB-driven)
- [x] Proper robots.txt

### Database Fixes
- [x] Dubai topic_image: Changed country from 'UAE' to 'Dubai'

---

## Next Phase Tasks

See `PLAN.md` for comprehensive roadmap.

### COMPLETED (Phase 1)
- [x] Add animated "What can ATLAS help with?" examples
- [x] Add trust badges (powered by logos)
- [x] Add image gallery to destination pages
- [x] Add "Similar Destinations" recommendations
- [x] Add 17 destinations (all initial + additional)
- [x] Create generative UI components

### REMAINING (Priority Order)

#### Immediate
1. [ ] Test all generative UI components in chat
2. [ ] Ensure agent returns UI components (not just text)
3. [ ] Fix any mobile layout issues
4. [ ] Test voice interaction flow

#### Interactive Tools (Phase 2)
5. [ ] Cost of Living Calculator (`/tools/cost-calculator`)
6. [ ] Destination Comparison Tool (`/tools/compare`)
7. [ ] Visa Timeline Tool (`/tools/visa-timeline`)
8. [ ] Relocation Readiness Quiz (`/tools/quiz`)

#### Content & SEO (Phase 4)
9. [ ] Create SEO landing pages (`/moving-from-usa`, `/best-countries-for/*`)
10. [ ] Add vector search with Voyage AI embeddings

---

## File Locations

```
/Users/dankeegan/relocation.quest-v2/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main page with voice widget
│   │   ├── api/
│   │   │   ├── unsplash/route.ts       # Background images API
│   │   │   └── copilotkit/route.ts     # CopilotKit endpoint
│   │   └── destinations/[slug]/page.tsx # Destination pages
│   ├── components/
│   │   └── VoiceWidget.tsx             # Voice widget component
│   └── lib/
│       └── destinations/data.ts        # LEGACY static data
├── agent/
│   ├── src/
│   │   ├── agent.py                    # ATLAS agent
│   │   └── database.py                 # Neon queries
│   ├── railway.toml                    # Railway Python config
│   └── requirements.txt
├── .env.local                          # Local environment
├── CLAUDE.md                           # This file
└── PLAN.md                             # Implementation status
```
