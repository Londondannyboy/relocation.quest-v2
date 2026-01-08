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
| `topic_images` | 20 | Destination background images with keyword arrays |
| `destinations` | 6 | Full structured destination data (Portugal, Spain, Cyprus, Dubai, Canada, Australia) |
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
NEXT_PUBLIC_HUME_CONFIG_ID=6b57249f-a118-45ce-88ab-b80899bf9864
UNSPLASH_ACCESS_KEY=<set on Vercel>
```

### Backend (Railway)
```
DATABASE_URL=postgresql://neondb_owner:npg_3aW1xuoyUiYk@ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
GROQ_API_KEY=<set on Railway>
VOYAGE_API_KEY=<set on Railway>
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

## What's Working

- [x] Frontend deployed to Vercel
- [x] Agent deployed to Railway (Python with railway.toml)
- [x] Database migrated to dedicated Neon instance
- [x] 210 articles imported with content_text
- [x] 6 destinations with full structured data
- [x] 20 topic images for background switching
- [x] VoiceWidget centered and large
- [x] CopilotSidebar collapsed by default
- [x] Immediate background change on topic click
- [x] Unsplash API integration

---

## Pending Tasks

### High Priority
1. [ ] **Update frontend to fetch destinations from database** (currently uses static `lib/destinations/data.ts`)
2. [ ] **Migrate remaining static guide pages** (moving-to-cyprus, what-is-corporate-relocation, etc.)
3. [ ] **Test full end-to-end flow** (voice → agent → visualization)

### Medium Priority
4. [ ] Create API route `/api/destinations/[slug]` to fetch from DB
5. [ ] Update `/destinations/[slug]/page.tsx` to use database
6. [ ] Set up Neon Auth
7. [ ] Add more destinations to database

### Lower Priority
8. [ ] Clean up remaining VIC references in profile/dashboard pages
9. [ ] Add structured_data JSONB to articles for comparisons
10. [ ] Implement vector search with embeddings

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
