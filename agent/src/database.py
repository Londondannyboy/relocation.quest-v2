"""Database connection and RRF hybrid search for Neon PostgreSQL with pgvector."""

import os
import json
import sys
import asyncpg
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

DATABASE_URL = os.environ.get("DATABASE_URL", "")


class Database:
    """Async database connection manager for Neon PostgreSQL."""

    _pool: Optional[asyncpg.Pool] = None

    @classmethod
    async def get_pool(cls) -> asyncpg.Pool:
        """Get or create connection pool."""
        if cls._pool is None:
            cls._pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=1,
                max_size=5,
                command_timeout=30,
            )
        return cls._pool

    @classmethod
    async def close(cls) -> None:
        """Close the connection pool."""
        if cls._pool:
            await cls._pool.close()
            cls._pool = None


@asynccontextmanager
async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Get a database connection from the pool."""
    pool = await Database.get_pool()
    async with pool.acquire() as conn:
        yield conn


async def search_articles_keyword(
    query_text: str,
    limit: int = 5,
    country: str = None
) -> list[dict]:
    """
    Simple keyword search on articles using content_text column.

    Searches title, excerpt, and content_text for the query.
    Falls back to this when vector embeddings aren't available.

    Args:
        query_text: Search query
        limit: Maximum number of results
        country: Optional country filter

    Returns:
        List of matching articles with relevance scores
    """
    async with get_connection() as conn:
        query_lower = query_text.lower()

        # Build query with optional country filter
        if country:
            results = await conn.fetch("""
                SELECT
                    id::text,
                    title,
                    excerpt,
                    content_text as content,
                    slug,
                    hero_image_url,
                    country,
                    article_mode,
                    CASE
                        WHEN LOWER(title) LIKE '%' || $1 || '%' THEN 3.0
                        WHEN LOWER(excerpt) LIKE '%' || $1 || '%' THEN 2.0
                        WHEN LOWER(content_text) LIKE '%' || $1 || '%' THEN 1.0
                        ELSE 0.0
                    END as score
                FROM articles
                WHERE (
                    LOWER(title) LIKE '%' || $1 || '%'
                    OR LOWER(excerpt) LIKE '%' || $1 || '%'
                    OR LOWER(content_text) LIKE '%' || $1 || '%'
                )
                AND LOWER(country) = $3
                ORDER BY score DESC, published_at DESC NULLS LAST
                LIMIT $2
            """, query_lower, limit, country.lower())
        else:
            results = await conn.fetch("""
                SELECT
                    id::text,
                    title,
                    excerpt,
                    content_text as content,
                    slug,
                    hero_image_url,
                    country,
                    article_mode,
                    CASE
                        WHEN LOWER(title) LIKE '%' || $1 || '%' THEN 3.0
                        WHEN LOWER(excerpt) LIKE '%' || $1 || '%' THEN 2.0
                        WHEN LOWER(content_text) LIKE '%' || $1 || '%' THEN 1.0
                        ELSE 0.0
                    END as score
                FROM articles
                WHERE (
                    LOWER(title) LIKE '%' || $1 || '%'
                    OR LOWER(excerpt) LIKE '%' || $1 || '%'
                    OR LOWER(content_text) LIKE '%' || $1 || '%'
                )
                ORDER BY score DESC, published_at DESC NULLS LAST
                LIMIT $2
            """, query_lower, limit)

        print(f"[ATLAS Search] Query: '{query_text[:30]}...' -> {len(results)} results", file=sys.stderr)
        for r in results[:3]:
            print(f"[ATLAS Search]   {r['title'][:40]}... (score={r['score']})", file=sys.stderr)

        return [dict(r) for r in results]


async def search_articles_hybrid(
    query_embedding: list[float],
    query_text: str,
    limit: int = 5,
    similarity_threshold: float = 0.3
) -> list[dict]:
    """
    Hybrid search - falls back to keyword search if embeddings not available.

    Args:
        query_embedding: Vector embedding (may be ignored if no vector support)
        query_text: Original query text for keyword matching
        limit: Maximum number of results
        similarity_threshold: Minimum similarity score

    Returns:
        List of matching articles
    """
    # Use simple keyword search (vector support can be added later)
    return await search_articles_keyword(query_text, limit)


async def get_article_by_slug(slug: str) -> Optional[dict]:
    """Get a full article by its slug for detailed card display."""
    async with get_connection() as conn:
        result = await conn.fetchrow("""
            SELECT id::text, title, content, content_text, slug, excerpt,
                   hero_image_url, country, article_mode, category
            FROM articles
            WHERE slug = $1
        """, slug)
        return dict(result) if result else None


async def get_articles_by_country(country: str, limit: int = 5) -> list[dict]:
    """Get articles for a specific country/destination."""
    async with get_connection() as conn:
        results = await conn.fetch("""
            SELECT id::text, title, excerpt, slug, hero_image_url, country, article_mode
            FROM articles
            WHERE LOWER(country) = $1
            ORDER BY is_featured DESC NULLS LAST, published_at DESC NULLS LAST
            LIMIT $2
        """, country.lower(), limit)
        return [dict(r) for r in results]


async def get_articles_by_mode(article_mode: str, limit: int = 10) -> list[dict]:
    """Get articles of a specific type (guide, story, nomad, etc.)."""
    async with get_connection() as conn:
        results = await conn.fetch("""
            SELECT id::text, title, excerpt, slug, hero_image_url, country, article_mode
            FROM articles
            WHERE article_mode = $1
            ORDER BY is_featured DESC NULLS LAST, published_at DESC NULLS LAST
            LIMIT $2
        """, article_mode, limit)
        return [dict(r) for r in results]


async def get_user_preferred_name(user_id: str) -> Optional[str]:
    """
    Get user's preferred name from Neon database.
    Checks both user_data table and users table.
    """
    try:
        async with get_connection() as conn:
            # First check user_data table for preferred_name
            result = await conn.fetchrow("""
                SELECT preferred_name FROM user_data WHERE user_id = $1
            """, user_id)

            if result and result['preferred_name']:
                print(f"[ATLAS DB] Found preferred_name in user_data: {result['preferred_name']}", file=sys.stderr)
                return result['preferred_name']

            # Fallback: check users table for name or preferred_name
            result = await conn.fetchrow("""
                SELECT name, preferred_name FROM users WHERE id = $1
            """, user_id)

            if result:
                if result['preferred_name']:
                    print(f"[ATLAS DB] Found preferred_name in users: {result['preferred_name']}", file=sys.stderr)
                    return result['preferred_name']
                if result['name']:
                    # Extract first name
                    name = result['name'].split()[0] if result['name'] else None
                    if name:
                        print(f"[ATLAS DB] Found name in users table: {name}", file=sys.stderr)
                        return name

            print(f"[ATLAS DB] No name found for user {user_id}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"[ATLAS DB] Error looking up user name: {e}", file=sys.stderr)
        return None


async def get_destination_by_slug(slug: str) -> Optional[dict]:
    """
    Get full destination data including JSONB fields.

    Returns visas, cost_of_living, job_market, faqs, etc.
    """
    try:
        async with get_connection() as conn:
            result = await conn.fetchrow("""
                SELECT
                    slug, country_name, flag, region, language,
                    hero_title, hero_subtitle, hero_image_url,
                    quick_facts, highlights, visas, cost_of_living,
                    job_market, faqs
                FROM destinations
                WHERE slug = $1 AND enabled = true
            """, slug.lower())

            if result:
                # Convert to dict and parse JSONB fields
                data = dict(result)
                print(f"[ATLAS DB] Found destination: {data['country_name']}", file=sys.stderr)
                return data

            print(f"[ATLAS DB] Destination not found: {slug}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"[ATLAS DB] Error looking up destination: {e}", file=sys.stderr)
        return None


async def search_destinations(query: str) -> list[dict]:
    """
    Search destinations by country name or keywords.

    Returns matching destinations with their structured data.
    """
    try:
        async with get_connection() as conn:
            query_lower = f"%{query.lower()}%"
            results = await conn.fetch("""
                SELECT
                    slug, country_name, flag, region, language,
                    hero_subtitle, hero_image_url,
                    quick_facts, visas, cost_of_living
                FROM destinations
                WHERE enabled = true
                AND (
                    LOWER(country_name) LIKE $1
                    OR LOWER(region) LIKE $1
                    OR LOWER(hero_subtitle) LIKE $1
                )
                ORDER BY priority DESC
                LIMIT 5
            """, query_lower)

            print(f"[ATLAS DB] Found {len(results)} destinations for '{query}'", file=sys.stderr)
            return [dict(r) for r in results]
    except Exception as e:
        print(f"[ATLAS DB] Error searching destinations: {e}", file=sys.stderr)
        return []


async def get_topic_image(query: str) -> Optional[str]:
    """
    Look up a topic image using the topic_images table.

    Uses phonetic-aware keyword search for robust matching.
    The topic_images table includes phonetic variants like:
    - "thorney" -> ["thorny", "fawny", "fawney", "fourney", ...]
    - "aquarium" -> ["aquarim", "aquariam", ...]

    Args:
        query: The topic or search query

    Returns:
        Image URL if found, None otherwise
    """
    try:
        async with get_connection() as conn:
            # Search for any word in the query matching topic_keywords
            query_words = query.lower().split()

            # Try each word until we find a match
            for word in query_words:
                if len(word) < 3:
                    continue

                result = await conn.fetchrow("""
                    SELECT image_url
                    FROM topic_images
                    WHERE $1 = ANY(topic_keywords)
                    LIMIT 1
                """, word)

                if result:
                    print(f"[ATLAS DB] Found topic image for '{word}': {result['image_url'][:50]}...", file=sys.stderr)
                    return result['image_url']

            print(f"[ATLAS DB] No topic image found for query: {query}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"[ATLAS DB] Error looking up topic image: {e}", file=sys.stderr)
        return None
