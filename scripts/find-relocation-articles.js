/**
 * Find Relocation-Specific Articles in V1 that should be migrated to V2
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load v2 env
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

const V1_DB = 'postgresql://neondb_owner:npg_LjBNF17HSTix@ep-green-smoke-ab3vtnw9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const V2_DB = process.env.DATABASE_URL;

const sqlV1 = neon(V1_DB);
const sqlV2 = neon(V2_DB);

async function findRelocationArticles() {
  console.log('=== FINDING RELOCATION ARTICLES IN V1 ===\n');

  // Keywords that indicate relocation content
  const relocationKeywords = [
    'relocation', 'relocate', 'moving to', 'move to', 'expat', 'expatriate',
    'digital nomad', 'visa', 'immigration', 'emigrate', 'abroad', 'overseas',
    'cost of living', 'portugal', 'spain', 'dubai', 'cyprus', 'malta', 'greece',
    'thailand', 'bali', 'indonesia', 'mexico', 'germany', 'netherlands', 'france',
    'uk', 'united kingdom', 'australia', 'new zealand', 'canada', 'italy',
    'remote work visa', 'golden visa', 'd7 visa', 'tax', 'residency'
  ];

  // Get V1 articles with relocation-related content
  console.log('1. RELOCATION-RELATED ARTICLES IN V1:');
  try {
    const v1Articles = await sqlV1`
      SELECT id, slug, title, article_mode, country, excerpt
      FROM articles
      WHERE (
        LOWER(title) LIKE '%relocation%'
        OR LOWER(title) LIKE '%moving to%'
        OR LOWER(title) LIKE '%expat%'
        OR LOWER(title) LIKE '%digital nomad%'
        OR LOWER(title) LIKE '%visa%'
        OR LOWER(title) LIKE '%cost of living%'
        OR LOWER(title) LIKE '%abroad%'
        OR country IS NOT NULL
      )
      ORDER BY published_at DESC NULLS LAST
    `;
    console.log(`   Found ${v1Articles.length} potential relocation articles in V1`);

    // Show sample
    console.log('\n   Sample V1 relocation articles:');
    v1Articles.slice(0, 15).forEach(a => {
      console.log(`     - ${a.title}`);
      console.log(`       Mode: ${a.article_mode || 'N/A'} | Country: ${a.country || 'General'}`);
    });
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Get V2 article slugs for comparison
  console.log('\n\n2. CHECKING WHICH V1 ARTICLES ARE ALREADY IN V2:');
  try {
    const v2Slugs = await sqlV2`SELECT slug FROM articles`;
    const v2SlugSet = new Set(v2Slugs.map(a => a.slug));
    console.log(`   V2 has ${v2SlugSet.size} articles`);

    // Get all V1 relocation articles
    const v1Relocation = await sqlV1`
      SELECT id, slug, title, article_mode, country, excerpt, content, content_text, hero_image_url
      FROM articles
      WHERE (
        LOWER(title) LIKE '%relocation%'
        OR LOWER(title) LIKE '%moving to%'
        OR LOWER(title) LIKE '%expat%'
        OR LOWER(title) LIKE '%digital nomad%'
        OR LOWER(title) LIKE '%visa%'
        OR LOWER(title) LIKE '%cost of living%'
        OR LOWER(title) LIKE '%portugal%'
        OR LOWER(title) LIKE '%spain%'
        OR LOWER(title) LIKE '%cyprus%'
        OR LOWER(title) LIKE '%dubai%'
        OR LOWER(title) LIKE '%thailand%'
        OR LOWER(title) LIKE '%bali%'
        OR LOWER(title) LIKE '%mexico%'
        OR LOWER(title) LIKE '%germany%'
        OR LOWER(title) LIKE '%italy%'
        OR LOWER(title) LIKE '%greece%'
        OR LOWER(title) LIKE '%malta%'
        OR country IS NOT NULL
      )
    `;

    // Find articles NOT in V2
    const missing = v1Relocation.filter(a => !v2SlugSet.has(a.slug));
    console.log(`   ${missing.length} V1 relocation articles NOT in V2`);

    console.log('\n   MISSING ARTICLES (first 20):');
    missing.slice(0, 20).forEach(a => {
      console.log(`     - ${a.title}`);
      console.log(`       Slug: ${a.slug} | Country: ${a.country || 'N/A'}`);
    });

    // Save missing articles for migration
    if (missing.length > 0) {
      const outputPath = path.join(__dirname, 'missing-articles.json');
      fs.writeFileSync(outputPath, JSON.stringify(missing, null, 2));
      console.log(`\n   Saved ${missing.length} missing articles to ${outputPath}`);
    }

  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Check for articles by app field
  console.log('\n\n3. V1 ARTICLES BY APP FIELD:');
  try {
    const appCounts = await sqlV1`
      SELECT app, COUNT(*) as count
      FROM articles
      GROUP BY app
      ORDER BY count DESC
    `;
    appCounts.forEach(a => console.log(`   - ${a.app || 'null'}: ${a.count}`));
  } catch (e) {
    console.log(`   No app field or error: ${e.message}`);
  }

  console.log('\n=== SEARCH COMPLETE ===');
}

findRelocationArticles().catch(console.error);
