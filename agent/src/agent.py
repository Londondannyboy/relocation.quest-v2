"""
ATLAS Agent - Relocation Quest Voice Assistant

Single Pydantic AI agent serving both:
- CopilotKit chat (AG-UI protocol)
- Hume EVI voice (OpenAI-compatible /chat/completions SSE)
"""

import os
import sys
import json
import uuid
from typing import Optional, AsyncGenerator, List
from dataclasses import dataclass, field

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse

from pydantic_ai import Agent, RunContext
from pydantic_ai.messages import ModelMessage

# Zep memory integration
try:
    from zep_cloud.client import AsyncZep
    ZEP_AVAILABLE = True
except ImportError:
    ZEP_AVAILABLE = False
    print("[ATLAS] Warning: zep-cloud not installed, memory features disabled", file=sys.stderr)

from .models import AppState, ATLASResponse, ArticleCardData, MapLocation, TimelineEvent, DestinationExpertDelegation
from .tools import (
    search_articles,
    normalize_query,
    get_article_card,
    extract_location_from_content,
    extract_era_from_content,
    PHONETIC_CORRECTIONS,
)
from .database import (
    get_user_preferred_name,
    get_all_destinations,
    get_destination_by_slug,
    compare_destinations,
    get_visa_info,
    get_cost_of_living,
    search_destinations as db_search_destinations,
)
from .destination_expert import destination_expert_agent, DestinationExpertDeps

# =============================================================================
# SESSION CONTEXT FOR NAME SPACING & GREETING MANAGEMENT
# =============================================================================

from collections import OrderedDict
import time
import random

# LRU cache for session contexts (max 100 sessions)
_session_contexts: OrderedDict = OrderedDict()
MAX_SESSIONS = 100
NAME_COOLDOWN_TURNS = 3  # Don't use name for 3 turns after using it

# Global user context cache - populated by middleware from CopilotKit instructions
_current_user_context: dict = {}

@dataclass
class SessionContext:
    """Track conversation state per session for name spacing and greeting.

    IMPORTANT: User context is fetched ONCE on first message and cached here.
    Follow-up messages skip Zep/DB lookups entirely for instant response.
    """
    turns_since_name_used: int = 0
    name_used_in_greeting: bool = False
    greeted_this_session: bool = False
    last_topic: str = ""
    last_interaction_time: float = field(default_factory=time.time)

    # CACHED USER CONTEXT (fetched once, used for all follow-ups)
    user_name: Optional[str] = None  # User's name (from session/DB/Zep)
    user_context: Optional[dict] = None  # Full Zep context (facts, interests)
    context_fetched: bool = False  # True after first lookup completes

    # PRE-FETCHED CONTENT (for instant "yes" responses)
    prefetched_topic: str = ""  # The topic we pre-fetched
    prefetched_content: str = ""  # Article content ready to use
    prefetched_titles: list = field(default_factory=list)

    # SUGGESTIONS (for "you might also like...")
    suggestions: list = field(default_factory=list)  # Related topics
    last_suggested_topic: str = ""  # What ATLAS suggested (for "yes" handling)


def get_session_context(session_id: str) -> SessionContext:
    """Get or create session context with LRU eviction."""
    global _session_contexts

    if session_id in _session_contexts:
        # Move to end (most recently used)
        _session_contexts.move_to_end(session_id)
        return _session_contexts[session_id]

    # Evict oldest if at capacity
    while len(_session_contexts) >= MAX_SESSIONS:
        _session_contexts.popitem(last=False)

    ctx = SessionContext()
    _session_contexts[session_id] = ctx
    return ctx


def should_use_name(session_id: str, is_greeting: bool = False) -> bool:
    """
    Rules for name usage to avoid over-repetition:
    - Always use name in greeting (first message)
    - After that, wait NAME_COOLDOWN_TURNS before using again
    - Never use name in consecutive turns
    """
    ctx = get_session_context(session_id)

    if is_greeting and not ctx.name_used_in_greeting:
        return True

    if ctx.turns_since_name_used >= NAME_COOLDOWN_TURNS:
        return True

    return False


def mark_name_used(session_id: str, in_greeting: bool = False):
    """Mark that we used the name, reset cooldown counter."""
    ctx = get_session_context(session_id)
    ctx.turns_since_name_used = 0
    if in_greeting:
        ctx.name_used_in_greeting = True
        ctx.greeted_this_session = True


def increment_turn(session_id: str):
    """Increment turn counter for name spacing."""
    ctx = get_session_context(session_id)
    ctx.turns_since_name_used += 1
    ctx.last_interaction_time = time.time()


# =============================================================================
# SESSION CONTEXT CACHING (CRITICAL FOR FAST FOLLOW-UPS)
# =============================================================================

def get_cached_user_context(session_id: str) -> tuple[Optional[str], Optional[dict], bool]:
    """
    Get cached user context from session.

    Returns:
        (user_name, user_context, was_cached)
        - If was_cached=True, skip Zep/DB lookups entirely
        - If was_cached=False, caller should fetch and cache
    """
    ctx = get_session_context(session_id)
    if ctx.context_fetched:
        return ctx.user_name, ctx.user_context, True
    return None, None, False


def cache_user_context(session_id: str, user_name: Optional[str], user_context: Optional[dict]):
    """
    Cache user context after first lookup.
    All subsequent messages in this session will skip Zep/DB calls.
    """
    ctx = get_session_context(session_id)
    ctx.user_name = user_name
    ctx.user_context = user_context
    ctx.context_fetched = True
    print(f"[SessionCache] Cached context for session: name={user_name}, facts={len(user_context.get('facts', [])) if user_context else 0}", file=sys.stderr)


def prefetch_topic_content(session_id: str, topic: str, content: str, titles: list):
    """
    Pre-fetch content for a suggested topic.
    When user says "yes", we can respond instantly without searching.
    """
    ctx = get_session_context(session_id)
    ctx.prefetched_topic = topic
    ctx.prefetched_content = content
    ctx.prefetched_titles = titles
    print(f"[SessionCache] Pre-fetched content for '{topic}' ({len(content)} chars)", file=sys.stderr)


def get_prefetched_content(session_id: str, query: str) -> tuple[Optional[str], Optional[list]]:
    """
    Check if we have pre-fetched content matching the query.
    Returns (content, titles) or (None, None) if no match.
    """
    ctx = get_session_context(session_id)
    if ctx.prefetched_topic and query.lower() in ctx.prefetched_topic.lower():
        return ctx.prefetched_content, ctx.prefetched_titles
    return None, None


def set_last_suggestion(session_id: str, topic: str):
    """Store the topic ATLAS just suggested (for handling 'yes' responses)."""
    ctx = get_session_context(session_id)
    ctx.last_suggested_topic = topic
    ctx.suggestions.append(topic)


def get_last_suggestion(session_id: str) -> Optional[str]:
    """Get the last topic ATLAS suggested."""
    ctx = get_session_context(session_id)
    return ctx.last_suggested_topic if ctx.last_suggested_topic else None


# =============================================================================
# PERSONALIZED GREETING GENERATION
# =============================================================================

def generate_returning_user_greeting(
    user_name: Optional[str],
    recent_topics: List[str],
    user_facts: List[str],
) -> str:
    """
    Generate a personalized greeting for returning users.
    Uses variations to avoid repetition.
    """
    name = user_name or ""
    name_part = f", {name}" if name else ""

    # If we have a recent topic, reference it
    if recent_topics:
        topic = recent_topics[0]
        greetings_with_topic = [
            f"Welcome back{name_part}. Last time we were exploring {topic}. Shall we pick up where we left off, or discover somewhere new?",
            f"Ah{name_part}, lovely to hear from you again. I remember we discussed {topic}. Would you like to continue with that, or explore another destination?",
            f"Hello again{name_part}. We were chatting about {topic} before. Shall we dive deeper into that?",
        ]
        return random.choice(greetings_with_topic)

    # Known user without recent topic
    if name:
        greetings_with_name = [
            f"Welcome back, {name}. Which destination shall we explore today?",
            f"Ah, {name}, good to hear from you again. What would you like to discover?",
            f"Hello again, {name}. I've got guides on 50+ destinations. What catches your fancy?",
        ]
        return random.choice(greetings_with_name)

    # Returning user without name
    greetings_generic = [
        "Welcome back. Which destination shall we explore today?",
        "Ah, good to hear from you again. Where are you thinking of relocating?",
        "Hello again. What would you like to discover about moving abroad?",
    ]
    return random.choice(greetings_generic)


def generate_new_user_greeting() -> str:
    """Generate greeting for first-time users."""
    greetings = [
        "I'm ATLAS, your AI guide to relocating abroad. I can help with visa requirements, cost of living, and finding your perfect destination. What should I call you, and where are you thinking of moving?",
        "Hello, I'm ATLAS. I help people navigate international relocation - from digital nomad visas to cost of living comparisons. What's your name, and where are you interested in?",
        "Welcome to Relocation Quest. I'm ATLAS, your guide to moving abroad. Whether it's Portugal, Cyprus, or Dubai, I can help you find your ideal destination. What would you like to explore?",
    ]
    return random.choice(greetings)


# =============================================================================
# ZEP MEMORY CLIENT
# =============================================================================

