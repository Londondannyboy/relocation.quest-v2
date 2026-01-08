# Relocation Quest V2 - Implementation Plan

**Last Updated:** January 8, 2026

---

## Project Overview

Voice-first AI relocation advisor demo showcasing:
- **CopilotKit** - AI chat with generative UI
- **Hume EVI** - Voice-first interface
- **Neon PostgreSQL** - Database with all content

---

## Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend (Vercel) | Deployed | https://relocation-quest-v2.vercel.app |
| Agent (Railway) | Deployed | https://atlas-agent-production.up.railway.app |
| Database (Neon) | Migrated | ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech |

---

## ✅ COMPLETED WORK

### Database
- [x] 210 articles migrated with `content_text` column
- [x] 6 destinations with full JSONB (Portugal, Spain, Cyprus, Dubai, Canada, Australia)
- [x] 20 topic_images for background switching
- [x] Agent database functions (`get_destination_by_slug`, `search_destinations`)

### Frontend Pages
- [x] `/` - Main page with VoiceWidget and CopilotKit
- [x] `/destinations` - Index page listing all destinations
- [x] `/destinations/[slug]` - Dynamic destination pages with tabs
- [x] `/guides` - Articles organized by category
- [x] `/guides/digital-nomad-visas` - SEO optimized visa guide
- [x] `/guides/cost-of-living` - Cost comparison page
- [x] `/contact` - Contact page
- [x] `/privacy` - Privacy policy
- [x] `/terms` - Terms of service

### SEO & Navigation
- [x] Dynamic metadata on destination pages (`generateMetadata`)
- [x] Dynamic sitemap with all pages
- [x] robots.txt
- [x] Header with full navigation
- [x] Footer with 4-column layout

### UI
- [x] VoiceWidget centered with `size="large"` and `centered={true}`
- [x] CopilotSidebar `defaultOpen={false}`
- [x] Background brightness fixed (0.85) with opacity (70%)
- [x] Revolving hero images (8-second cycle)

### Backend
- [x] Railway deploying Python (railway.toml)
- [x] Keyword search on content_text
- [x] Health endpoint working

---

## 🚀 NEXT PHASE PLAN

### PHASE 1: Core Polish (Immediate)

#### 1.1 Homepage Enhancement
- [ ] Add animated "What can ATLAS help with?" examples that cycle
- [ ] Add trust badges (powered by logos)
- [ ] Add recent success stories carousel
- [ ] Improve mobile hero layout

#### 1.2 Destination Pages
- [ ] Add image gallery section (Unsplash integration)
- [ ] Add "Similar Destinations" recommendations
- [ ] Add "Start your journey" CTA that opens CopilotKit
- [ ] Add social sharing buttons

#### 1.3 Agent Improvements
- [ ] Ensure agent returns rich UI cards (not just text)
- [ ] Add destination comparison tool
- [ ] Add visa eligibility checker
- [ ] Improve error handling/fallbacks

---

### PHASE 2: Interactive Tools

#### 2.1 Cost of Living Calculator
```
Location: /tools/cost-calculator
Features:
- Select destination
- Input current salary/budget
- Calculate equivalent lifestyle
- Show breakdown by category
- Compare up to 3 cities
```

#### 2.2 Destination Comparison Tool
```
Location: /tools/compare
Features:
- Side-by-side comparison (2-4 destinations)
- Radar charts for categories
- Pros/cons summary
- Best for: Remote workers / Families / Retirees
```

#### 2.3 Visa Timeline Tool
```
Location: /tools/visa-timeline
Features:
- Select visa type
- Show application steps
- Estimated processing time
- Document checklist
- Cost breakdown
```

#### 2.4 Relocation Readiness Quiz
```
Location: /tools/quiz
Features:
- 10-15 questions about priorities
- Budget, climate, language preferences
- Work style (remote, local job, entrepreneur)
- Results: Top 3 destination matches
```

---

### PHASE 3: Enhanced Agent Capabilities

#### 3.1 Vector Search (Voyage AI)
```python
# Add to database.py
async def search_articles_semantic(query: str, limit: int = 5):
    """Semantic search using Voyage embeddings."""
    embedding = await get_embedding(query)
    results = await conn.fetch("""
        SELECT * FROM articles
        ORDER BY embedding <-> $1
        LIMIT $2
    """, embedding, limit)
    return results
```

