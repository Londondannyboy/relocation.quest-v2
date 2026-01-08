import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Relocation Destinations | Relocation Quest',
  description: 'Explore our comprehensive guides for moving abroad. Detailed information on visas, cost of living, job markets, and more for popular relocation destinations.',
  openGraph: {
    title: 'Relocation Destinations | Relocation Quest',
    description: 'Explore our comprehensive guides for moving abroad.',
    type: 'website',
  },
};

interface Destination {
  slug: string;
  country_name: string;
  flag: string;
  region: string;
  hero_subtitle: string;
  hero_image_url: string;
}

async function getDestinations(): Promise<Destination[]> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return [];

  const sql = neon(databaseUrl);
  const destinations = await sql`
    SELECT slug, country_name, flag, region, hero_subtitle, hero_image_url
    FROM destinations
    WHERE enabled = true
    ORDER BY priority DESC, country_name ASC
  `;

  return destinations as Destination[];
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Relocation Destinations</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Comprehensive guides for your move abroad. Visa requirements, cost of living, job markets, and everything you need to know.
          </p>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
            >
              {dest.hero_image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={dest.hero_image_url}
                    alt={dest.country_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{dest.flag}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                      {dest.country_name}
                    </h2>
                    <p className="text-sm text-gray-500">{dest.region}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {dest.hero_subtitle}
                </p>
                <div className="mt-4 text-amber-600 text-sm font-medium group-hover:text-amber-700">
                  View guide →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {destinations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No destinations available yet.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-stone-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Not sure where to go?
          </h2>
          <p className="text-gray-600 mb-6">
            Talk to ATLAS, our AI relocation advisor, for personalized recommendations.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            <span>🎙️</span>
            <span>Talk to ATLAS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
