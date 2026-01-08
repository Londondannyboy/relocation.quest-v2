import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cost of Living Comparison 2026 | Relocation Quest',
  description: 'Compare cost of living across popular relocation destinations. Rent, food, utilities, and lifestyle costs in Portugal, Spain, Dubai, Cyprus and more.',
  keywords: 'cost of living comparison, expat cost of living, cheapest countries to live, cost of living abroad',
  openGraph: {
    title: 'Cost of Living Comparison 2026 | Relocation Quest',
    description: 'Compare living costs across 50+ relocation destinations worldwide.',
    type: 'article',
  },
};

interface Destination {
  slug: string;
  country_name: string;
  flag: string;
  cost_of_living: {
    currency: string;
    items: Array<{
      category: string;
      item: string;
      cost: string;
      frequency: string;
    }>;
  };
}

async function getDestinations(): Promise<Destination[]> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return [];

  const sql = neon(databaseUrl);
  const destinations = await sql`
    SELECT slug, country_name, flag, cost_of_living
    FROM destinations
    WHERE enabled = true AND cost_of_living IS NOT NULL
    ORDER BY priority DESC
  `;

  return destinations as Destination[];
}

export default async function CostOfLivingPage() {
  const destinations = await getDestinations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-white">Guides</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Cost of Living</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cost of Living Comparison</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Compare monthly expenses across top relocation destinations.
            Make informed decisions about where your budget goes furthest.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Cost Overview</h2>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Destination</th>
                  <th className="text-right p-4 font-semibold text-gray-700">1BR Rent</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Groceries</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Dining Out</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Utilities</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {destinations.map((dest) => {
                  const costs = dest.cost_of_living?.items || [];
                  const rent = costs.find(c => c.item?.toLowerCase().includes('apartment'))?.cost || '-';
                  const groceries = costs.find(c => c.category?.toLowerCase() === 'food' && c.item?.toLowerCase().includes('grocer'))?.cost || '-';
                  const dining = costs.find(c => c.item?.toLowerCase().includes('meal') || c.item?.toLowerCase().includes('restaurant'))?.cost || '-';
                  const utilities = costs.find(c => c.category?.toLowerCase() === 'utilities')?.cost || '-';

                  return (
                    <tr key={dest.slug} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{dest.flag}</span>
                          <span className="font-medium text-gray-900">{dest.country_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium">{rent}</td>
                      <td className="p-4 text-right">{groceries}</td>
                      <td className="p-4 text-right">{dining}</td>
                      <td className="p-4 text-right">{utilities}</td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/destinations/${dest.slug}`}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Destination Cards */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Cost Breakdowns</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{dest.flag}</span>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600">
                    {dest.country_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {dest.cost_of_living?.currency || 'EUR'}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                {dest.cost_of_living?.items?.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-gray-600">{item.item}</span>
                    <span className="font-medium text-gray-900">{item.cost}</span>
                  </li>
                ))}
              </ul>
              <p className="text-green-600 font-medium text-sm mt-4 group-hover:text-green-700">
                See full breakdown →
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need a personalized cost estimate?
          </h2>
          <p className="text-green-100 mb-6">
            Tell ATLAS about your lifestyle and get a tailored monthly budget for any destination.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-900 rounded-xl hover:bg-green-50 transition-colors font-medium"
          >
            <span>🎙️</span>
            <span>Calculate My Cost of Living</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
