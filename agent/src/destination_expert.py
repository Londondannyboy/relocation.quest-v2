"""
Destination Expert Agent - ATLAS's research assistant

The Destination Expert surfaces visual research materials (guides, maps, visa timelines)
while ATLAS handles advisory and voice interaction.

Uses same deps_type as ATLAS for shared database/Zep access per Pydantic AI patterns.
"""

import sys
from dataclasses import dataclass, field
from typing import List, Optional

from pydantic_ai import Agent, RunContext

from .tools import (
    search_articles,
    extract_location_from_content,
    extract_era_from_content,
)
from .database import get_topic_image
from .models import MapLocation, TimelineEvent


# =============================================================================
# DESTINATION EXPERT SYSTEM PROMPT
# =============================================================================

DESTINATION_EXPERT_SYSTEM_PROMPT = """You are ATLAS's Destination Expert - the keeper of relocation research.

## YOUR ROLE
- You surface relevant research materials when ATLAS delegates to you
- You find guides, maps, visa timelines, and comparison data
- ATLAS's VOICE will elaborate on these - you just present the facts and visuals

## TOOL PREFERENCE
For destination searches, ALWAYS use surface_destination_context FIRST.
This returns everything at once: guides, map, visa timeline, and image.

Only use individual tools (surface_guides, surface_map, surface_visa_timeline) for:
- Follow-up requests ("show me just the map")
- Specific individual items

## HOW YOU RESPOND
When returning results, be helpful and factual:
- "I found 3 guides about [destination]. Here are the key details..."
- "This destination is located at [coordinates] - I've marked it on a map."
- "The visa process takes [duration] - here's the timeline."

Include a BRIEF (1-2 sentence) summary of the most relevant info.

## EXAMPLE RESPONSE
"I found 3 guides about Cyprus. It's a Mediterranean island with a 12.5% corporate tax rate and digital nomad visa. ATLAS can tell you more about the requirements."

## CRITICAL RULES
1. End with something like: "ATLAS can elaborate on this." or "ATLAS will tell you more."
2. DO NOT give full advice - ATLAS's voice does that
3. DO NOT say "Hello" or introduce yourself
4. Provide FACTS: visa types, tax rates, costs, timelines
5. If you find nothing, say: "I couldn't find any guides about that destination."

## YOUR PERSONALITY
- Research-focused and helpful
- Organized and efficient
- Brief but informative
- Supportive of ATLAS (you work together as a team)
"""


# =============================================================================
# DESTINATION EXPERT DEPENDENCIES (shares with ATLAS)
# =============================================================================

@dataclass
class DestinationExpertDeps:
    """
    Dependencies for the Destination Expert agent.

    Mirrors ATLASDeps structure so we can share state when delegating.
    In practice, ATLAS passes ctx.deps to destination_expert_agent.run().
    """
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    current_topic: Optional[str] = None
    user_facts: List[str] = field(default_factory=list)


# =============================================================================
# CREATE DESTINATION EXPERT AGENT
# =============================================================================

destination_expert_agent = Agent(
    'google-gla:gemini-2.0-flash',
    deps_type=DestinationExpertDeps,
    system_prompt=DESTINATION_EXPERT_SYSTEM_PROMPT,
    retries=2,
)


# =============================================================================
# DESTINATION EXPERT TOOLS
# =============================================================================