_zep_client: Optional["AsyncZep"] = None

def get_zep_client() -> Optional["AsyncZep"]:
    """Get or create Zep client singleton."""
    global _zep_client
    if _zep_client is None and ZEP_AVAILABLE:
        api_key = os.environ.get("ZEP_API_KEY")
        if api_key:
            _zep_client = AsyncZep(api_key=api_key)
            print("[ATLAS] Zep memory client initialized", file=sys.stderr)
        else:
            print("[ATLAS] ZEP_API_KEY not set, memory disabled", file=sys.stderr)
    return _zep_client


def get_zep_user_id(user_id: str) -> str:
    """Prefix user_id with project name to separate from other projects."""
    return f"relocation_{user_id}"


async def get_user_memory(user_id: str) -> dict:
    """Retrieve user's conversation history and interests from Zep."""
    client = get_zep_client()
    if not client:
        return {"found": False, "is_returning": False, "facts": []}

    zep_user_id = get_zep_user_id(user_id)
    try:
        results = await client.graph.search(
            user_id=zep_user_id,
            query="user name interests preferences topics discussed destinations relocation",
            limit=20,
            scope="edges",
        )

        facts = []
        if results and hasattr(results, 'edges') and results.edges:
            facts = [edge.fact for edge in results.edges if hasattr(edge, 'fact') and edge.fact]

        return {
            "found": True,
            "is_returning": len(facts) > 0,
            "facts": facts[:10],  # Limit to 10 most relevant
            "user_name": extract_user_name_from_facts(facts),
        }
    except Exception as e:
        print(f"[ATLAS] Zep search error: {e}", file=sys.stderr)
        return {"found": False, "is_returning": False, "facts": []}


async def store_to_memory(user_id: str, message: str, role: str = "user") -> bool:
    """Store conversation message to Zep for future context."""
    client = get_zep_client()
    if not client:
        return False

    zep_user_id = get_zep_user_id(user_id)
    try:
        # Ensure user exists
        try:
            await client.user.get(zep_user_id)
        except Exception:
            await client.user.add(user_id=zep_user_id)

        # Add message to graph
        await client.graph.add(
            user_id=zep_user_id,
            type="message",
            data=f"{role}: {message}",
        )
        return True
    except Exception as e:
        print(f"[ATLAS] Zep store error: {e}", file=sys.stderr)
        return False


