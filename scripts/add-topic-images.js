/**
 * Add Topic Images for New Destinations
 *
 * These are used for background switching when the user mentions a destination.
 * Run with: node scripts/add-topic-images.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const topicImages = [
  // New destinations
  {
    topic_name: 'United Kingdom',
    topic_keywords: ['uk', 'united kingdom', 'britain', 'england', 'london', 'manchester', 'edinburgh', 'british'],
    image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
    country: 'UK',
  },
  {
    topic_name: 'New Zealand',
    topic_keywords: ['new zealand', 'nz', 'auckland', 'wellington', 'christchurch', 'kiwi', 'hobbiton'],
    image_url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600',
    country: 'New Zealand',
  },
  {
    topic_name: 'France',
    topic_keywords: ['france', 'paris', 'french', 'lyon', 'bordeaux', 'marseille', 'nice', 'eiffel'],
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600',
    country: 'France',
  },
  {
    topic_name: 'Germany',
    topic_keywords: ['germany', 'german', 'berlin', 'munich', 'hamburg', 'frankfurt', 'bavaria', 'deutschland'],
    image_url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
    country: 'Germany',
  },
  {
    topic_name: 'Netherlands',
    topic_keywords: ['netherlands', 'dutch', 'holland', 'amsterdam', 'rotterdam', 'hague', 'tulips', 'windmills'],
    image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1600',
    country: 'Netherlands',
  },
  {
    topic_name: 'Mexico',
    topic_keywords: ['mexico', 'mexican', 'cdmx', 'mexico city', 'playa', 'tulum', 'oaxaca', 'cancun', 'guadalajara'],
    image_url: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600',
    country: 'Mexico',
  },
  {
    topic_name: 'Thailand',
    topic_keywords: ['thailand', 'thai', 'bangkok', 'chiang mai', 'phuket', 'pattaya', 'krabi', 'koh samui'],
    image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600',
    country: 'Thailand',
  },
  {
    topic_name: 'Malta',
    topic_keywords: ['malta', 'maltese', 'valletta', 'sliema', 'gozo', 'mdina', 'st julians'],
    image_url: 'https://images.unsplash.com/photo-1555990538-1e6c89d83e64?w=1600',
    country: 'Malta',
  },
  {
    topic_name: 'Greece',
    topic_keywords: ['greece', 'greek', 'athens', 'santorini', 'mykonos', 'crete', 'rhodes', 'thessaloniki', 'corfu'],
    image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600',
    country: 'Greece',
  },
  {
    topic_name: 'Italy',
    topic_keywords: ['italy', 'italian', 'rome', 'milan', 'florence', 'venice', 'tuscany', 'naples', 'amalfi'],
    image_url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600',
    country: 'Italy',
  },
  {
    topic_name: 'Indonesia',
    topic_keywords: ['indonesia', 'bali', 'jakarta', 'ubud', 'canggu', 'seminyak', 'lombok', 'java', 'balinese'],
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
    country: 'Indonesia',
  },
];

async function addTopicImages() {
  console.log('Adding topic images for new destinations...\n');

  for (const img of topicImages) {
    try {
      // Check if exists by topic_name
      const existing = await sql`
        SELECT id FROM topic_images WHERE topic_name = ${img.topic_name}
      `;

      if (existing.length > 0) {
        await sql`
          UPDATE topic_images SET
            topic_keywords = ${img.topic_keywords},
            image_url = ${img.image_url},
            country = ${img.country}
          WHERE topic_name = ${img.topic_name}
        `;
        console.log(`✓ Updated: ${img.topic_name}`);
      } else {
        await sql`
          INSERT INTO topic_images (topic_name, topic_keywords, image_url, country)
          VALUES (${img.topic_name}, ${img.topic_keywords}, ${img.image_url}, ${img.country})
        `;
        console.log(`✓ Added: ${img.topic_name}`);
      }
    } catch (error) {
      console.error(`✗ Error with ${img.topic_name}:`, error.message);
    }
  }

  const count = await sql`SELECT COUNT(*) as total FROM topic_images`;
  console.log(`\nTotal topic images: ${count[0].total}`);
}

addTopicImages().catch(console.error);