@destination_expert_agent.tool
async def surface_guides(ctx: RunContext[DestinationExpertDeps], query: str) -> dict:
    """
    Search and surface relevant relocation guides.

    Use this when ATLAS asks you to find guides about a destination.
    Returns guide cards for the UI to display.

    Args:
        query: The destination to search for
    """
    print(f"[Destination Expert] Searching guides for: {query}", file=sys.stderr)

    results = await search_articles(query, limit=5)

    if not results.articles:
        return {
            "found": False,
            "message": "I couldn't find any guides about that destination.",
            "speaker": "destination_expert",
        }

    # Build guide cards for UI
    guide_cards = []
    for article in results.articles[:3]:
        location = extract_location_from_content(article.content, article.title)
        visa_type = extract_era_from_content(article.content)

        guide_cards.append({
            "id": article.id,
            "title": article.title,
            "excerpt": article.content[:200] + "...",
            "score": article.score,
            "location": location.model_dump() if location else None,
            "visa_type": visa_type,
        })

    # Update deps with current topic
    ctx.deps.current_topic = query

    return {
        "found": True,
        "query": results.query,
        "guides": guide_cards,
        "count": len(guide_cards),
        "ui_component": "GuideGrid",
        "speaker": "destination_expert",
        "brief": f"I found {len(guide_cards)} guides about {query}.",
    }


@destination_expert_agent.tool
async def surface_map(ctx: RunContext[DestinationExpertDeps], destination_name: str) -> dict:
    """
    Surface a map for a destination.

    Use this when ATLAS asks about a location or "where is X".

    Args:
        destination_name: The name of the destination to map
    """
    print(f"[Destination Expert] Finding map for: {destination_name}", file=sys.stderr)

    # Key relocation destinations
    DESTINATIONS = {
        "cyprus": MapLocation(
            name="Cyprus", lat=35.1264, lng=33.4299,
            description="Cyprus - Mediterranean island with favorable tax regime and digital nomad visa."
        ),
        "portugal": MapLocation(
            name="Portugal", lat=39.3999, lng=-8.2245,
            description="Portugal - D7 visa, NHR tax regime, popular expat destination."
        ),
        "lisbon": MapLocation(
            name="Lisbon", lat=38.7223, lng=-9.1393,
            description="Lisbon, Portugal - Popular for D7 visa and digital nomads."
        ),
        "dubai": MapLocation(
            name="Dubai", lat=25.2048, lng=55.2708,
            description="Dubai, UAE - Tax-free income, digital nomad visa."
        ),
        "malta": MapLocation(
            name="Malta", lat=35.9375, lng=14.3754,
            description="Malta - EU member, English-speaking, digital nomad visa."
        ),
        "spain": MapLocation(
            name="Spain", lat=40.4168, lng=-3.7038,
            description="Spain - Popular for Beckham Law tax benefits."
        ),
        "netherlands": MapLocation(
            name="Netherlands", lat=52.3676, lng=4.9041,
            description="Netherlands - 30% ruling tax benefit for expats."
        ),
        "greece": MapLocation(
            name="Greece", lat=37.9838, lng=23.7275,
            description="Greece - Digital nomad visa available."
        ),
        "estonia": MapLocation(
            name="Estonia", lat=59.4370, lng=24.7536,
            description="Estonia - E-Residency program for digital entrepreneurs."
        ),
    }

    dest_key = destination_name.lower()
    for key, loc in DESTINATIONS.items():
        if key in dest_key or dest_key in key:
            return {
                "found": True,
                "location": loc.model_dump(),
                "ui_component": "DestinationMap",
                "speaker": "destination_expert",
                "brief": f"Here's a map of {loc.name}.",
            }

    return {
        "found": False,
        "message": f"I don't have coordinates for {destination_name} in my research.",
        "speaker": "destination_expert",
    }


