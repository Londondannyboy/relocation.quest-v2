import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Cache for background images (in-memory, refreshes on cold start)
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Default destination images for fallback
const DEFAULT_IMAGES: Record<string, string> = {
  'portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=80', // Lisbon
  'cyprus': 'https://images.unsplash.com/photo-1593640495390-37436a055891?w=1920&q=80', // Cyprus coast bright
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80', // Burj Khalifa
  'spain': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80', // Barcelona
  'malta': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1920&q=80', // Valletta
  'thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&q=80', // Bangkok
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=80', // Bali
  'mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1920&q=80', // Mexico City
  'canada': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920&q=80', // Toronto
  'australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1920&q=80', // Sydney
  'default': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80', // Travel/World
};

// Revolving hero images for homepage
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=80', // Lisbon
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80', // Dubai
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80', // Barcelona
  'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&q=80', // Bangkok
  'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1920&q=80', // Sydney
  'https://images.unsplash.com/photo-1593640495390-37436a055891?w=1920&q=80', // Cyprus
];

// Gallery cache for multiple images
const galleryCache = new Map<string, { images: GalleryImage[]; timestamp: number }>();

interface GalleryImage {
  url: string;
  thumbnail: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const type = searchParams.get('type'); // 'destination', 'hero', or 'gallery'
  const count = parseInt(searchParams.get('count') || '1', 10);

  // Return revolving hero images
  if (type === 'hero') {
    return NextResponse.json({
      images: HERO_IMAGES,
      interval: 8000 // 8 seconds between images
    });
  }

  // Return gallery images (multiple)
  if (type === 'gallery' && query) {
    const queryLower = query.toLowerCase().trim();
    const cacheKey = `gallery_${queryLower}_${count}`;

    // Check gallery cache
    const cached = galleryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        images: cached.images,
        source: 'cache',
        query: queryLower
      });
    }

    // Fetch multiple images from Unsplash
    if (UNSPLASH_ACCESS_KEY) {
      try {
        const searchQuery = `${query} travel destination`;
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=${Math.min(count, 10)}`,
          {
            headers: {
              'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const images: GalleryImage[] = data.results.map((photo: { urls: { raw: string }; alt_description?: string; user?: { name?: string; links?: { html?: string } } }) => ({
              url: `${photo.urls.raw}&w=1200&q=80&fit=crop`,
              thumbnail: `${photo.urls.raw}&w=400&q=80&fit=crop`,
              alt: photo.alt_description || `${query} travel photo`,
              photographer: photo.user?.name,
              photographerUrl: photo.user?.links?.html
            }));

            // Cache the results
            galleryCache.set(cacheKey, { images, timestamp: Date.now() });

            return NextResponse.json({
              images,
              source: 'unsplash',
              query: queryLower
            });
          }
        }
      } catch (error) {
        console.error('[Unsplash] Gallery API error:', error);
      }
    }

    // Fallback - return empty gallery
    return NextResponse.json({
      images: [],
      source: 'fallback',
      query: queryLower
    });
  }

  // Return destination image
  if (!query) {
    return NextResponse.json({
      url: DEFAULT_IMAGES['default'],
      source: 'default'
    });
  }

  const queryLower = query.toLowerCase().trim();

  // Check cache first
  const cached = imageCache.get(queryLower);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      url: cached.url,
      source: 'cache',
      query: queryLower
    });
  }

  // Check default images
  for (const [key, url] of Object.entries(DEFAULT_IMAGES)) {
    if (queryLower.includes(key) || key.includes(queryLower)) {
      imageCache.set(queryLower, { url, timestamp: Date.now() });
      return NextResponse.json({
        url,
        source: 'default',
        query: queryLower
      });
    }
  }

  // Fetch from Unsplash API
  if (UNSPLASH_ACCESS_KEY) {
    try {
      const searchQuery = `${query} city skyline landscape`;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=1`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const photo = data.results[0];
          const url = `${photo.urls.raw}&w=1920&q=80&fit=crop`;

          // Cache the result
          imageCache.set(queryLower, { url, timestamp: Date.now() });

          return NextResponse.json({
            url,
            source: 'unsplash',
            query: queryLower,
            photographer: photo.user?.name,
            photographerUrl: photo.user?.links?.html
          });
        }
      }
    } catch (error) {
      console.error('[Unsplash] API error:', error);
    }
  }

  // Fallback to default
  const fallbackUrl = DEFAULT_IMAGES['default'];
  imageCache.set(queryLower, { url: fallbackUrl, timestamp: Date.now() });

  return NextResponse.json({
    url: fallbackUrl,
    source: 'fallback',
    query: queryLower
  });
}