def extract_user_name_from_facts(facts: List[str]) -> Optional[str]:
    """Extract user's name from Zep facts."""
    import re
    for fact in facts:
        lower = fact.lower()
        patterns = [
            r"name is (\w+)",
            r"called (\w+)",
            r"user (\w+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, lower)
            if match:
                name = match.group(1)
                return name.capitalize()
    return None


# =============================================================================
# ATLAS SYSTEM PROMPT
# =============================================================================

ATLAS_SYSTEM_PROMPT = """You are ATLAS, an expert relocation advisor helping people move abroad.

## ACCURACY (NON-NEGOTIABLE)
- ONLY talk about what's IN the source material provided
- NEVER use your training knowledge - ONLY the source material below
- If source material doesn't match the question: "I don't have detailed guides on that destination yet"

## ANSWER THE QUESTION
- READ what they asked and ANSWER IT DIRECTLY
- Stay STRICTLY focused on their actual question
- NEVER randomly mention other destinations not asked about

## FORBIDDEN WORDS & PHRASES
NEVER use these words - they break immersion:
- "section", "page", "chapter", "segment", "part 1/2/3", "reading"
- "you mentioned" (the USER didn't mention it - the SOURCE did)
- "as we discussed" (unless user actually discussed it)
Instead of "In this section..." just say "Now..." or continue naturally.

## PERSONA
- Speak as ATLAS, first person: "I recommend...", "From my research..."
- Warm, knowledgeable, data-driven but aspirational
- Go into DEPTH - share visa requirements, cost of living, quality of life (150-250 words)
- Stay focused on the current destination - explore it thoroughly before moving on
- NEVER say "Hello", "Hi", "I'm ATLAS", or ask "What should I call you?" - just answer the question

## RESPONSE VARIETY
Vary your opening phrases. Don't always start the same way. Options:
- "Ah, [destination]..." / "Now, [destination]..." / "Well, [destination] is fascinating..."
- "Let me tell you about..." / "I've got great insights on..."
- "Based on my research..." / "[Destination] is a popular choice because..."

## YOUR NAME
You are ATLAS. When someone says "Hey ATLAS", they're addressing YOU.

## PHONETIC CORRECTIONS (voice transcription errors)
These are automatically corrected BEFORE you receive the query:
- "sigh prus/sigh pruss" -> Cyprus
- "port of gal/porta gal" -> Portugal
- "dew by/do by" -> Dubai
- "ma tah/molta" -> Malta

## IDENTITY (CRITICAL - NEVER BREAK CHARACTER)
- You ARE ATLAS, the Relocation Quest advisor with detailed guides on 17 destinations
- You are NOT a "language model", "AI", or "assistant"
- If asked "who are you" or "what are you": "I'm ATLAS, your relocation advisor at Relocation Quest"
- If asked personal questions you don't know: "I'd rather focus on helping you relocate - ask me about Portugal, Bali, or the UK!"
- NEVER say "As a language model" or "I don't have access to that information"

## DESTINATIONS I COVER (17 total)
Europe: Portugal, Spain, Cyprus, UK, France, Germany, Netherlands, Malta, Greece, Italy
Asia-Pacific: Thailand, Indonesia/Bali, Australia, New Zealand
Middle East: Dubai (UAE)
Americas: Canada, Mexico

## USER NAME QUESTIONS (USE THE TOOL!)
- If user asks "what is my name", "do you know my name", or "who am I":
  ALWAYS use the get_current_user_name tool to look up their name!
- If the tool returns a name, respond warmly: "You're [name], of course!"
- If the tool returns no name, ask: "I don't believe you've told me your name yet. What should I call you?"

## RESPONSE DEPTH
- Go into DEPTH on the destination. Share visa info, costs, quality of life, and practical details.
- Don't rush to move on - explore the current destination thoroughly first (150-250 words).
- Be substantive like an expert sharing their knowledge, not superficial.

## MANDATORY FOLLOW-UP QUESTION
After exploring the destination in depth, end with a natural follow-up question:
- Ask about related aspects: visa, cost of living, job market, healthcare
- Or suggest comparing: "Would you like me to compare this with another destination?"
- The follow-up should be CONNECTED to what you just discussed
- NEVER end without a question - this keeps the conversation flowing"""




# =============================================================================
# AGENT STATE FOR COPILOTKIT (StateDeps pattern)
# =============================================================================

from pydantic import BaseModel

class UserInfo(BaseModel):
    """User info synced from frontend via useCoAgent."""
    id: str
    name: str
    email: str = ""


class ATLASAgentState(BaseModel):
    """State shared between frontend and agent via CopilotKit useCoAgent."""
    user: Optional[UserInfo] = None


# Import StateDeps for AG-UI integration
try:
    from pydantic_ai.ag_ui import StateDeps
    STATEDEPS_AVAILABLE = True
except ImportError:
    STATEDEPS_AVAILABLE = False


# =============================================================================
# AGENT DEPENDENCIES
# =============================================================================

@dataclass
class ATLASDeps:
    """Dependencies injected into the agent."""
    state: AppState
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    is_returning_user: bool = False
    user_facts: List[str] = field(default_factory=list)


def build_system_prompt(user_context: Optional[dict] = None) -> str:
    """Build system prompt with optional returning user context."""
    base_prompt = ATLAS_SYSTEM_PROMPT

    if user_context and user_context.get("is_returning"):
        facts = user_context.get("facts", [])
        user_name = user_context.get("user_name")

        returning_context = """

## RETURNING USER CONTEXT
This user has spoken to you before. What you remember about them:
"""
        for fact in facts[:10]:
            returning_context += f"- {fact}\n"

        returning_context += """
GREETING RULES FOR RETURNING USER:
- DO NOT say "Hello" or give a full introduction
- Instead: "Ah, welcome back! """
        if user_name:
            returning_context += f"Good to see you again, {user_name}. "
        returning_context += """Last time we discussed [topic from facts]. Shall we continue, or explore something new?"
- Reference their past interests naturally
- Make them feel recognized and valued
"""
        base_prompt += returning_context

    return base_prompt


# =============================================================================
# CREATE PYDANTIC AI AGENT
# =============================================================================

agent = Agent(
    'google-gla:gemini-2.0-flash',
    deps_type=ATLASDeps,
    system_prompt=ATLAS_SYSTEM_PROMPT,
    retries=2,
)


# =============================================================================
# AGENT TOOLS - Return UI components via Generative UI
# =============================================================================

@agent.tool
async def search_destinations(ctx: RunContext[ATLASDeps], query: str) -> dict:
    """
    Search relocation guides for information about a destination.

    Use this when the user asks about any relocation destination or topic.
    Returns guide content and renders cards in the UI.

    Args:
        query: The destination or question to search for
    """
    results = await search_articles(query, limit=5)

    if not results.articles:
        return {
            "found": False,
            "message": "I don't have any articles about that topic in my collection."
        }

    # Build context for the LLM
    context_parts = []
    article_cards = []

    for article in results.articles[:3]:
        context_parts.append(f"## {article.title}\n{article.content[:2000]}")

        # Extract location and era for rich UI
        location = extract_location_from_content(article.content, article.title)
        era = extract_era_from_content(article.content)

        article_cards.append({
            "id": article.id,
            "title": article.title,
            "excerpt": article.content[:200] + "...",
            "score": article.score,
            "location": location.model_dump() if location else None,
            "era": era,
        })

    # Update state
    ctx.deps.state.current_topic = query
    ctx.deps.state.last_articles = [
        ArticleCardData(
            id=a["id"],
            title=a["title"],
            excerpt=a["excerpt"],
            slug=a["id"],  # Using ID as slug for now
            score=a["score"],
        )
        for a in article_cards
    ]

    return {
        "found": True,
        "query": results.query,
        "source_content": "\n\n".join(context_parts),
        "articles": article_cards,
        "ui_component": "ArticleGrid",  # Tells frontend to render ArticleGrid
    }


@agent.tool
async def show_guide_card(ctx: RunContext[ATLASDeps], guide_id: str) -> dict:
    """
    Show a detailed guide card for a specific guide.

    Use this when the user wants more details about a specific guide.

    Args:
        guide_id: The ID of the guide to display
    """
    card = await get_article_card(guide_id)

    if not card:
        return {"found": False, "message": "Guide not found"}

    return {
        "found": True,
        "card": card.model_dump(),
        "ui_component": "GuideCard",
    }


@agent.tool
async def show_map(ctx: RunContext[ATLASDeps], location_name: str) -> dict:
    """
    Show an interactive map for a destination.

    Use this when the user asks "where is X" or wants to see a location on a map.

    Args:
        location_name: The name of the destination to show
    """
    # Key relocation destinations
    LOCATIONS = {
        "cyprus": MapLocation(name="Cyprus", lat=35.1264, lng=33.4299,
                               description="Cyprus - Mediterranean island with favorable tax regime and digital nomad visa."),
        "lisbon": MapLocation(name="Lisbon", lat=38.7223, lng=-9.1393,
                               description="Lisbon, Portugal - Popular for D7 visa and digital nomads."),
        "portugal": MapLocation(name="Portugal", lat=39.3999, lng=-8.2245,
                                 description="Portugal - D7 visa, NHR tax regime, popular expat destination."),
        "dubai": MapLocation(name="Dubai", lat=25.2048, lng=55.2708,
                              description="Dubai, UAE - Tax-free income, digital nomad visa."),
        "malta": MapLocation(name="Malta", lat=35.9375, lng=14.3754,
                              description="Malta - EU member, English-speaking, digital nomad visa."),
        "spain": MapLocation(name="Spain", lat=40.4168, lng=-3.7038,
                              description="Spain - Popular for Beckham Law tax benefits."),
        "netherlands": MapLocation(name="Netherlands", lat=52.3676, lng=4.9041,
                                    description="Netherlands - 30% ruling tax benefit for expats."),
    }

    location_key = location_name.lower()
    for key, loc in LOCATIONS.items():
        if key in location_key or location_key in key:
            return {
                "found": True,
                "location": loc.model_dump(),
                "ui_component": "DestinationMap",
            }

    return {
        "found": False,
        "message": f"I don't have coordinates for {location_name}",
    }


@agent.tool
async def get_about_atlas(ctx: RunContext[ATLASDeps], question: str) -> dict:
    """
    Answer questions about ATLAS, the relocation advisor.

    Use this when the user asks:
    - "who are you" / "what are you"
    - "tell me about yourself"
    - Any personal question about ATLAS

    Args:
        question: The question about ATLAS
    """
    return {
        "found": True,
        "about": {
            "name": "ATLAS",
            "role": "AI Relocation Advisor",
            "expertise": [
                "Digital nomad visas",
                "Cost of living comparisons",
                "Tax optimization for expats",
                "Quality of life factors"
            ],
            "destinations": 50,
            "website": "relocation.quest",
            "specialty": "Helping people relocate abroad - visas, costs, lifestyle"
        },
        "response_hint": "Respond in first person as ATLAS. Be warm and knowledgeable."
    }


@agent.tool
async def show_featured_destinations(ctx: RunContext[ATLASDeps]) -> dict:
    """
    Show featured relocation destinations from the database.

    Use this when the user asks:
    - "what destinations do you cover"
    - "show me popular destinations"
    - "where can I relocate to"
    """
    destinations = await get_all_destinations()

    if not destinations:
        return {
            "found": False,
            "message": "I couldn't load the destination list at the moment.",
        }

    # Format for display
    formatted = []
    for dest in destinations[:12]:  # Show top 12
        formatted.append({
            "name": dest["country_name"],
            "flag": dest["flag"],
            "region": dest["region"],
            "highlight": dest.get("hero_subtitle", "")[:60],
            "featured": dest.get("featured", False),
            "slug": dest["slug"],
        })

    featured_count = len([d for d in formatted if d["featured"]])
    total = len(destinations)

    return {
        "found": True,
        "total_destinations": total,
        "destinations": formatted,
        "ui_component": "DestinationGrid",
        "response_hint": f"We cover {total} destinations. {featured_count} are featured. Offer to explore any in detail."
    }


@agent.tool
async def show_visa_timeline(ctx: RunContext[ATLASDeps], destination: str) -> dict:
    """
    Show visa options and requirements for a destination.

    Use this when the user asks about visa process, requirements, or timeline.

    Args:
        destination: The destination to show visa info for
    """
    visa_info = await get_visa_info(destination)

    if not visa_info or not visa_info.get("visas"):
        return {
            "found": False,
            "message": f"I don't have detailed visa information for {destination} yet.",
        }

    # Format visa data as timeline events
    events = []
    for i, visa in enumerate(visa_info["visas"][:5], 1):
        events.append({
            "year": i,
            "title": visa.get("name", "Visa Option"),
            "description": f"{visa.get('description', '')} | Cost: {visa.get('cost', 'varies')} | Processing: {visa.get('processingTime', 'varies')}",
            "requirements": visa.get("requirements", []),
            "isWorkPermit": visa.get("isWorkPermit", False),
            "isResidencyPath": visa.get("isResidencyPath", False),
        })

    return {
        "found": True,
        "destination": visa_info["country"],
        "flag": visa_info["flag"],
        "events": events,
        "hero_image_url": visa_info.get("hero_image_url"),
        "ui_component": "VisaTimeline",
        "response_hint": f"Found {len(events)} visa options for {visa_info['country']}. Explain the key differences."
    }


@agent.tool
async def compare_two_destinations(ctx: RunContext[ATLASDeps], destination1: str, destination2: str) -> dict:
    """
    Compare two destinations side by side.

    Use this when the user asks to compare destinations, e.g.:
    - "Compare Portugal and Spain"
    - "What's the difference between Cyprus and Malta"
    - "Portugal vs Dubai"

    Args:
        destination1: First destination to compare
        destination2: Second destination to compare
    """
    comparison = await compare_destinations(destination1.lower(), destination2.lower())

    if not comparison:
        return {
            "found": False,
            "message": f"I couldn't compare {destination1} and {destination2}. Make sure both are valid destinations.",
        }

    return {
        "found": True,
        "comparison": comparison,
        "ui_component": "DestinationComparison",
        "response_hint": "Compare visa options, cost of living, and job markets. Highlight key differences."
    }


@agent.tool
async def show_cost_of_living(ctx: RunContext[ATLASDeps], destination: str) -> dict:
    """
    Show cost of living breakdown for a destination.

    Use this when the user asks about:
    - "How much does it cost to live in X"
    - "Cost of living in X"
    - "How expensive is X"

    Args:
        destination: The destination to show costs for
    """
    cost_info = await get_cost_of_living(destination)

    if not cost_info or not cost_info.get("cities"):
        return {
            "found": False,
            "message": f"I don't have detailed cost information for {destination} yet.",
        }

    return {
        "found": True,
        "country": cost_info["country"],
        "flag": cost_info["flag"],
        "cities": cost_info["cities"],
        "job_market": cost_info.get("job_market", {}),
        "ui_component": "CostOfLiving",
        "response_hint": f"Explain costs for {len(cost_info['cities'])} cities. Mention rent, utilities, and overall budget."
    }


@agent.tool
async def get_destination_details(ctx: RunContext[ATLASDeps], destination: str) -> dict:
    """
    Get comprehensive details about a destination.

    Use this when the user wants full information about a destination including:
    - Quick facts (currency, language, timezone)
    - Highlights
    - Visa options
    - Cost of living
    - Job market
    - FAQs

    Args:
        destination: The destination to get details for
    """
    dest = await get_destination_by_slug(destination.lower())

    if not dest:
        # Try searching
        results = await db_search_destinations(destination)
        if results:
            dest = await get_destination_by_slug(results[0]["slug"])

    if not dest:
        return {
            "found": False,
            "message": f"I don't have a detailed guide for {destination} yet.",
        }

    return {
        "found": True,
        "destination": {
            "name": dest["country_name"],
            "flag": dest["flag"],
            "region": dest["region"],
            "language": dest.get("language", ""),
            "hero_title": dest.get("hero_title", ""),
            "hero_subtitle": dest.get("hero_subtitle", ""),
            "hero_image_url": dest.get("hero_image_url"),
        },
        "quick_facts": dest.get("quick_facts", []),
        "highlights": dest.get("highlights", []),
        "visas": dest.get("visas", []),
        "cost_of_living": dest.get("cost_of_living", []),
        "job_market": dest.get("job_market", {}),
        "faqs": dest.get("faqs", []),
        "ui_component": "DestinationContext",
        "response_hint": "Provide a comprehensive overview touching on visas, costs, lifestyle, and job market."
    }


@agent.tool
async def get_current_user_name(ctx: RunContext[ATLASDeps]) -> dict:
    """
    Get the current user's name from the database.

    Use this when the user asks:
    - "what is my name"
    - "do you know my name"
    - "who am I"

    Returns the user's name if known, or indicates they haven't shared it.
    """
    # First check global cache from middleware (CopilotKit instructions)
    global _current_user_context
    if _current_user_context.get("user_name"):
        name = _current_user_context["user_name"]
        print(f"[ATLAS Tool] Found user name in cache: {name}", file=sys.stderr)
        return {
            "found": True,
            "name": name,
            "response_hint": f"The user's name is {name}. Respond warmly."
        }

    # Second, check if name is in deps
    if ctx.deps.user_name:
        return {
            "found": True,
            "name": ctx.deps.user_name,
            "response_hint": f"The user's name is {ctx.deps.user_name}. Respond warmly."
        }

    # Try to look up from database if we have user_id
    user_id = _current_user_context.get("user_id") or ctx.deps.user_id
    if user_id:
        name = await get_user_preferred_name(user_id)
        if name:
            print(f"[ATLAS Tool] Found user name in DB: {name}", file=sys.stderr)
            return {
                "found": True,
                "name": name,
                "response_hint": f"The user's name is {name}. Respond warmly."
            }

    return {
        "found": False,
        "name": None,
        "response_hint": "You don't know the user's name yet. Ask them what you should call them."
    }


@agent.tool
async def delegate_to_destination_expert(ctx: RunContext[ATLASDeps], request: str) -> dict:
    """
    Delegate to the Destination Expert for research materials.

    Use this when you need to surface guides, maps, comparisons, or visa info.
    The Destination Expert will find the materials and return UI components to display.

    WHEN TO DELEGATE:
    - User asks "show me" or "where is" something
    - User mentions a specific destination to explore
    - You need to find guides to support your advice
    - User wants visa timelines or cost comparisons

    AFTER DELEGATION:
    - For major searches, acknowledge: "Let me check my research..." BEFORE delegating
    - For follow-up queries, delegate silently
    - Weave the expert's findings into your advice

    Args:
        request: What to ask the Destination Expert (e.g., "guides about Portugal D7 visa")
    """
    print(f"[ATLAS] Delegating to Destination Expert: {request}", file=sys.stderr)

    # Create DestinationExpertDeps from ATLAS's context
    expert_deps = DestinationExpertDeps(
        user_id=ctx.deps.user_id,
        user_name=ctx.deps.user_name,
        current_topic=ctx.deps.state.current_topic if hasattr(ctx.deps, 'state') else None,
        user_facts=ctx.deps.user_facts if hasattr(ctx.deps, 'user_facts') else [],
    )

    try:
        # Run the Destination Expert agent
        result = await destination_expert_agent.run(request, deps=expert_deps)

        # Extract the response
        response_text = result.output if hasattr(result, 'output') else str(result.data)

        # Get UI data from the last tool result if available
        ui_data = None
        ui_component = None

        # Check if there's structured data in the result
        if hasattr(result, 'data') and isinstance(result.data, dict):
            ui_data = result.data
            ui_component = result.data.get('ui_component')
        elif hasattr(result, 'all_messages'):
            # Try to find tool results in messages
            for msg in reversed(result.all_messages()):
                if hasattr(msg, 'parts'):
                    for part in msg.parts:
                        if hasattr(part, 'content') and isinstance(part.content, dict):
                            if 'ui_component' in part.content:
                                ui_data = part.content
                                ui_component = part.content.get('ui_component')
                                break

        print(f"[ATLAS] Destination Expert returned: {response_text[:100]}...", file=sys.stderr)

        return {
            "speaker": "destination_expert",
            "content": response_text,
            "ui_component": ui_component,
            "ui_data": ui_data,
            "found": ui_data.get('found', True) if ui_data else True,
        }

    except Exception as e:
        print(f"[ATLAS] Destination Expert delegation error: {e}", file=sys.stderr)
        return {
            "speaker": "destination_expert",
            "content": "I couldn't reach my research assistant at the moment. Let me tell you what I know...",
            "found": False,
        }


# =============================================================================
# FASTAPI APPLICATION
# =============================================================================

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("atlas")
logger.setLevel(logging.INFO)

app = FastAPI(title="ATLAS - Relocation Quest Agent")
logger.info("DEPLOY VERSION: 2026-01-07-relocation-quest")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# CLM ENDPOINT FOR HUME EVI (OpenAI-compatible SSE) - ATLAS
# =============================================================================

async def stream_sse_response(content: str, msg_id: str) -> AsyncGenerator[str, None]:
    """Stream OpenAI-compatible SSE chunks for Hume EVI."""
    words = content.split(' ')
    for i, word in enumerate(words):
        chunk = {
            "id": msg_id,
            "object": "chat.completion.chunk",
            "choices": [{
                "index": 0,
                "delta": {"content": word + (' ' if i < len(words) - 1 else '')},
                "finish_reason": None
            }]
        }
        yield f"data: {json.dumps(chunk)}\n\n"

    # Final chunk with finish_reason
    yield f"data: {json.dumps({'choices': [{'delta': {}, 'finish_reason': 'stop'}]})}\n\n"
    yield "data: [DONE]\n\n"


# Debug endpoint
@app.get("/debug/greeting-check")
async def debug_greeting():
    """Debug endpoint to check greeting detection."""
    from .tools import normalize_query
    test_queries = ["hello", "hi", "hey", "speak your greeting", "howdy", "Hello"]
    results = {}
    for q in test_queries:
        normalized = normalize_query(q)
        normalized_lower = normalized.lower().strip()
        is_greeting = (
            "speak your greeting" in q.lower() or
            normalized_lower in ["hello", "hi", "hey", "hiya", "howdy", "greetings", "start"] or
            normalized_lower.startswith("hello ") or
            normalized_lower.startswith("hi ")
        )
        results[q] = {
            "normalized": normalized,
            "normalized_lower": normalized_lower,
            "is_greeting": is_greeting
        }
    return results


def extract_session_id(request: Request, body: dict) -> Optional[str]:
    """
    Extract custom_session_id from request.
    Checks: query params, headers, body.custom_session_id, body.metadata.custom_session_id
    Also checks Hume-specific headers.
    """
    # 1. Query params
    session_id = request.query_params.get("custom_session_id")
    if session_id:
        print(f"[ATLAS CLM] Session ID from query params: {session_id}", file=sys.stderr)
        return session_id

    # 2. Headers (including Hume-specific)
    for header_name in ["x-custom-session-id", "x-session-id", "custom-session-id",
                        "x-hume-session-id", "x-hume-custom-session-id"]:
        session_id = request.headers.get(header_name)
        if session_id:
            print(f"[ATLAS CLM] Session ID from header {header_name}: {session_id}", file=sys.stderr)
            return session_id

    # 3. Body direct
    session_id = body.get("custom_session_id") or body.get("session_id") or body.get("customSessionId")
    if session_id:
        print(f"[ATLAS CLM] Session ID from body: {session_id}", file=sys.stderr)
        return session_id

    # 4. Body metadata
    metadata = body.get("metadata", {})
    if metadata:
        session_id = metadata.get("custom_session_id") or metadata.get("session_id") or metadata.get("customSessionId")
        if session_id:
            print(f"[ATLAS CLM] Session ID from body.metadata: {session_id}", file=sys.stderr)
            return session_id

    # 5. Check session_settings (Hume may forward this)
    session_settings = body.get("session_settings", {})
    if session_settings:
        session_id = session_settings.get("customSessionId") or session_settings.get("custom_session_id")
        if session_id:
            print(f"[ATLAS CLM] Session ID from body.session_settings: {session_id}", file=sys.stderr)
            return session_id

    return None


def extract_user_name_from_session(session_id: Optional[str]) -> Optional[str]:
    """Extract user name from session ID. Format: 'name|userId' (name first)"""
    if not session_id:
        return None
    if '|' in session_id:
        name = session_id.split('|')[0]
        if name and len(name) > 1 and name.lower() != 'anon':
            return name
    return None


def extract_user_name_from_messages(messages: list) -> Optional[str]:
    """
    Extract user name from system message.
    Handles multiple formats:
    - "name: Dan" (from frontend)
    - "USER'S NAME: Dan" (legacy format)
    - "Hello Dan" / "Welcome back Dan" (greeting patterns)
    """
    import re

    for msg in messages:
        if msg.get("role") == "system":
            content = msg.get("content", "")
            if isinstance(content, str):
                # Format 1: "name: Dan" (primary format from frontend)
                match = re.search(r'\bname:\s*(\w+)', content, re.IGNORECASE)
                if match:
                    name = match.group(1)
                    if name and name.lower() != 'unknown':
                        print(f"[ATLAS CLM] Found user name in system message (name:): {name}", file=sys.stderr)
                        return name

                # Format 2: "USER'S NAME: Dan" (legacy format)
                match = re.search(r"USER'S NAME:\s*(\w+)", content, re.IGNORECASE)
                if match:
                    name = match.group(1)
                    print(f"[ATLAS CLM] Found user name in system message (USER'S NAME:): {name}", file=sys.stderr)
                    return name

                # Format 3: "Hello Dan" or "Welcome back Dan" patterns
                match = re.search(r"(?:Hello|Welcome back),?\s+(\w+)", content)
                if match:
                    name = match.group(1)
                    print(f"[ATLAS CLM] Found user name in greeting pattern: {name}", file=sys.stderr)
                    return name

    print(f"[ATLAS CLM] No user name found in messages", file=sys.stderr)
    return None


@app.post("/chat/completions")
async def clm_endpoint(request: Request):
    """
    OpenAI-compatible CLM endpoint for Hume EVI.

    Hume sends messages here and expects SSE streaming responses.
    Now with Zep memory integration for returning user recognition.
    """
    logger.info("CLM endpoint called!")
    global _last_request_debug

    body = await request.json()
    messages = body.get("messages", [])

    # Store for debugging
    import time
    _last_request_debug = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "messages_count": len(messages),
        "body_keys": list(body.keys()),
        "query_params": dict(request.query_params),
        "headers": {k: v for k, v in request.headers.items() if k.lower() in [
            "x-custom-session-id", "x-session-id", "custom-session-id",
            "authorization", "content-type", "x-hume-session-id", "x-hume-custom-session-id"
        ]},
        "session_settings": body.get("session_settings", {}),
        "metadata": body.get("metadata", {}),
        "custom_session_id": body.get("custom_session_id") or body.get("customSessionId"),
        "messages": [
            {
                "role": m.get("role"),
                "content_preview": str(m.get("content", ""))[:500]
            }
            for m in messages
        ],
    }

    # Extract user message
    user_msg = next(
        (m["content"] for m in reversed(messages) if m["role"] == "user"),
        ""
    )

    # Extract session ID
    session_id = extract_session_id(request, body)
    print(f"[ATLAS CLM] Session ID: {session_id}", file=sys.stderr)

    # Extract user name from session (format: "name|userId")
    user_name = extract_user_name_from_session(session_id)

    # Fallback: extract from system message (Hume forwards systemPrompt as system message)
    if not user_name:
        user_name = extract_user_name_from_messages(messages)

    print(f"[ATLAS CLM] User name: {user_name}", file=sys.stderr)

    # Extract user_id from session (format: "name|userId")
    user_id = None
    if session_id and '|' in session_id:
        parts = session_id.split('|')
        if len(parts) > 1:
            user_id = parts[1].split('_')[0] if parts[1] else None

    # ==========================================================================
    # CRITICAL: CHECK SESSION CACHE FIRST (makes follow-ups instant!)
    # User context is fetched ONCE on first message, then cached.
    # ==========================================================================
    cached_name, cached_context, was_cached = get_cached_user_context(session_id or "default")

    if was_cached:
        # FAST PATH: Use cached context, skip Zep/DB entirely
        print(f"[ATLAS CLM] ⚡ CACHE HIT - skipping Zep/DB lookups (instant!)", file=sys.stderr)
        if cached_name and not user_name:
            user_name = cached_name
        user_context = cached_context
    else:
        # SLOW PATH (first message only): Fetch and cache
        print(f"[ATLAS CLM] 🔍 First message - fetching user context...", file=sys.stderr)
        user_context = None
        db_name = None

        if user_id:
            import asyncio

            async def safe_get_memory():
                try:
                    return await get_user_memory(user_id)
                except Exception as e:
                    print(f"[ATLAS CLM] Zep lookup failed: {e}", file=sys.stderr)
                    return None

            async def safe_get_name():
                try:
                    return await get_user_preferred_name(user_id)
                except Exception as e:
                    print(f"[ATLAS CLM] DB name lookup failed: {e}", file=sys.stderr)
                    return None

            # Run BOTH in parallel - cuts ~500ms latency
            async def noop():
                return None

            user_context, db_name = await asyncio.gather(
                safe_get_memory(),
                safe_get_name() if not user_name else noop()
            )

            if user_context:
                if user_context.get("user_name") and not user_name:
                    user_name = user_context["user_name"]
                print(f"[ATLAS CLM] User context: returning={user_context.get('is_returning')}, facts={len(user_context.get('facts', []))}", file=sys.stderr)

            if db_name and not user_name:
                user_name = db_name
                print(f"[ATLAS CLM] Got name from Neon DB: {user_name}", file=sys.stderr)

        # CACHE the results for all future messages in this session
        cache_user_context(session_id or "default", user_name, user_context)

    # Log final name resolution
    _last_request_debug["user_name_resolved"] = user_name
    _last_request_debug["user_id"] = user_id
    print(f"[ATLAS CLM] Final user_name: {user_name}, user_id: {user_id}, cached: {was_cached}", file=sys.stderr)

    # Normalize query with phonetic corrections
    normalized_query = normalize_query(user_msg)
    print(f"[ATLAS CLM] Query: '{user_msg}' -> '{normalized_query}'", file=sys.stderr)

    # No easter egg for this persona

    # Greeting detection
    # Hume sends "speak your greeting" or user says "hello"
    normalized_lower = normalized_query.lower().strip()
    user_msg_lower = user_msg.lower()
    is_greeting_request = (
        "speak your greeting" in user_msg_lower or
        normalized_lower in ["hello", "hi", "hey", "hiya", "howdy", "greetings", "start"] or
        normalized_lower.startswith("hello ") or
        normalized_lower.startswith("hi ")
    )
    logger.info(f"Greeting check: user_msg='{user_msg}', normalized='{normalized_lower}', is_greeting={is_greeting_request}")

    if is_greeting_request:
        ctx = get_session_context(session_id or "default")
        if not ctx.greeted_this_session:
            # First greeting this session - personalize based on user context
            is_returning = user_context.get("is_returning", False) if user_context else False
            user_interests = user_context.get("interests", []) if user_context else []

            if is_returning and user_name and user_interests:
                # Returning user with known interests - suggest their topic!
                suggested_topic = user_interests[0]  # Most recent interest
                response_text = f"Welcome back, {user_name}! I remember you were interested in {suggested_topic}. Shall we explore that further, or would you like to discover something new?"
                # STORE the suggestion so "yes" works
                set_last_suggestion(session_id or "default", suggested_topic)
                mark_name_used(session_id or "default", in_greeting=True)
                print(f"[ATLAS CLM] Suggesting topic from Zep: {suggested_topic}", file=sys.stderr)
            elif is_returning and user_name:
                # Returning user with name (no interests yet)
                response_text = f"Welcome back to Relocation Quest, {user_name}! Lovely to hear from you again. Which destination shall we explore today?"
                mark_name_used(session_id or "default", in_greeting=True)
            elif user_name:
                # New user with name - suggest Portugal
                response_text = f"Welcome to Relocation Quest, {user_name}! I'm ATLAS, your guide to moving abroad. Shall I tell you about Portugal, one of the most popular destinations for digital nomads?"
                set_last_suggestion(session_id or "default", "Portugal")
                mark_name_used(session_id or "default", in_greeting=True)
            else:
                # Anonymous user - suggest Cyprus
                response_text = "Welcome to Relocation Quest! I'm ATLAS, your AI relocation advisor. I can help with visas, cost of living, and finding your perfect destination. Shall I tell you about Cyprus, a Mediterranean gem with great tax benefits?"
                set_last_suggestion(session_id or "default", "Cyprus")

            ctx.greeted_this_session = True
            print(f"[ATLAS CLM] Greeting: user_name={user_name}, is_returning={is_returning}, interests={user_interests}", file=sys.stderr)
        else:
            # Already greeted - don't re-greet
            response_text = "What would you like to explore? I've got guides on Portugal, Cyprus, Dubai, and 50+ other destinations."

        return StreamingResponse(
            stream_sse_response(response_text, str(uuid.uuid4())),
            media_type="text/event-stream"
        )

    # User asking their own name - use session context
    name_questions = ["what is my name", "what's my name", "do you know my name", "who am i"]
    is_name_question = any(nq in normalized_query.lower() for nq in name_questions)

    if is_name_question:
        if user_name:
            response_text = f"You're {user_name}, of course! Now, which destination would you like to explore?"
        else:
            response_text = "I don't believe you've told me your name yet. What should I call you?"
        return StreamingResponse(
            stream_sse_response(response_text, str(uuid.uuid4())),
            media_type="text/event-stream"
        )

    # Identity/meta questions about ATLAS - handle before guide search
    identity_keywords = ["who are you", "what are you", "your name", "about yourself",
                         "what can you help with", "what do you do",
                         "tell me about you", "introduce yourself"]
    is_identity_question = any(kw in normalized_query.lower() for kw in identity_keywords)

    if is_identity_question:
        response_text = """I'm ATLAS, your AI relocation advisor at Relocation Quest. I help people navigate
international relocation - from digital nomad visas to cost of living comparisons. I've got guides on
50+ destinations including Portugal, Cyprus, Dubai, Spain, and more. I can help with visa requirements,
tax implications, cost of living, and quality of life factors. Where are you thinking of relocating?"""
        return StreamingResponse(
            stream_sse_response(response_text.replace('\n', ' '), str(uuid.uuid4())),
            media_type="text/event-stream"
        )

    # ==========================================================================
    # AFFIRMATION HANDLING: "yes", "sure", "go on" -> use last suggested topic
    # ==========================================================================
    AFFIRMATION_WORDS = {
        "yes", "yeah", "yep", "yup", "sure", "okay", "ok", "please", "aye",
        "absolutely", "definitely", "certainly", "indeed", "alright", "right",
    }
    AFFIRMATION_PHRASES = {
        "go on", "tell me more", "go ahead", "yes please", "sure thing",
        "of course", "i'd like that", "i would like that", "sounds good", "sounds great",
        "let's do it", "let's hear it", "why not", "i'm interested", "please do",
    }

    # Check if this is a pure affirmation (exact match only - no partial matching)
    # Removed "tell me" as it conflicts with "tell me about X" queries
    is_affirmation = (
        normalized_lower in AFFIRMATION_WORDS or
        normalized_lower in AFFIRMATION_PHRASES
    )

    if is_affirmation:
        last_suggestion = get_last_suggestion(session_id or "default")
        if last_suggestion:
            print(f"[ATLAS CLM] ⚡ Affirmation '{normalized_lower}' -> using last suggestion: '{last_suggestion}'", file=sys.stderr)
            # Replace query with the suggested topic
            normalized_query = last_suggestion
        else:
            # No suggestion stored - ask what they want
            response_text = "What would you like to hear about? I've got guides on Portugal, Cyprus, Dubai, Spain, and 50+ other destinations."
            return StreamingResponse(
                stream_sse_response(response_text, str(uuid.uuid4())),
                media_type="text/event-stream"
            )

    # Increment turn counter for name spacing
    increment_turn(session_id)

    # Search for relevant articles
    try:
        results = await search_articles(normalized_query, limit=3)

        if results.articles:
            # Build context from articles
            context = "\n\n".join([
                f"## {a.title}\n{a.content[:1500]}"
                for a in results.articles[:2]
            ])

            # Create deps with user context
            deps = ATLASDeps(
                state=AppState(),
                user_id=user_id,
                user_name=user_name,
                is_returning_user=user_context.get("is_returning", False) if user_context else False,
                user_facts=user_context.get("facts", []) if user_context else [],
            )

            # Build dynamic system prompt for returning users
            dynamic_prompt = build_system_prompt(user_context)

            # Create a temporary agent with the dynamic prompt
            # Use Groq for faster voice responses, fallback to Gemini
            groq_key = os.environ.get("GROQ_API_KEY", "")
            model = 'groq:llama-3.1-8b-instant' if groq_key else 'google-gla:gemini-2.0-flash'
            temp_agent = Agent(
                model,
                deps_type=ATLASDeps,
                system_prompt=dynamic_prompt,
                retries=2,
            )

            # Run the agent with context - shorter for voice (faster TTS)
            prompt = f"""SOURCE MATERIAL:
{context}

USER QUESTION: {user_msg}

Respond in 2-3 sentences. Use ONLY the source material. Be engaging."""

            result = await temp_agent.run(prompt, deps=deps)
            response_text = result.output

            # Store conversation to Zep memory (async, don't await)
            if user_id and len(user_msg) > 5:
                # Store user message
                await store_to_memory(user_id, user_msg, "user")
                # Store ATLAS's response (summarized)
                await store_to_memory(user_id, response_text[:500], "assistant")

        else:
            response_text = "I don't seem to have any guides about that destination yet. Would you like to explore something else? I've got detailed info on Portugal, Cyprus, Dubai, Spain, and many other popular destinations."

    except Exception as e:
        print(f"[ATLAS CLM] Error: {e}", file=sys.stderr)
        response_text = "I'm having a bit of trouble searching my records at the moment. Could you try asking again?"

    msg_id = str(uuid.uuid4())
    return StreamingResponse(
        stream_sse_response(response_text, msg_id),
        media_type="text/event-stream"
    )


