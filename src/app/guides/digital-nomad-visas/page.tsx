import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Digital Nomad Visas Worldwide 2026 | Complete Guide | Relocation Quest',
  description: 'Comprehensive guide to digital nomad visas in 2026. Compare visa requirements, costs, and benefits for remote workers in Portugal, Spain, Dubai, and 40+ countries.',
  keywords: 'digital nomad visa, remote work visa, work from anywhere, digital nomad countries, nomad visa requirements',
  openGraph: {
    title: 'Digital Nomad Visas Worldwide 2026 | Complete Guide',
    description: 'Compare digital nomad visa options in 40+ countries. Requirements, costs, and application guides.',
    type: 'article',
  },
};

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  country: string;
  hero_image_url: string;
}

async function getNomadArticles(): Promise<Article[]> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return [];

  const sql = neon(databaseUrl);
  const articles = await sql`
    SELECT slug, title, excerpt, country, hero_image_url
    FROM articles
    WHERE article_mode = 'nomad'
    OR LOWER(title) LIKE '%nomad%'
    OR LOWER(title) LIKE '%remote%'
    ORDER BY is_featured DESC NULLS LAST, published_at DESC NULLS LAST
    LIMIT 20
  `;

  return articles as Article[];
}

export default async function DigitalNomadVisasPage() {
  const articles = await getNomadArticles();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-white">Guides</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Digital Nomad Visas</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Digital Nomad Visas Worldwide</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            The complete guide to working remotely from anywhere. Compare visa options,
            requirements, and costs across 40+ countries offering digital nomad programs.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">40+</p>
              <p className="text-sm text-gray-500">Countries with DN Visas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">6-24</p>
              <p className="text-sm text-gray-500">Months Duration</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">$1-5K</p>
              <p className="text-sm text-gray-500">Income Requirements</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">2-8</p>
              <p className="text-sm text-gray-500">Weeks Processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Digital Nomad Destinations</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { country: 'Portugal', flag: '🇵🇹', visa: 'D7 / Digital Nomad', income: '€3,040/mo', slug: 'portugal' },
            { country: 'Spain', flag: '🇪🇸', visa: 'Digital Nomad Visa', income: '€2,520/mo', slug: 'spain' },
            { country: 'Dubai', flag: '🇦🇪', visa: 'Virtual Working Program', income: '$5,000/mo', slug: 'dubai' },
            { country: 'Cyprus', flag: '🇨🇾', visa: 'Digital Nomad Visa', income: '€3,500/mo', slug: 'cyprus' },
            { country: 'Croatia', flag: '🇭🇷', visa: 'Digital Nomad Permit', income: '€2,539/mo', slug: 'croatia' },
            { country: 'Estonia', flag: '🇪🇪', visa: 'Digital Nomad Visa', income: '€3,504/mo', slug: 'estonia' },
          ].map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{dest.flag}</span>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600">{dest.country}</h3>
                  <p className="text-sm text-gray-500">{dest.visa}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Min. income: <span className="font-semibold text-gray-900">{dest.income}</span>
              </p>
            </Link>
          ))}
        </div>

        {/* Articles */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Digital Nomad Guides & Resources</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
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
                  <span className="text-xs text-blue-600 font-medium">{article.country}</span>
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mt-1 line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Not sure which visa is right for you?
          </h2>
          <p className="text-blue-100 mb-6">
            Talk to ATLAS for personalized recommendations based on your income, nationality, and preferences.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-xl hover:bg-blue-50 transition-colors font-medium"
          >
            <span>🎙️</span>
            <span>Ask ATLAS about Digital Nomad Visas</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
