'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GalleryImage {
  url: string;
  thumbnail: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
}

interface SimilarDestination {
  slug: string;
  country_name: string;
  flag: string;
  region: string;
  hero_image_url?: string;
  hero_subtitle?: string;
}

function SimilarDestinations({ currentSlug, currentRegion }: { currentSlug: string; currentRegion: string }) {
  const [destinations, setDestinations] = useState<SimilarDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const res = await fetch('/api/destinations?limit=20');
        if (res.ok) {
          const data = await res.json();
          const all = data.destinations || [];
          // Filter out current and prioritize same region
          const others = all.filter((d: SimilarDestination) => d.slug !== currentSlug);
          const sameRegion = others.filter((d: SimilarDestination) => d.region === currentRegion);
          const differentRegion = others.filter((d: SimilarDestination) => d.region !== currentRegion);
          // Take up to 4: prioritize same region
          const similar = [...sameRegion, ...differentRegion].slice(0, 4);
          setDestinations(similar);
        }
      } catch (err) {
        console.error('Failed to fetch similar destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [currentSlug, currentRegion]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (destinations.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {destinations.map((dest) => (
        <Link
          key={dest.slug}
          href={`/destinations/${dest.slug}`}
          className="relative rounded-xl overflow-hidden group h-40 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute inset-0">
            {dest.hero_image_url ? (
              <img src={dest.hero_image_url} alt={dest.country_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-600 to-stone-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dest.flag}</span>
              <div>
                <h3 className="font-bold text-white text-sm">{dest.country_name}</h3>
                <p className="text-white/70 text-xs">{dest.region}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ImageGallery({ countryName }: { countryName: string }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch(`/api/unsplash?type=gallery&query=${encodeURIComponent(countryName)}&count=6`);
        if (res.ok) {
          const data = await res.json();
          setImages(data.images || []);
        }
      } catch (err) {
        console.error('Failed to fetch gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, [countryName]);

  const closeLightbox = useCallback(() => setSelectedImage(null), []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    if (selectedImage) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [selectedImage, closeLightbox]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-500"
          >
            <img
              src={image.thumbnail}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              {image.photographer && (
                <p className="text-white text-xs truncate">Photo by {image.photographer}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-5xl max-h-[85vh] relative">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {selectedImage.photographer && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white text-sm">
                  Photo by{' '}
                  {selectedImage.photographerUrl ? (
                    <a
                      href={selectedImage.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-300"
                    >
                      {selectedImage.photographer}
                    </a>
                  ) : (
                    selectedImage.photographer
                  )}{' '}
                  on Unsplash
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface QuickFact {
  icon: string;
  label: string;
  value: string;
}

interface Highlight {
  title: string;
  description: string;
  icon: string;
}

interface Visa {
  name: string;
  type: string;
  duration: string;
  requirements: string[];
  processingTime: string;
  cost: string;
}

interface CostItem {
  category: string;
  item: string;
  cost: string;
  frequency: string;
}

interface CostOfLiving {
  currency: string;
  items: CostItem[];
}

interface JobMarket {
  remote_friendly: boolean;
  in_demand_sectors: string[];
  avg_salaries: Record<string, string>;
  work_culture: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Destination {
  id: string;
  slug: string;
  country_name: string;
  flag: string;
  region: string;
  hero_title: string;
  hero_subtitle: string;
  hero_gradient: string;
  language: string;
  quick_facts: QuickFact[];
  highlights: Highlight[];
  visas: Visa[];
  cost_of_living: CostOfLiving;
  job_market: JobMarket;
  faqs: FAQ[];
  meta_title: string;
  meta_description: string;
  hero_image_url: string;
}

const iconMap: Record<string, string> = {
  Sun: '☀️',
  Euro: '💶',
  Globe: '🌍',
  Users: '👥',
  Wifi: '📶',
  Heart: '❤️',
  Award: '🏆',
  Shield: '🛡️',
  Briefcase: '💼',
  Home: '🏠',
  Plane: '✈️',
  Clock: '⏰',
  DollarSign: '💵',
  MapPin: '📍',
  Building: '🏢',
  Coffee: '☕',
  Utensils: '🍽️',
  Car: '🚗',
  Zap: '⚡',
};

function getIcon(iconName: string): string {
  return iconMap[iconName] || '📌';
}

export default function DestinationClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visas' | 'costs' | 'jobs'>('overview');

  useEffect(() => {
    async function fetchDestination() {
      try {
        const res = await fetch(`/api/destinations/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setDestination(data);
        } else if (res.status === 404) {
          setError('Destination not found');
        } else {
          setError('Failed to load destination');
        }
      } catch (err) {
        console.error('Failed to fetch destination:', err);
        setError('Failed to load destination');
      } finally {
        setLoading(false);
      }
    }
    fetchDestination();
  }, [slug]);

  const handleAskATLAS = () => {
    if (destination) {
      router.push(`/?topic=${encodeURIComponent(destination.country_name)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl mb-8" />
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">🌍</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error || 'Destination not found'}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find the destination you're looking for. Browse our available destinations below.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              Explore destinations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
      {/* Hero Section */}
      <div
        className="relative h-[50vh] min-h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: destination.hero_image_url
            ? `url(${destination.hero_image_url})`
            : destination.hero_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-4 pb-12 w-full">
            <nav className="flex items-center gap-2 text-sm text-white/80 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <span>Destinations</span>
              <span>/</span>
              <span className="text-white">{destination.country_name}</span>
            </nav>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{destination.flag}</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {destination.hero_title || destination.country_name}
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {destination.hero_subtitle || destination.region}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {destination.quick_facts?.map((fact, i) => (
            <div key={i} className="text-center p-4">
              <div className="text-3xl mb-2">{getIcon(fact.icon)}</div>
              <div className="text-sm text-gray-500">{fact.label}</div>
              <div className="font-semibold text-gray-900">{fact.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '🌟' },
            { id: 'visas', label: 'Visa Options', icon: '📋' },
            { id: 'costs', label: 'Cost of Living', icon: '💰' },
            { id: 'jobs', label: 'Job Market', icon: '💼' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-stone-900 border-b-2 border-stone-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Image Gallery */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover {destination.country_name}</h2>
              <ImageGallery countryName={destination.country_name} />
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why {destination.country_name}?</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destination.highlights?.map((highlight, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-3xl mb-3">{getIcon(highlight.icon)}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{highlight.title}</h3>
                    <p className="text-gray-600 text-sm">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs */}
            {destination.faqs && destination.faqs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {destination.faqs.map((faq, i) => (
                    <details key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
                      <summary className="p-6 cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                        {faq.question}
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-6 pb-6 text-gray-600">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Visas Tab */}
        {activeTab === 'visas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Visa Options for {destination.country_name}</h2>
            {destination.visas?.map((visa, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{visa.name}</h3>
                    <span className="inline-block px-3 py-1 text-sm bg-stone-100 text-stone-700 rounded-full mt-2">
                      {visa.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-semibold text-gray-900">{visa.duration}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {visa.requirements?.map((req, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Processing Time</div>
                      <div className="font-medium text-gray-900">{visa.processingTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cost</div>
                      <div className="font-medium text-gray-900">{visa.cost}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cost of Living Tab */}
        {activeTab === 'costs' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Cost of Living in {destination.country_name}
            </h2>
            {destination.cost_of_living && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Category</th>
                      <th className="text-left p-4 font-medium text-gray-700">Item</th>
                      <th className="text-right p-4 font-medium text-gray-700">
                        Cost ({destination.cost_of_living.currency})
                      </th>
                      <th className="text-right p-4 font-medium text-gray-700">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {destination.cost_of_living.items?.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-600">{item.category}</td>
                        <td className="p-4 text-gray-900">{item.item}</td>
                        <td className="p-4 text-right font-medium text-gray-900">{item.cost}</td>
                        <td className="p-4 text-right text-gray-500">{item.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Job Market Tab */}
        {activeTab === 'jobs' && destination.job_market && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Job Market in {destination.country_name}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🏠</span> Remote Work Friendly
                </h3>
                <div className={`text-2xl font-bold ${destination.job_market.remote_friendly ? 'text-green-600' : 'text-orange-600'}`}>
                  {destination.job_market.remote_friendly ? 'Yes' : 'Limited'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📈</span> In-Demand Sectors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {destination.job_market.in_demand_sectors?.map((sector, i) => (
                    <span key={i} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {destination.job_market.avg_salaries && Object.keys(destination.job_market.avg_salaries).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>💰</span> Average Salaries
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(destination.job_market.avg_salaries).map(([role, salary], i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-gray-600">{role}</span>
                      <span className="font-medium text-gray-900">{salary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {destination.job_market.work_culture && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🤝</span> Work Culture
                </h3>
                <p className="text-gray-600">{destination.job_market.work_culture}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Similar Destinations */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore More Destinations</h2>
        <SimilarDestinations currentSlug={slug} currentRegion={destination.region} />
      </div>

      {/* Ask ATLAS CTA */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to make the move?
          </h2>
          <p className="text-stone-300 mb-6 max-w-xl mx-auto">
            Ask ATLAS for personalized advice about relocating to {destination.country_name}.
            Get answers about visas, costs, and more.
          </p>
          <button
            onClick={handleAskATLAS}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-stone-900 rounded-xl font-medium hover:bg-stone-100 transition-colors"
          >
            <span className="text-xl">🎙️</span>
            <span>Talk to ATLAS about {destination.country_name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