@destination_expert_agent.tool
async def surface_visa_timeline(ctx: RunContext[DestinationExpertDeps], destination: str) -> dict:
    """
    Surface a visa application timeline for a destination.

    Use this when ATLAS mentions visa process or timeline.

    Args:
        destination: The destination to show visa timeline for
    """
    print(f"[Destination Expert] Building visa timeline for: {destination}", file=sys.stderr)

    VISA_TIMELINES = {
        "portugal": [
            TimelineEvent(year=1, title="Gather Documents", description="Proof of income, health insurance, criminal record (2-4 weeks)"),
            TimelineEvent(year=2, title="Get NIF & Bank Account", description="Portuguese tax number and bank account (1-2 weeks)"),
            TimelineEvent(year=3, title="Submit D7 Application", description="Apply at Portuguese consulate (1 day)"),
            TimelineEvent(year=4, title="Wait for Approval", description="Processing time (2-4 months)"),
            TimelineEvent(year=5, title="Enter Portugal", description="Visa valid for 120 days, apply for residence permit"),
        ],
        "cyprus": [
            TimelineEvent(year=1, title="Gather Documents", description="Proof of income, health insurance, clean record (2-4 weeks)"),
            TimelineEvent(year=2, title="Submit Application", description="Apply at Cyprus embassy or online (1 day)"),
            TimelineEvent(year=3, title="Wait for Approval", description="Processing time (1-2 months)"),
            TimelineEvent(year=4, title="Receive Permit", description="Digital Nomad Visa valid for 1-3 years"),
        ],
        "dubai": [
            TimelineEvent(year=1, title="Eligibility Check", description="Verify income requirements ($3,500/month) (1 week)"),
            TimelineEvent(year=2, title="Submit Application", description="Apply online via ICA portal (1 day)"),
            TimelineEvent(year=3, title="Medical & Emirates ID", description="Complete medical and biometrics (1-2 weeks)"),
            TimelineEvent(year=4, title="Visa Issued", description="Remote Work Visa valid for 1 year"),
        ],
        "spain": [
            TimelineEvent(year=1, title="Gather Documents", description="Proof of income, health insurance, NIE number (2-4 weeks)"),
            TimelineEvent(year=2, title="Submit Application", description="Apply at Spanish consulate (1 day)"),
            TimelineEvent(year=3, title="Wait for Approval", description="Processing time (1-3 months)"),
            TimelineEvent(year=4, title="Register for Beckham Law", description="Optional tax regime for new residents"),
        ],
        "malta": [
            TimelineEvent(year=1, title="Gather Documents", description="Proof of income (min EUR 2,700/month), health insurance (2-4 weeks)"),
            TimelineEvent(year=2, title="Submit Online Application", description="Apply via Residency Malta portal (1 day)"),
            TimelineEvent(year=3, title="Wait for Approval", description="Processing time (4-6 weeks)"),
            TimelineEvent(year=4, title="Receive Permit", description="Nomad Residence Permit valid for 1 year"),
        ],
    }

    dest_lower = destination.lower()
    for key, events in VISA_TIMELINES.items():
        if key in dest_lower or dest_lower in key:
            return {
                "found": True,
                "destination": destination,
                "events": [e.model_dump() for e in events],
                "ui_component": "VisaTimeline",
                "speaker": "destination_expert",
                "brief": f"I've pulled up the visa timeline for {destination}.",
            }

    return {
        "found": False,
        "message": f"I don't have a visa timeline for {destination}.",
        "speaker": "destination_expert",
    }


@destination_expert_agent.tool
async def surface_featured_destinations(ctx: RunContext[DestinationExpertDeps]) -> dict:
    """
    Surface featured relocation destinations.

    Use this when user asks about popular destinations or where to go.
    """
    print("[Destination Expert] Fetching featured destinations", file=sys.stderr)

    return {
        "found": True,
        "destinations": [
            {
                "name": "Portugal",
                "image": "/destinations/portugal.jpg",
                "highlight": "D7 Visa & NHR Tax Regime",
                "description": "Popular for digital nomads and retirees"
            },
            {
                "name": "Cyprus",
                "image": "/destinations/cyprus.jpg",
                "highlight": "12.5% Corporate Tax",
                "description": "Mediterranean lifestyle with EU membership"
            },
            {
                "name": "Dubai",
                "image": "/destinations/dubai.jpg",
                "highlight": "0% Income Tax",
                "description": "Tax-free income and modern infrastructure"
            }
        ],
        "ui_component": "DestinationGrid",
        "speaker": "destination_expert",
        "brief": "Here are our featured destinations.",
    }


