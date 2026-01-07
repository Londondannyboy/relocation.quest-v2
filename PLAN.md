# relocation.quest-v2 Implementation Status

## Goal
Create a "shock and awe" demo showcasing CopilotKit + Hume EVI + Neon for relocation advisory.

---

## Completed

- [x] Project duplicated from lost-london-v2
- [x] CLAUDE.md created
- [x] PLAN.md created
- [x] Removed .git, node_modules, .next, .vercel, agent/.venv
- [x] package.json name updated to "relocation-quest-v2"
- [x] agent/pyproject.toml updated to "relocation-quest-agent"
- [x] Removed RESTART_PLAN_JAN_2026.md and MOONSHOT_RESTART_PLAN.md

### Frontend Purging Completed
- [x] src/app/layout.tsx - metadata updated for Relocation Quest
- [x] src/app/page.tsx - VIC → ATLAS, Lost London → Relocation Quest, topic pills updated
- [x] src/components/Header.tsx - Lost London → Relocation Quest, VIC → ATLAS
- [x] src/components/Footer.tsx - Lost London → Relocation Quest
- [x] src/components/voice-input.tsx - VIC → ATLAS, system prompt updated
- [x] src/components/ChatMessages.tsx - VIC → ATLAS
- [x] src/components/CopilotWrapper.tsx - vic_agent → atlas_agent
- [x] src/components/DestinationExpert.tsx - Created (replaced LibrarianAvatar.tsx)
- [x] src/app/auth/[path]/page.tsx - Updated for Relocation Quest
- [x] src/app/api/copilotkit/route.ts - vic_agent → atlas_agent
- [x] src/app/api/zep/user/route.ts - Updated references

### Files Removed
- [x] src/components/LibrarianAvatar.tsx
- [x] src/components/VicAvatar.tsx
- [x] src/components/BookStrip.tsx
- [x] src/components/generative-ui/BookDisplay.tsx

---

## Still Has Some VIC/Lost London References (Lower Priority)

These pages still have some VIC references but are less critical:
- [ ] src/app/profile/page.tsx - VIC references
- [ ] src/app/dashboard/page.tsx - VIC references
- [ ] src/app/articles/page.tsx - VIC references
- [ ] src/app/article/[slug]/page.tsx - VIC references

---

## Pending - Agent Backend

- [ ] agent/src/agent.py - VIC_SYSTEM_PROMPT → ATLAS_SYSTEM_PROMPT
- [ ] agent/src/librarian.py - Rename/update for Destination Expert
- [ ] agent/src/database.py - Update references
- [ ] agent/src/tools.py - Update phonetic corrections for destinations
- [ ] agent/src/models.py - Update if needed

---

## Pending - Assets

- [ ] Add /public/atlas-avatar.jpg
- [ ] Add /public/destination-expert-avatar.png
- [ ] Add /public/world-destinations.jpg (default background)

---

## Pending - Database

- [ ] Create topic_images table in Neon
- [ ] Seed 30-50 destination images with keywords
- [ ] Create destination_data table for comparisons

---

## Pending - Deployment

- [ ] Create Railway service
- [ ] Create Vercel project
- [ ] Configure Hume EVI for ATLAS persona
- [ ] Set environment variables
- [ ] Test end-to-end

---

## Next Steps

1. **You**: Add avatar images to /public (atlas-avatar.jpg, destination-expert-avatar.png, world-destinations.jpg)
2. **Me**: Update agent/src files for ATLAS persona
3. **Me**: Clean up remaining secondary pages
4. **You/Me**: Set up database tables
5. **You/Me**: Deploy to Railway + Vercel

---

## Quick Test Commands

```bash
# Install dependencies
cd /Users/dankeegan/relocation.quest-v2
npm install

# Run frontend
npm run dev

# Run agent (after setting up venv)
cd agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.agent:app --reload --port 8000
```
