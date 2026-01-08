# Relocation Quest V2 - Implementation Status

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

## Completed Work

### Database Migration
- [x] Created dedicated Neon database for relocation.quest
- [x] Migrated 210 articles from Quest DB with `content_text` column
- [x] Created `topic_images` table with 20 destinations
- [x] Created `destinations` table with full schema
- [x] Inserted 6 destinations: Portugal, Spain, Cyprus, Dubai, Canada, Australia
- [x] Each destination has: quick_facts, highlights, visas, cost_of_living, job_market, faqs (JSONB)

### UI Implementation
- [x] VoiceWidget centered in hero with `size="large"` and `centered={true}` props
- [x] CopilotSidebar `defaultOpen={false}` - collapsed by default
- [x] Immediate background change on topic button click
- [x] Revolving hero images (6 destinations, 8-second cycle)
- [x] Unsplash API integration for dynamic backgrounds

### Agent/Backend
- [x] Railway deploying Python (fixed with railway.toml)
- [x] Updated `database.py` with keyword search on `content_text`
- [x] Updated environment variables on Railway
- [x] Health endpoint working

---

## Current Task: Frontend Database Integration

The `destinations` table now has 6 destinations with full structured data. Need to:

1. **Create API route** `/api/destinations/[slug]/route.ts`
   - Fetch destination from database
   - Return all JSONB fields (quick_facts, visas, etc.)

2. **Update destination page** `src/app/destinations/[slug]/page.tsx`
   - Currently uses static `lib/destinations/data.ts`
   - Should fetch from `/api/destinations/[slug]`

3. **Remove static data file** (after migration complete)
   - `src/lib/destinations/data.ts` becomes obsolete

---

## Remaining Static Pages to Migrate

These pages exist as static code and should become database articles:

| Page | Current Location | Target |
|------|-----------------|--------|
| Moving to Cyprus | `/guides/moving-to-cyprus/` | articles table |
| What is Corporate Relocation | `/guides/what-is-corporate-relocation/` | articles table |
| Other guide pages | `/guides/*` | articles table |

---

## Database Tables Summary

### articles (210 rows)
```
Columns: id, slug, title, content, content_text, excerpt, hero_image_url,
         country, article_mode, category, is_featured, published_at, structured_data
```

### destinations (6 rows)
```
Columns: id, slug, country_name, flag, region, hero_title, hero_subtitle, hero_gradient,
         language, enabled, featured, priority, quick_facts, highlights, visas,
         cost_of_living, job_market, faqs, meta_title, meta_description, hero_image_url

Data: Portugal, Spain, Cyprus, Dubai, Canada, Australia
```

### topic_images (20 rows)
```
Columns: id, topic_name, topic_keywords[], image_url, country

Data: Portugal, Spain, Cyprus, Dubai, UAE, Australia, Canada, Thailand, Bali,
      Indonesia, Mexico, Malta, Greece, Italy, France, UK, Germany, Netherlands,
      Singapore, Japan
```

---

## Next Steps (Priority Order)

### 1. Frontend Database Integration (HIGH)
```typescript
// Create: src/app/api/destinations/[slug]/route.ts
// Fetch destination by slug from Neon
// Return full JSONB data

// Update: src/app/destinations/[slug]/page.tsx
// Use API instead of static data.ts
```

### 2. Test End-to-End Flow (HIGH)
- Voice input → Hume EVI → ATLAS agent
- Agent queries articles/destinations
- Returns structured data for visualization
- Background changes on destination mention

### 3. Migrate Remaining Guide Pages (MEDIUM)
- Identify all static guide pages
- Convert to articles in database
- Set appropriate article_mode

### 4. Add More Destinations (MEDIUM)
- Mexico, Thailand, Bali, Malta, Greece, Italy
- Use same JSONB structure as existing 6

---

## Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `src/app/page.tsx` | Main page with voice widget | Updated |
| `src/components/VoiceWidget.tsx` | Voice widget with size/centered props | Updated |
| `src/app/api/unsplash/route.ts` | Background images | Working |
| `src/lib/destinations/data.ts` | Static destination data | TO BE REPLACED |
| `agent/src/database.py` | Neon queries | Updated |
| `agent/railway.toml` | Python deployment config | Created |

---

## Environment Variables Required

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

## Restart Instructions

When resuming work:

1. Read `CLAUDE.md` for project overview and all technical details
2. Read this `PLAN.md` for current status and next steps
3. Key context:
   - Database has 210 articles, 6 destinations, 20 topic images
   - Frontend still uses static `lib/destinations/data.ts`
   - Need to create API route and update destination pages
   - All content strategy: database-first (not static pages)