# =============================================================================
# USER CONTEXT EXTRACTION FROM COPILOTKIT INSTRUCTIONS
# =============================================================================

def extract_user_from_instructions(content: str) -> dict:
    """
    Extract user info from CopilotKit instructions system message.
    Frontend sends: "CRITICAL USER CONTEXT:\n- User Name: Dan\n- User ID: abc123..."
    """
    import re
    context = {}

    # User Name: Dan
    match = re.search(r'User Name:\s*([^\n]+)', content)
    if match:
        name = match.group(1).strip()
        if name and name.lower() not in ['unknown', 'undefined', 'null']:
            context['user_name'] = name

    # User ID: abc123
    match = re.search(r'User ID:\s*([^\n]+)', content)
    if match:
        user_id = match.group(1).strip()
        if user_id and user_id.lower() not in ['unknown', 'undefined', 'null']:
            context['user_id'] = user_id

    # User Email: dan@example.com
    match = re.search(r'User Email:\s*([^\n]+)', content)
    if match:
        email = match.group(1).strip()
        if email and email.lower() not in ['unknown', 'undefined', 'null']:
            context['email'] = email

    # Status: Returning user
    if 'returning user' in content.lower():
        context['is_returning'] = True

    # Recent interests: topic1, topic2
    match = re.search(r'Recent interests:\s*([^\n]+)', content)
    if match:
        interests = match.group(1).strip()
        if interests:
            context['interests'] = [i.strip() for i in interests.split(',')]

    return context


