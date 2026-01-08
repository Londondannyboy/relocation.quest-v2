# Relocation Quest V2 - Implementation Plan

**Last Updated:** January 8, 2026 (Context #2)

---

## Project Overview

Voice-first AI relocation advisor demo showcasing:
- **CopilotKit** - AI chat with generative UI components
- **Hume EVI** - Voice-first interface
- **Neon PostgreSQL** - Database with all content
- **Pydantic AI** - Agent framework

---

## Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend (Vercel) | Deployed | https://relocation-quest-v2.vercel.app |
| Agent (Railway) | Deployed | https://atlas-agent-production.up.railway.app |
| Database (Neon) | Migrated | ep-wandering-leaf-ab17v6rr-pooler.eu-west-2.aws.neon.tech |

---

## COMPLETED WORK (Context #1-2)

### Database Migration
- [x] 210 articles migrated with `content_text` column
- [x] 217 jobs migrated from V1
- [x] 500 skills migrated from V1
- [x] **17 destinations** with full JSONB data:
  - Portugal, Spain, Cyprus, Dubai, Canada, Australia (initial 6)
  - UK, New Zealand, France, Germany, Netherlands, Mexico, Thailand (added 7)
  - Malta, Greece, Italy, Indonesia/Bali (added 4)
- [x] 22 topic_images for background switching
- [x] contact_submissions table schema ready

### Frontend Pages
- [x] `/` - Main page with VoiceWidget and CopilotKit
- [x] `/destinations` - Index page listing all destinations
- [x] `/destinations/[slug]` - Dynamic destination pages with tabs
- [x] `/guides` - Articles organized by category
- [x] `/guides/digital-nomad-visas` - SEO optimized visa guide
- [x] `/guides/cost-of-living` - Cost comparison page
- [x] `/contact`, `/privacy`, `/terms` - Static pages

### Homepage Enhancements (Completed)
- [x] AnimatedExamples - Rotating prompt suggestions
- [x] TrustBadges - CopilotKit, Hume, Neon logos
- [x] VoiceWidget centered with `size="large"`
- [x] CopilotSidebar `defaultOpen={false}`
- [x] Revolving hero images (8-second cycle)

### Generative UI Components (Completed)
- [x] `DestinationCard` - Full destination overview with tabs
- [x] `DestinationCardCompact` - Grid cards for recommendations
- [x] `CostOfLivingChart` - City-level cost breakdown with bars
- [x] `DestinationComparison` - Side-by-side comparison UI
- [x] `VisaGrid` - Visa options with badges and requirements
- [x] All components registered with `useRenderToolCall`

### Destination Pages (Completed)
- [x] Image Gallery - 6 images from Unsplash with lightbox
- [x] Similar Destinations - 4 related destinations at bottom
- [x] Dynamic hero images per destination
- [x] Tabbed layout (Overview, Visas, Costs, Jobs)

### Agent Tools (Completed)
- [x] `show_featured_destinations` - DB-driven
- [x] `show_visa_timeline` - Uses DB visa data
- [x] `show_cost_of_living` - City-level cost breakdown
- [x] `compare_two_destinations` - Compare any 2 destinations
- [x] `get_destination_details` - Comprehensive destination info
- [x] System prompt lists all 17 destinations

---

## REMAINING TASKS (Priority Order)

### Phase 1: Immediate Polish
- [ ] Test all generative UI components in chat
- [ ] Ensure agent returns UI components (not just text)
- [ ] Fix any mobile layout issues
- [ ] Test voice interaction flow

### Phase 2: Interactive Tools
- [ ] Cost of Living Calculator (`/tools/cost-calculator`)
- [ ] Destination Comparison Tool (`/tools/compare`)
- [ ] Visa Timeline Tool (`/tools/visa-timeline`)
- [ ] Relocation Readiness Quiz (`/tools/quiz`)

### Phase 3: Agent Improvements
- [ ] Add vector search with Voyage AI embeddings
- [ ] Improve error handling/fallbacks
- [ ] Add personalization (remember user priorities)
- [ ] Add visa eligibility checker tool

### Phase 4: Content & SEO
- [ ] SEO landing pages (`/moving-from-usa`, `/best-countries-for/*`)
- [ ] More articles specific to new destinations
- [ ] Video testimonials integration
- [ ] Expert interviews content

### Phase 5: Performance
- [ ] Image optimization (next/image)
- [ ] Edge caching for API routes
- [ ] Lazy load destination data
- [ ] Mobile-first responsive improvements

---

## Database Schema

### articles (210 rows)
```sql
id, slug, title, content, content_text, excerpt, hero_image_url,
country, article_mode, category, is_featured, published_at, structured_data
```

### destinations (17 rows)
```sql
id, slug, country_name, flag, region, hero_title, hero_subtitle,
language, enabled, featured, priority,
quick_facts JSONB, highlights JSONB, visas JSONB,
cost_of_living JSONB, job_market JSONB, faqs JSONB,
meta_title, meta_description, hero_image_url
```

### jobs (217 rows)
```sql
id, title, company, location, salary, description, job_source,
posted_date, category, remote, slug, company_logo, job_url, status
```

### skills (500 rows)
```sql
id, name
```

---

## Key Files

### Frontend
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page with voice widget, CopilotKit, generative UI rendering |
| `src/app/destinations/[slug]/DestinationClient.tsx` | Destination pages with gallery, similar destinations |
| `src/components/generative-ui/DestinationCard.tsx` | Rich destination card |
| `src/components/generative-ui/CostOfLivingChart.tsx` | Cost breakdown visual |
| `src/components/generative-ui/DestinationComparison.tsx` | Side-by-side comparison |
| `src/components/generative-ui/VisaGrid.tsx` | Visa options grid |
| `src/app/api/unsplash/route.ts` | Background images + gallery API |

### Backend
| File | Purpose |
|------|---------|
| `agent/src/agent.py` | ATLAS agent with all tools |
| `agent/src/database.py` | Neon queries - destinations, articles, visa, cost |

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
2. Check this file for current task status
3. Check agent health: `curl https://atlas-agent-production.up.railway.app/health`
4. Continue with remaining tasks starting at Phase 1