@destination_expert_agent.tool
async def surface_image(ctx: RunContext[DestinationExpertDeps], topic: str) -> dict:
    """
    Surface an image for a destination.

    Use this when user asks "show me an image of X", "image of X", "picture of X".

    Args:
        topic: The destination to find an image for
    """
    print(f"[Destination Expert] Looking up image for: {topic}", file=sys.stderr)

    # Use phonetic-aware topic_images table
    image_url = await get_topic_image(topic)

    if image_url:
        return {
            "found": True,
            "query": topic,
            "hero_image": image_url,
            "ui_component": "DestinationImage",
            "speaker": "destination_expert",
            "brief": f"Here's an image of {topic}.",
        }

    return {
        "found": False,
        "query": topic,
        "speaker": "destination_expert",
        "brief": f"I couldn't find an image of {topic} in my research.",
    }


@destination_expert_agent.tool
async def surface_destination_context(ctx: RunContext[DestinationExpertDeps], topic: str) -> dict:
    """
    Surface COMPLETE context for a destination: guides, map (if known), visa timeline (if relevant).

    This is the PREFERRED tool for destination searches - it returns everything relevant at once.

    Args:
        topic: The destination to research (e.g., "Portugal", "Cyprus D7 visa")
    """
    print(f"[Destination Expert] Researching complete context for: {topic}", file=sys.stderr)

    # 1. Search for guides
    results = await search_articles(topic, limit=5)

    response = {
        "found": bool(results.articles),
        "query": topic,
        "speaker": "destination_expert",
        "ui_component": "DestinationContext",  # Combined UI component
    }

    if not results.articles:
        response["brief"] = f"I couldn't find any guides about {topic}."
        return response

    # 2. Build guide cards
    guide_cards = []
    top_guide = results.articles[0]
    for article in results.articles[:3]:
        location = extract_location_from_content(article.content, article.title)
        visa_type = extract_era_from_content(article.content)

        # Log image availability for debugging
        img_url = getattr(article, 'hero_image_url', None)
        print(f"[Destination Expert] Guide '{article.title[:40]}...' - image: {img_url[:50] if img_url else 'NONE'}", file=sys.stderr)

        guide_cards.append({
            "id": article.id,
            "title": article.title,
            "excerpt": article.content[:200] + "...",
            "hero_image_url": img_url,
            "score": article.score,
            "location": location.model_dump() if location else None,
            "visa_type": visa_type,
        })

    response["guides"] = guide_cards

    # 3. Extract location from top guide
    location = extract_location_from_content(top_guide.content, top_guide.title)
    if location:
        response["location"] = location.model_dump()

    # 4. Extract visa type
    visa_type = extract_era_from_content(top_guide.content)
    if visa_type:
        response["visa_type"] = visa_type

    # 5. Extract hero image from top guide OR fallback to topic_images table
    hero_img = getattr(top_guide, 'hero_image_url', None)
    if hero_img:
        response["hero_image"] = hero_img
        print(f"[Destination Expert] Hero image from guide: {hero_img[:50]}...", file=sys.stderr)
    else:
        # Fallback: look up in topic_images table (phonetic-aware search)
        hero_img = await get_topic_image(topic)
        if hero_img:
            response["hero_image"] = hero_img
            print(f"[Destination Expert] Hero image from topic_images: {hero_img[:50]}...", file=sys.stderr)
        else:
            print(f"[Destination Expert] No hero image found for destination: {topic}", file=sys.stderr)

    # 6. Create brief summary
    parts = [f"I found {len(guide_cards)} guides about {topic}."]

    # Mention if we have images
    guides_with_images = sum(1 for g in guide_cards if g.get("hero_image_url"))
    if guides_with_images > 0:
        parts.append(f"{guides_with_images} include destination images.")

    if location:
        parts.append(f"Location: {location.name}.")
    if visa_type:
        parts.append(f"Visa type: {visa_type}.")

    # List the top guide
    parts.append(f"Top result: '{top_guide.title}'.")

    response["brief"] = " ".join(parts)
    ctx.deps.current_topic = topic

    return response