@app.middleware("http")
async def extract_user_context_middleware(request: Request, call_next):
    """
    Middleware to extract user context from CopilotKit's instructions.
    CopilotKit sends instructions as a system message in the request body.
    """
    global _current_user_context

    # Only process AG-UI requests
    if request.url.path.startswith("/agui"):
        try:
            # Read request body
            body_bytes = await request.body()
            if body_bytes:
                body = json.loads(body_bytes)
                messages = body.get("messages", [])

                # Look for CopilotKit instructions in system messages
                for msg in messages:
                    if msg.get("role") == "system":
                        content = msg.get("content", "")
                        if isinstance(content, str) and "User Name:" in content:
                            extracted = extract_user_from_instructions(content)
                            if extracted:
                                _current_user_context = extracted
                                print(f"[ATLAS AG-UI] Extracted user context: {extracted}", file=sys.stderr)

                # Reconstruct request with body
                from starlette.requests import Request as StarletteRequest
                scope = request.scope
                async def receive():
                    return {"type": "http.request", "body": body_bytes}
                request = StarletteRequest(scope, receive)
        except Exception as e:
            print(f"[ATLAS AG-UI] Middleware error: {e}", file=sys.stderr)

    return await call_next(request)


# =============================================================================
# AG-UI ENDPOINT FOR COPILOTKIT (with StateDeps for user context)
# =============================================================================

