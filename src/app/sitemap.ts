import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://relocation-quest-v2.vercel.app';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/digital-nomad-visas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/cost-of-living`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic destination pages
  let destinationPages: MetadataRoute.Sitemap = [];
  let articlePages: MetadataRoute.Sitemap = [];

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const sql = neon(databaseUrl);

      // Get destinations
      const destinations = await sql`
        SELECT slug, updated_at FROM destinations WHERE enabled = true
      `;
      destinationPages = destinations.map((dest) => ({
        url: `${baseUrl}/destinations/${dest.slug}`,
        lastModified: dest.updated_at ? new Date(dest.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

      // Get articles (limit to most important)
      const articles = await sql`
        SELECT slug, updated_at FROM articles
        WHERE slug IS NOT NULL
        ORDER BY is_featured DESC NULLS LAST, published_at DESC NULLS LAST
        LIMIT 100
      `;
      articlePages = articles.map((article) => ({
        url: `${baseUrl}/article/${article.slug}`,
        lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error('Error generating sitemap:', error);
    }
  }

  return [...staticPages, ...destinationPages, ...articlePages];
}
