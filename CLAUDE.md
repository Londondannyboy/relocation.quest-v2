# RELOCATION QUEST V2

**Voice-first AI relocation advisor - "Shock and Awe" demo**

| | |
|---|---|
| **Repository** | `/Users/dankeegan/relocation.quest-v2` |
| **Frontend** | Vercel (TBD) |
| **Backend** | Railway (TBD) |
| **Database** | Neon (same as relocation.quest) |

---

## Quick Start

```bash
# Frontend
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
| `app/page.tsx` | Main page with CopilotKit sidebar, background switching |
| `app/layout.tsx` | Root layout, SEO metadata |
| `components/voice-input.tsx` | Hume EVI voice integration |
| `components/generative-ui/DestinationContext.tsx` | Destination info with tabs |
| `components/generative-ui/GuideCard.tsx` | Relocation guide cards |
| `components/DestinationExpert.tsx` | Chat avatar component |

### Backend (`agent/src/`)
| File | Purpose |
|------|---------|
| `agent.py` | ATLAS agent, CLM endpoint, delegate_to_destination_expert tool |
| `database.py` | Neon queries, get_destination_image(), RRF search |
| `tools.py` | Phonetic corrections, search functions |

---

## Persona: ATLAS

ATLAS is a travel and relocation expert who helps people move abroad.

**Characteristics:**
- Warm, knowledgeable about visas, cost of living, job markets
- Shows data visualizations (comparison graphs, timelines)
- Data-driven but aspirational
- Ends responses with follow-up questions

**Phonetic Corrections (voice):**
```python
"sigh prus" -> "cyprus"
"port of gal" -> "portugal"
"dew by" -> "dubai"
"ma tah" -> "malta"
```

---

## Database

**Tables:**
- `articles` - Relocation guides and content (filtered by `app = 'relocation'`)
- `topic_images` - Destination images with keyword arrays for background switching
- `destination_data` - Structured comparison data (cost of living, taxes, etc.)

**Image Lookup:**
```sql
SELECT image_url FROM topic_images
WHERE 'cyprus' = ANY(topic_keywords);
```

---

## Environment Variables

### Frontend (Vercel)
```
AGENT_URL=https://relocation-quest-v2.up.railway.app/agui
DATABASE_URL=<neon connection string>
HUME_API_KEY=<hume api key>
HUME_SECRET_KEY=<hume secret>
NEXT_PUBLIC_HUME_CONFIG_ID=<atlas config id>
ZEP_API_KEY=<zep api key>
```

### Backend (Railway)
```
DATABASE_URL=<neon connection string>
GROQ_API_KEY=<groq api key>
VOYAGE_API_KEY=<voyage api key>
ZEP_API_KEY=<zep api key>
```

---

## CopilotKit Visualization Components

| Component | Purpose |
|-----------|---------|
| `DestinationContext` | Tabbed view: Guides, Map, Visa Timeline |
| `DestinationComparison` | Bar chart comparing destination vs UK |
| `VisaTimeline` | Step-by-step visa process |
| `DestinationStats` | Data cards (rent, tax, weather, internet) |
| `DestinationMap` | Interactive world map |

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Project duplicated from lost-london-v2 | ✅ | |
| Build artifacts removed | ✅ | |
| Lost London references purged | 🔄 | In progress |
| ATLAS persona implemented | ⏳ | |
| topic_images table created | ⏳ | |
| Dynamic backgrounds working | ⏳ | |
| Railway deployment | ⏳ | |
| Vercel deployment | ⏳ | |

---

## Debugging

```bash
# Check Railway logs
railway logs --service relocation-quest-v2

# Test CLM endpoint
curl -X POST 'http://localhost:8000/chat/completions' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Tell me about Cyprus"}]}'

# Test destination image lookup
psql $DATABASE_URL -c "SELECT * FROM topic_images WHERE 'cyprus' = ANY(topic_keywords);"
```

---

## Success Criteria

- [ ] User says "Cyprus" → stunning Mediterranean background appears
- [ ] Voice conversation feels natural with ATLAS persona
- [ ] CopilotKit shows comparison graphs when discussing destinations
- [ ] Data cards display key metrics (cost, tax, visa timeline)
- [ ] Demo impresses in under 60 seconds
- [ ] Works smoothly on mobile