if STATEDEPS_AVAILABLE:
    from textwrap import dedent

    # Create a CopilotKit-specific agent that uses StateDeps
    copilotkit_agent = Agent(
        'google-gla:gemini-2.0-flash',
        deps_type=StateDeps[ATLASAgentState],
        retries=2,
    )

    @copilotkit_agent.instructions
    async def atlas_copilotkit_instructions(ctx: RunContext[StateDeps[ATLASAgentState]]) -> str:
        """Dynamic instructions with proactive Zep context."""
        state = ctx.deps.state
        user = state.user
        logger.info(f"CopilotKit instructions - user: {user}")

        # Proactively fetch Zep memory if user is logged in
        user_context = ""
        if user and user.id:
            memory = await get_user_memory(user.id)
            facts = memory.get("facts", [])
            logger.info(f"[ATLAS CopilotKit] Zep memory for {user.id}: returning={memory.get('is_returning')}, facts_count={len(facts)}")
            if facts:
                logger.info(f"[ATLAS CopilotKit] First 3 facts: {facts[:3]}")

            if memory.get("is_returning") and facts:
                user_context = f"""
## RETURNING USER CONTEXT
- User Name: {user.name}
- Status: RETURNING USER - greet warmly by name!
- Their previous interests: {'; '.join(facts[:5])}
- Reference what they asked about before to show you remember them
"""
            elif memory.get("is_returning"):
                user_context = f"""
## RETURNING USER CONTEXT
- User Name: {user.name}
- Status: Returning user (no specific topics recorded yet)
- Greet them warmly: "Welcome back, {user.name}!"
"""
            else:
                user_context = f"""
## USER CONTEXT
- User Name: {user.name}
- Status: New user
"""
        else:
            logger.info(f"[ATLAS CopilotKit] No user in state for Zep lookup")

        return dedent(f"""
You are ATLAS, an AI relocation advisor. This is the TEXT CHAT interface - be CONCISE here.
Your voice (via Hume EVI) will elaborate on topics in detail. The chat shows quick summaries.

## YOUR IDENTITY
- You ARE ATLAS, the Relocation Quest advisor (50+ destination guides)
- Warm, knowledgeable relocation expert
- NEVER say "As an AI" or "I don't have access"
{user_context}
## TEXT CHAT BEHAVIOR (DIFFERENT FROM VOICE)
The user hears your voice separately - it gives rich details.
In this chat, keep it SHORT:
- Quick acknowledgment: "Ah, Portugal..."
- Delegate to Destination Expert for visuals
- Add brief teaser: "Great choice for digital nomads..."
- End with follow-up question

## TOOL USAGE - ALWAYS USE THESE TOOLS
| User asks... | TOOL TO CALL |
|--------------|--------------|
| "What is my name?" | get_my_profile |
| "What's my email?" | get_my_profile |
| "What are my interests?" | get_my_interests |
| "What do I like?" | get_my_interests |
| "What have I asked about?" | get_conversation_history |
| "What did we discuss?" | get_conversation_history |
| "Do you remember...?" | get_conversation_history |
| "yes", "tell me more", "sounds good" (after mentioning a destination) | show_destination_card |
| Any country name (Portugal, Greece, Spain, etc.) | show_destination_card |
| "show me destinations", "what countries" | show_featured_destinations |
| "compare X and Y" | show_comparison_tool |
| "cost of living", "how much" | show_cost_calculator |
| "visa", "how to apply" | show_visa_planner |
| "which destination for me", "quiz" | show_relocation_quiz |

## CRITICAL RULES - YOU MUST FOLLOW THESE
1. WHENEVER you mention a destination by name → IMMEDIATELY call show_destination_card
2. If user says "yes", "sure", "tell me more" after you mentioned a destination → call show_destination_card
3. The card IS the main content - your text should be 1-2 sentences only
4. NEVER just talk about a destination without showing the card
5. Example flow:
   - User: "Tell me about Greece"
   - You: "Greece is amazing!" + CALL show_destination_card("Greece")
   - Card appears with full data
   - User: "Yes, I'm interested"
   - You: "Great choice!" + CALL show_destination_card("Greece") again if not already shown

## OUTPUT RULES
- NEVER output code, variables, or internal tool names
- Be conversational and brief
- Use the user's name sparingly (once per 3-4 messages)
- After greeting, DON'T say "Hello" or "I'm ATLAS" again
""")

    # Register tools for CopilotKit agent
    @copilotkit_agent.tool
    async def search_destinations(ctx: RunContext[StateDeps[ATLASAgentState]], query: str) -> dict:
        """Search relocation guides. Use for any destination or relocation topic."""
        results = await search_articles(query, limit=5)
        if not results.articles:
            return {"found": False, "message": "No guides found"}

        context_parts = []
        article_cards = []
        for article in results.articles[:3]:
            context_parts.append(f"## {article.title}\n{article.content[:2000]}")
            article_cards.append({
                "id": article.id, "title": article.title,
                "excerpt": article.content[:200] + "...", "score": article.score,
            })

        return {
            "found": True, "query": results.query,
            "source_content": "\n\n".join(context_parts),
            "articles": article_cards, "ui_component": "ArticleGrid",
        }

    @copilotkit_agent.tool
    async def get_my_profile(ctx: RunContext[StateDeps[ATLASAgentState]]) -> dict:
        """
        Get the current user's profile information.

        ALWAYS call this tool when the user asks:
        - "What is my name?"
        - "Do you know my name?"
        - "Who am I?"
        - "What's my email?"
        - Any question about their personal info
        """
        state = ctx.deps.state
        user = state.user
        logger.info(f"get_my_profile called - user: {user}")

        if user and user.id:
            return {
                "found": True,
                "name": user.name,
                "email": user.email,
                "response_hint": f"The user's name is {user.name}. Respond warmly: 'You're {user.name}, of course!'"
            }

        # Fallback to Neon DB lookup if state.user not set
        logger.info("No user in state, checking DB...")
        return {
            "found": False,
            "name": None,
            "response_hint": "You don't know the user's name yet. Ask them: 'I don't believe you've told me your name yet. What should I call you?'"
        }

    @copilotkit_agent.tool
    async def get_my_interests(ctx: RunContext[StateDeps[ATLASAgentState]]) -> dict:
        """
        Get the user's interests and facts from memory.

        ALWAYS call this tool when the user asks:
        - "What are my interests?"
        - "What do I like?"
        - "What topics interest me?"
        """
        state = ctx.deps.state
        user = state.user
        logger.info(f"get_my_interests called - user: {user}")

        if not user or not user.id:
            return {"found": False, "interests": [], "response_hint": "You don't know the user yet."}

        # Get facts from Zep memory
        memory = await get_user_memory(user.id)
        facts = memory.get("facts", [])

        if facts:
            return {
                "found": True,
                "interests": facts[:10],
                "response_hint": f"The user has shown interest in: {', '.join(facts[:5])}"
            }

        return {"found": False, "interests": [], "response_hint": "You haven't learned about their interests yet. Ask what topics interest them."}

    @copilotkit_agent.tool
    async def get_conversation_history(ctx: RunContext[StateDeps[ATLASAgentState]]) -> dict:
        """
        Get what topics the user has asked about before.

        ALWAYS call this tool when the user asks:
        - "What have I asked you about?"
        - "What did we talk about?"
        - "What have we discussed?"
        - "Do you remember what I asked?"
        """
        state = ctx.deps.state
        user = state.user
        logger.info(f"get_conversation_history called - user: {user}")

        if not user or not user.id:
            return {"found": False, "topics": [], "response_hint": "You don't know the user yet."}

        # Get facts from Zep memory - these include topics discussed
        memory = await get_user_memory(user.id)
        facts = memory.get("facts", [])

        # Filter for topic-related facts
        topics = [f for f in facts if any(kw in f.lower() for kw in ['asked', 'interested', 'discussed', 'talked', 'mentioned', 'destination', 'relocation', 'visa'])]

        if topics:
            return {
                "found": True,
                "topics": topics[:10],
                "response_hint": f"You remember discussing: {', '.join(topics[:3])}"
            }

        if facts:
            return {
                "found": True,
                "topics": facts[:5],
                "response_hint": f"From your memory: {', '.join(facts[:3])}"
            }

        return {"found": False, "topics": [], "response_hint": "This appears to be a new conversation. Ask what they'd like to explore."}

    @copilotkit_agent.tool
    async def get_about_atlas(ctx: RunContext[StateDeps[ATLASAgentState]], question: str) -> dict:
        """Answer questions about ATLAS."""
        return {
            "found": True,
            "about": {"name": "ATLAS", "role": "AI Relocation Advisor", "destinations": 50},
            "response_hint": "Respond in first person as ATLAS."
        }

    @copilotkit_agent.tool
    async def delegate_to_destination_expert(ctx: RunContext[StateDeps[ATLASAgentState]], topic: str) -> dict:
        """
        Search for guides, maps, and visa timelines about a relocation destination.

        Use this when users ask about destinations or want visual content.

        Args:
            topic: The topic to search for (e.g., "Portugal", "Cyprus D7 visa")
        """
        logger.info(f"[ATLAS CopilotKit] Searching for topic: {topic}")

        try:
            # Import here to avoid circular imports
            from .tools import search_articles, extract_location_from_content, extract_era_from_content
            from .database import get_topic_image

            # Search for articles
            results = await search_articles(topic, limit=5)

            if not results.articles:
                return {
                    "speaker": "destination_expert",
                    "found": False,
                    "content": f"I couldn't find any guides about {topic} in my research.",
                    "ui_component": None,
                    "ui_data": None,
                }

            # Build article cards
            article_cards = []
            top_article = results.articles[0]

            for article in results.articles[:3]:
                location = extract_location_from_content(article.content, article.title)
                era = extract_era_from_content(article.content)
                img_url = article.hero_image_url

                # Unsplash fallback for articles without images
                if not img_url:
                    title_keywords = article.title.lower().replace(":", "").replace(" ", ",")[:50]
                    img_url = f"https://source.unsplash.com/800x600/?travel,{title_keywords},destination"

                article_cards.append({
                    "id": article.id,
                    "title": article.title,
                    "excerpt": article.content[:200] + "...",
                    "hero_image_url": img_url,
                    "score": article.score,
                    "location": location.model_dump() if location else None,
                    "era": era,
                })

            # Get hero image - from top article or fallback to topic_images
            hero_image = top_article.hero_image_url
            if not hero_image:
                hero_image = await get_topic_image(topic)

            # Unsplash fallback if still no image
            if not hero_image:
                # Use Unsplash Source API for contextual destination images
                safe_topic = topic.lower().replace(" ", ",").replace("'", "")
                hero_image = f"https://source.unsplash.com/1600x900/?travel,{safe_topic},destination"
                logger.info(f"[ATLAS CopilotKit] Using Unsplash fallback for: {topic}")

            # Extract location and era from top article
            location = extract_location_from_content(top_article.content, top_article.title)
            era = extract_era_from_content(top_article.content)

            # Build timeline if we have an era
            timeline_events = None
            if era:
                era_lower = era.lower()
                TIMELINES = {
                    "victorian": [
                        {"year": 1837, "title": "Queen Victoria's Coronation", "description": "Beginning of the Victorian era"},
                        {"year": 1851, "title": "Great Exhibition", "description": "Crystal Palace opens in Hyde Park"},
                        {"year": 1863, "title": "First Underground", "description": "Metropolitan Railway opens"},
                        {"year": 1876, "title": "Royal Aquarium Opens", "description": "Entertainment venue in Westminster"},
                        {"year": 1901, "title": "End of Era", "description": "Death of Queen Victoria"},
                    ],
                    "georgian": [
                        {"year": 1714, "title": "George I", "description": "House of Hanover begins"},
                        {"year": 1750, "title": "Westminster Bridge", "description": "Second Thames crossing opens"},
                        {"year": 1830, "title": "End of Era", "description": "Death of George IV"},
                    ],
                }
                for key, events in TIMELINES.items():
                    if key in era_lower:
                        timeline_events = events
                        break

            # Log what we found
            articles_with_images = sum(1 for a in article_cards if a.get("hero_image_url"))
            logger.info(f"[ATLAS CopilotKit] Found {len(article_cards)} articles, {articles_with_images} with images, hero_image: {'YES' if hero_image else 'NO'}")

            # Build UI data
            ui_data = {
                "found": True,
                "query": topic,
                "articles": article_cards,
                "hero_image": hero_image,
                "location": location.model_dump() if location else None,
                "era": era,
                "timeline_events": timeline_events,
                "brief": f"I found {len(article_cards)} articles about {topic}." + (f" {articles_with_images} include historic images." if articles_with_images > 0 else ""),
            }

            return {
                "speaker": "destination_expert",
                "content": ui_data["brief"],
                "ui_component": "DestinationContext",
                "ui_data": ui_data,
                "found": True,
            }

        except Exception as e:
            logger.error(f"[ATLAS CopilotKit] Search error: {e}", exc_info=True)
            return {
                "speaker": "destination_expert",
                "content": f"I had trouble searching for {topic}.",
                "found": False,
            }

    @copilotkit_agent.tool
    async def show_cost_calculator(ctx: RunContext[StateDeps[ATLASAgentState]], destination: str = "") -> dict:
        """
        Show the interactive cost of living calculator.

        Use this when users ask about:
        - "how much does it cost to live in..."
        - "what's my budget for..."
        - "compare living costs"
        - "cost calculator"

        Args:
            destination: Optional destination to pre-select
        """
        return {
            "found": True,
            "tool_type": "cost_calculator",
            "destination": destination,
            "title": "Cost of Living Calculator",
            "description": "Compare living costs across destinations and plan your monthly budget",
            "url": f"/tools/cost-calculator{'?dest=' + destination.lower().replace(' ', '-') if destination else ''}",
            "ui_component": "ToolCTA",
        }

    @copilotkit_agent.tool
    async def show_comparison_tool(ctx: RunContext[StateDeps[ATLASAgentState]], destination1: str = "", destination2: str = "") -> dict:
        """
        Show the interactive destination comparison tool.

        Use this when users ask to:
        - "compare Portugal and Spain"
        - "which is better, X or Y"
        - "compare destinations"
        - "destination comparison tool"

        Args:
            destination1: First destination to compare
            destination2: Second destination to compare
        """
        url = "/tools/compare"
        if destination1:
            url += f"?d1={destination1.lower().replace(' ', '-')}"
            if destination2:
                url += f"&d2={destination2.lower().replace(' ', '-')}"

        return {
            "found": True,
            "tool_type": "comparison",
            "destination1": destination1,
            "destination2": destination2,
            "title": "Destination Comparison Tool",
            "description": f"Compare {destination1 or 'destinations'} and {destination2 or 'another'} side-by-side",
            "url": url,
            "ui_component": "ToolCTA",
        }

    @copilotkit_agent.tool
    async def show_visa_planner(ctx: RunContext[StateDeps[ATLASAgentState]], destination: str = "") -> dict:
        """
        Show the visa timeline planner tool.

        Use this when users ask about:
        - "how do I apply for a visa"
        - "visa application timeline"
        - "visa planner"
        - "steps to get a visa"

        Args:
            destination: Optional destination for visa planning
        """
        return {
            "found": True,
            "tool_type": "visa_planner",
            "destination": destination,
            "title": "Visa Timeline Planner",
            "description": f"Plan your visa application for {destination or 'your chosen destination'} step by step",
            "url": f"/tools/visa-timeline{'?dest=' + destination.lower().replace(' ', '-') if destination else ''}",
            "ui_component": "ToolCTA",
        }

    @copilotkit_agent.tool
    async def show_relocation_quiz(ctx: RunContext[StateDeps[ATLASAgentState]]) -> dict:
        """
        Show the relocation readiness quiz.

        Use this when users ask:
        - "which destination is right for me"
        - "help me choose a destination"
        - "take the quiz"
        - "where should I move"
        - "I don't know where to go"
        """
        return {
            "found": True,
            "tool_type": "quiz",
            "title": "Relocation Readiness Quiz",
            "description": "Answer 7 questions to find your perfect destination match",
            "url": "/tools/quiz",
            "ui_component": "ToolCTA",
        }

    @copilotkit_agent.tool
    async def show_destination_card(ctx: RunContext[StateDeps[ATLASAgentState]], destination: str) -> dict:
        """
        Show a rich destination card with visa info, cost of living, and job market data.

        ALWAYS call this tool when:
        - User mentions a country name (Portugal, Spain, Greece, etc.)
        - User confirms interest in a destination ("yes", "tell me more", "sounds good")
        - User asks about any specific destination
        - You recommend or suggest a destination

        This displays a beautiful visual card in CopilotKit - ALWAYS use it!

        Args:
            destination: The destination name (e.g., "Portugal", "Greece", "Spain")
        """
        from .database import get_destination_by_slug, search_destinations

        logger.info(f"[show_destination_card] Looking up: {destination}")

        # Normalize the destination name to slug format
        slug = destination.lower().strip().replace(" ", "-")

        # Try exact slug match first
        dest_data = await get_destination_by_slug(slug)

        # If not found, search for it
        if not dest_data:
            results = await search_destinations(destination)
            if results:
                dest_data = results[0]
                logger.info(f"[show_destination_card] Found via search: {dest_data.get('country_name')}")

        if not dest_data:
            logger.warning(f"[show_destination_card] No destination found for: {destination}")
            return {
                "found": False,
                "destination": destination,
                "message": f"I don't have detailed data for {destination} yet, but I can tell you what I know!",
                "ui_component": None,
            }

        # Build the response with UI component
        logger.info(f"[show_destination_card] Returning card for: {dest_data.get('country_name')}")
        return {
            "found": True,
            "destination": dest_data.get("country_name"),
            "slug": dest_data.get("slug"),
            "flag": dest_data.get("flag", "🌍"),
            "region": dest_data.get("region"),
            "hero_subtitle": dest_data.get("hero_subtitle"),
            "hero_image_url": dest_data.get("hero_image_url"),
            "language": dest_data.get("language"),
            "quick_facts": dest_data.get("quick_facts", []),
            "highlights": dest_data.get("highlights", []),
            "visas": dest_data.get("visas", []),
            "cost_of_living": dest_data.get("cost_of_living", []),
            "job_market": dest_data.get("job_market", {}),
            "ui_component": "DestinationCard",
        }

    @copilotkit_agent.tool
    async def show_featured_destinations(ctx: RunContext[StateDeps[ATLASAgentState]]) -> dict:
        """
        Show featured destination cards.

        Call this when:
        - User asks "what destinations do you cover"
        - User asks "show me destinations"
        - User wants to browse options
        - Starting a conversation about where to move
        """
        from .database import get_all_destinations

        logger.info("[show_featured_destinations] Fetching all destinations")

        destinations = await get_all_destinations()

        if not destinations:
            return {
                "found": False,
                "message": "I couldn't load the destinations right now.",
                "ui_component": None,
            }

        # Return featured destinations
        featured = [
            {
                "country_name": d.get("country_name"),
                "slug": d.get("slug"),
                "flag": d.get("flag", "🌍"),
                "region": d.get("region"),
                "hero_image_url": d.get("hero_image_url"),
                "hero_subtitle": d.get("hero_subtitle"),
            }
            for d in destinations[:8]
        ]

        logger.info(f"[show_featured_destinations] Returning {len(featured)} destinations")
        return {
            "found": True,
            "destinations": featured,
            "count": len(featured),
            "ui_component": "DestinationGrid",
        }

    # Create AG-UI app with StateDeps
    agui_app = copilotkit_agent.to_ag_ui(deps=StateDeps(ATLASAgentState()))
    app.mount("/agui", agui_app)
    logger.info("CopilotKit AG-UI endpoint ready with StateDeps")
else:
    # Fallback without StateDeps
    agui_app = agent.to_ag_ui(deps=ATLASDeps(state=AppState()))
    app.mount("/agui", agui_app)
    logger.info("CopilotKit AG-UI endpoint ready (no StateDeps)")


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/")
async def health():
    """Health check endpoint."""
    logger.info("Health endpoint called!")
    return {"status": "ok", "agent": "ATLAS - Relocation Quest", "deployed": "2026-01-07-relocation-quest"}


@app.get("/health")
async def health_check():
    """Health check for Railway."""
    return {"status": "healthy"}


# Store last request for debugging
_last_request_debug: dict = {"status": "no requests yet"}


@app.get("/debug/last-request")
async def debug_last_request():
    """Return the last request received for debugging."""
    return _last_request_debug