#### 3.2 Structured Responses
```python
# Agent returns structured data for CopilotKit
{
  "type": "destination_comparison",
  "data": {
    "destinations": [...],
    "comparison_metrics": [...],
    "recommendation": "..."
  }
}
```

#### 3.3 Personalization
- Remember user's mentioned priorities
- Adjust recommendations based on conversation
- Offer follow-up suggestions

---

### PHASE 4: User Features

#### 4.1 Save & Share
- [ ] Save destinations to wishlist (local storage initially)
- [ ] Share comparison results
- [ ] Export relocation checklist as PDF

#### 4.2 User Dashboard (Future)
- [ ] Neon Auth integration
- [ ] Saved destinations
- [ ] Conversation history
- [ ] Document progress tracker

---

### PHASE 5: Content Expansion

#### 5.1 More Destinations
Priority to add (using same JSONB structure):
1. Mexico (digital nomad visa)
2. Thailand (remote worker visas)
3. Bali/Indonesia
4. Malta (tax benefits)
5. Greece (Golden Visa)
6. Italy (Digital Nomad Visa)
7. Netherlands (DAFT treaty)
8. Germany (freelancer visa)

#### 5.2 SEO Landing Pages
- [ ] `/moving-from-usa` - Country-specific departure guides
- [ ] `/moving-from-uk`
- [ ] `/best-countries-for/remote-workers`
- [ ] `/best-countries-for/retirees`
- [ ] `/best-countries-for/entrepreneurs`
- [ ] `/visa-types/golden-visa-guide`
- [ ] `/visa-types/digital-nomad-visa-guide`

#### 5.3 Content Types
- [ ] Video testimonials (embedded YouTube)
- [ ] Podcast episodes
- [ ] Expert interviews

---

### PHASE 6: Performance & Polish

#### 6.1 Performance
- [ ] Image optimization (next/image everywhere)
- [ ] Edge caching for API routes
- [ ] Lazy load destination data
- [ ] Prefetch on hover

#### 6.2 Mobile Experience
- [ ] Responsive voice widget
- [ ] Touch-friendly comparisons
- [ ] Mobile-first destination pages

#### 6.3 Loading States
- [ ] Skeleton loaders
- [ ] Optimistic updates
- [ ] Better error boundaries

#### 6.4 Analytics
- [ ] Vercel Analytics
- [ ] Track popular destinations
- [ ] Track common questions
- [ ] Conversion tracking

---

## Database Schema

### articles (210 rows)
```sql
id, slug, title, content, content_text, excerpt, hero_image_url,
country, article_mode, category, is_featured, published_at, structured_data
```

### destinations (6 rows)
```sql
id, slug, country_name, flag, region, hero_title, hero_subtitle,
language, enabled, featured, priority,
quick_facts JSONB, highlights JSONB, visas JSONB,
cost_of_living JSONB, job_market JSONB, faqs JSONB,
meta_title, meta_description, hero_image_url
```

### topic_images (20 rows)
```sql
id, topic_name, topic_keywords[], image_url, country
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page with voice widget |
| `src/app/destinations/[slug]/page.tsx` | Dynamic destination pages |
| `src/app/api/destinations/[slug]/route.ts` | Destination API |
| `src/components/VoiceWidget.tsx` | Voice widget |
| `agent/src/agent.py` | ATLAS agent |
| `agent/src/database.py` | Neon queries |

---

## Environment Variables

### Vercel
```
AGENT_URL=https://atlas-agent-production.up.railway.app/agui
DATABASE_URL=postgresql://...
HUME_API_KEY=...
HUME_SECRET_KEY=...
NEXT_PUBLIC_HUME_CONFIG_ID=...
UNSPLASH_ACCESS_KEY=...
```

### Railway
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=...
VOYAGE_API_KEY=...
```

---

## Quick Commands

```bash
# Frontend
cd /Users/dankeegan/relocation.quest-v2 && npm run dev

# Agent
cd /Users/dankeegan/relocation.quest-v2/agent && source .venv/bin/activate && uvicorn src.agent:app --reload --port 8000

# Health check
curl https://atlas-agent-production.up.railway.app/health

# Database
psql "postgresql://neondb_owner:npg_3aW1xuoyUiYk@ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech/neondb"
```

---

## Restart Instructions

1. Read `CLAUDE.md` for full technical reference
2. Read this `PLAN.md` for current status and roadmap
3. Check agent health: `curl https://atlas-agent-production.up.railway.app/health`
4. Start with Phase 1 immediate tasks
