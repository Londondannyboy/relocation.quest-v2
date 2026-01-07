"""Tools for the ATLAS agent - guide search, phonetic corrections, and UI rendering."""

import os
import re
import httpx
from typing import Optional

from .models import Article, SearchResults, ArticleCardData, MapLocation, TimelineEvent
from .database import search_articles_hybrid, get_article_by_slug

VOYAGE_API_KEY = os.environ.get("VOYAGE_API_KEY", "")
VOYAGE_MODEL = "voyage-2"

# Persistent HTTP client for connection reuse
_voyage_client: Optional[httpx.AsyncClient] = None


def get_voyage_client() -> httpx.AsyncClient:
    """Get or create persistent Voyage HTTP client."""
    global _voyage_client
    if _voyage_client is None:
        _voyage_client = httpx.AsyncClient(
            base_url="https://api.voyageai.com",
            headers={
                "Authorization": f"Bearer {VOYAGE_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=10.0,
        )
    return _voyage_client


# Phonetic corrections for voice input - essential for speech-to-text accuracy
PHONETIC_CORRECTIONS: dict[str, str] = {
    # Destination names - Cyprus
    "sigh prus": "cyprus",
    "sigh pruss": "cyprus",
    "si prus": "cyprus",
    "cypras": "cyprus",
    "siprus": "cyprus",
    # Portugal
    "port of gal": "portugal",
    "porta gal": "portugal",
    "portugall": "portugal",
    "portogal": "portugal",
    # Dubai
    "dew by": "dubai",
    "do by": "dubai",
    "doo by": "dubai",
    "dubay": "dubai",
    # Malta
    "ma tah": "malta",
    "molta": "malta",
    "maltah": "malta",
    # Spain
    "spayn": "spain",
    # Netherlands
    "nether lands": "netherlands",
    "holland": "netherlands",
    # Greece
    "greace": "greece",
    "grece": "greece",
    # Croatia
    "crow asia": "croatia",
    "kro asia": "croatia",
    # Estonia
    "es tonia": "estonia",
    "astonia": "estonia",
    # Latvia
    "lat via": "latvia",
    # Lithuania
    "lith you ania": "lithuania",
    # Common visa terms
    "d 7 visa": "d7 visa",
    "d seven visa": "d7 visa",
    "dee seven": "d7 visa",
    "digital no mad": "digital nomad",
    "no mad visa": "nomad visa",
    # Cost of living
    "cost of living": "cost of living",
    "col": "cost of living",
    # Common truncated queries
    "images of": "show me destination images",
    "pictures of": "show me destination images",
    "photos of": "show me destination images",
}


def normalize_query(query: str) -> str:
    """Apply phonetic corrections to normalize voice transcription errors."""
    normalized = query.lower().strip()

    for wrong, correct in PHONETIC_CORRECTIONS.items():
        pattern = re.compile(rf"\b{re.escape(wrong)}\b", re.IGNORECASE)
        normalized = pattern.sub(correct, normalized)

    return normalized


async def get_voyage_embedding(text: str) -> list[float]:
    """Generate embedding using Voyage AI."""
    client = get_voyage_client()
    response = await client.post(
        "/v1/embeddings",
        json={
            "model": VOYAGE_MODEL,
            "input": text,
            "input_type": "query",
        },
    )
    response.raise_for_status()
    data = response.json()
    return data["data"][0]["embedding"]


async def search_articles(query: str, limit: int = 5) -> SearchResults:
    """
    Search relocation guides using hybrid vector + keyword search.

    Normalizes the query with phonetic corrections, then performs RRF search.

    Args:
        query: The user's question or destination to search for
        limit: Maximum number of results

    Returns:
        SearchResults containing matching guides and the normalized query
    """
    # Normalize query with phonetic corrections
    normalized_query = normalize_query(query)

    # Get embedding
    embedding = await get_voyage_embedding(normalized_query)

    # Search database with RRF
    results = await search_articles_hybrid(
        query_embedding=embedding,
        query_text=normalized_query,
        limit=limit,
        similarity_threshold=0.45,
    )

    articles = [
        Article(
            id=r["id"],
            title=r["title"],
            content=r["content"],
            score=r["score"],
            hero_image_url=r.get("hero_image_url"),
        )
        for r in results
    ]

    return SearchResults(articles=articles, query=normalized_query)


async def get_article_card(slug: str) -> Optional[ArticleCardData]:
    """
    Get article card data for UI rendering.

    Args:
        slug: The article slug

    Returns:
        ArticleCardData for rendering, or None if not found
    """
    article = await get_article_by_slug(slug)
    if not article:
        return None

    return ArticleCardData(
        id=article["id"],
        title=article["title"],
        excerpt=article.get("excerpt", article["content"][:200] + "..."),
        hero_image_url=article.get("hero_image_url"),
        slug=slug,
    )


def extract_location_from_content(content: str, title: str) -> Optional[MapLocation]:
    """
    Extract location coordinates from guide content.

    Uses known destination locations and their coordinates.
    """
    # Key relocation destinations with coordinates
    DESTINATION_LOCATIONS = {
        "cyprus": MapLocation(name="Cyprus", lat=35.1264, lng=33.4299, description="Cyprus - Mediterranean island with favorable tax regime"),
        "nicosia": MapLocation(name="Nicosia", lat=35.1856, lng=33.3823, description="Nicosia, capital of Cyprus"),
        "lisbon": MapLocation(name="Lisbon", lat=38.7223, lng=-9.1393, description="Lisbon, Portugal - Popular D7 visa destination"),
        "portugal": MapLocation(name="Portugal", lat=39.3999, lng=-8.2245, description="Portugal - D7 visa and NHR tax regime"),
        "porto": MapLocation(name="Porto", lat=41.1579, lng=-8.6291, description="Porto, Portugal - Digital nomad hub"),
        "dubai": MapLocation(name="Dubai", lat=25.2048, lng=55.2708, description="Dubai, UAE - Tax-free income"),
        "malta": MapLocation(name="Malta", lat=35.9375, lng=14.3754, description="Malta - EU member, English-speaking"),
        "spain": MapLocation(name="Spain", lat=40.4168, lng=-3.7038, description="Spain - Beckham Law tax benefits"),
        "barcelona": MapLocation(name="Barcelona", lat=41.3874, lng=2.1686, description="Barcelona, Spain - Popular expat city"),
        "netherlands": MapLocation(name="Netherlands", lat=52.3676, lng=4.9041, description="Netherlands - 30% ruling tax benefit"),
        "amsterdam": MapLocation(name="Amsterdam", lat=52.3676, lng=4.9041, description="Amsterdam, Netherlands"),
        "greece": MapLocation(name="Greece", lat=37.9838, lng=23.7275, description="Greece - Digital nomad visa available"),
        "estonia": MapLocation(name="Estonia", lat=59.4370, lng=24.7536, description="Estonia - E-Residency program"),
    }

    content_lower = content.lower()
    title_lower = title.lower()

    for keyword, location in DESTINATION_LOCATIONS.items():
        if keyword in title_lower or keyword in content_lower:
            return location

    return None


def extract_era_from_content(content: str) -> Optional[str]:
    """Extract visa type or category from guide content based on keywords."""
    VISA_CATEGORIES = {
        "d7 visa": "D7 Passive Income Visa",
        "digital nomad": "Digital Nomad Visa",
        "golden visa": "Golden Visa (Investment)",
        "startup visa": "Startup Visa",
        "freelance visa": "Freelance Visa",
        "retirement visa": "Retirement Visa",
        "work permit": "Work Permit",
        "self-employment": "Self-Employment Visa",
        "investor visa": "Investor Visa",
        "non-habitual resident": "NHR Tax Regime",
        "beckham law": "Beckham Law (Spain)",
        "30% ruling": "30% Ruling (Netherlands)",
    }

    content_lower = content.lower()

    # Check for explicit visa/category keywords
    for keyword, category in VISA_CATEGORIES.items():
        if keyword in content_lower:
            return category

    return None
