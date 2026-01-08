import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import DestinationClient from './DestinationClient';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getDestination(slug: string) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  const sql = neon(databaseUrl);
  const destinations = await sql`
    SELECT country_name, meta_title, meta_description, hero_image_url
    FROM destinations
    WHERE slug = ${slug} AND enabled = true
  `;

  return destinations[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestination(slug);

  if (!destination) {
    return {
      title: 'Destination Not Found | Relocation Quest',
      description: 'The destination you are looking for could not be found.',
    };
  }

  const title = destination.meta_title || `Moving to ${destination.country_name} | Relocation Quest`;
  const description = destination.meta_description ||
    `Complete relocation guide for ${destination.country_name}. Visa requirements, cost of living, job market, and everything you need to know about moving to ${destination.country_name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: destination.hero_image_url ? [destination.hero_image_url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: destination.hero_image_url ? [destination.hero_image_url] : [],
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  return <DestinationClient slug={slug} />;
}
