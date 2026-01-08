import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Relocation Guides | Relocation Quest',
  description: 'Comprehensive guides for moving abroad. Visa requirements, digital nomad guides, cost of living comparisons, and expert relocation advice.',
  openGraph: {
    title: 'Relocation Guides | Relocation Quest',
    description: 'Comprehensive guides for moving abroad.',
    type: 'website',
  },
};

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  country: string;
  article_mode: string;
  hero_image_url: string;
}

interface CategoryGroup {
  mode: string;
  label: string;
  description: string;
  icon: string;
  articles: Article[];
}

async function getArticlesByCategory(): Promise<CategoryGroup[]> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return [];

  const sql = neon(databaseUrl);

  const categories = [
    { mode: 'guide', label: 'Country Guides', description: 'Step-by-step relocation guides for each destination', icon: '📍' },
    { mode: 'nomad', label: 'Digital Nomad', description: 'Remote work visas and nomad lifestyle guides', icon: '💻' },
    { mode: 'story', label: 'Expat Stories', description: 'Real experiences from people who made the move', icon: '✈️' },
    { mode: 'topic', label: 'Topics', description: 'Deep dives into specific relocation topics', icon: '📚' },
    { mode: 'voices', label: 'Expert Voices', description: 'Insights from relocation professionals', icon: '🎙️' },
  ];

  const results: CategoryGroup[] = [];

  for (const cat of categories) {
    const articles = await sql`
      SELECT slug, title, excerpt, country, article_mode, hero_image_url
      FROM articles
      WHERE article_mode = ${cat.mode}
      ORDER BY is_featured DESC NULLS LAST, published_at DESC NULLS LAST
      LIMIT 6
    `;

    if (articles.length > 0) {
      results.push({
        ...cat,
        articles: articles as Article[],
      });
    }
  }

  return results;
}

export default async function GuidesPage() {
  const categories = await getArticlesByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Relocation Guides</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Expert advice and comprehensive guides for your international move.
            From visa applications to settling in, we've got you covered.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-stone-900">200+</p>
              <p className="text-sm text-gray-500">Articles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">38</p>
              <p className="text-sm text-gray-500">Country Guides</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">50+</p>
              <p className="text-sm text-gray-500">Countries Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {categories.map((category) => (
          <section key={category.mode} className="mb-16">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{category.icon}</span>
              <h2 className="text-2xl font-bold text-gray-900">{category.label}</h2>
            </div>
            <p className="text-gray-600 mb-6">{category.description}</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/article/${article.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
                >
                  {article.hero_image_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={article.hero_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {article.country && (
                      <span className="text-xs text-amber-600 font-medium">{article.country}</span>
                    )}
                    <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 mt-1">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href={`/articles?mode=${category.mode}`}
                className="text-amber-600 hover:text-amber-700 font-medium text-sm"
              >
                View all {category.label.toLowerCase()} →
              </Link>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-stone-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need personalized advice?
          </h2>
          <p className="text-stone-300 mb-6">
            Talk to ATLAS, our AI relocation advisor, for recommendations tailored to your situation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <span>🎙️</span>
            <span>Talk to ATLAS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
