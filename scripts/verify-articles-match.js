/**
 * Verify V1 relocation articles match V2 articles
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

const V1_DB = 'postgresql://neondb_owner:npg_LjBNF17HSTix@ep-green-smoke-ab3vtnw9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const V2_DB = process.env.DATABASE_URL;

const sqlV1 = neon(V1_DB);
const sqlV2 = neon(V2_DB);

async function verify() {
  console.log('=== VERIFYING ARTICLE MATCH ===\n');

  // Get V1 relocation articles
  const v1Articles = await sqlV1`
    SELECT slug, title, country
    FROM articles
    WHERE app = 'relocation'
    ORDER BY slug
  `;
  console.log(`V1 relocation articles: ${v1Articles.length}`);

  // Get V2 articles
  const v2Articles = await sqlV2`
    SELECT slug, title, country
    FROM articles
    ORDER BY slug
  `;
  console.log(`V2 articles: ${v2Articles.length}`);

  // Create sets for comparison
  const v1Slugs = new Set(v1Articles.map(a => a.slug));
  const v2Slugs = new Set(v2Articles.map(a => a.slug));

  // Find articles in V1 but not V2
  const inV1NotV2 = v1Articles.filter(a => !v2Slugs.has(a.slug));
  console.log(`\nIn V1 but NOT in V2: ${inV1NotV2.length}`);
  if (inV1NotV2.length > 0) {
    console.log('  Missing from V2:');
    inV1NotV2.slice(0, 10).forEach(a => console.log(`    - ${a.title} (${a.slug})`));
    if (inV1NotV2.length > 10) console.log(`    ... and ${inV1NotV2.length - 10} more`);
  }

  // Find articles in V2 but not V1
  const inV2NotV1 = v2Articles.filter(a => !v1Slugs.has(a.slug));
  console.log(`\nIn V2 but NOT in V1: ${inV2NotV1.length}`);
  if (inV2NotV1.length > 0) {
    console.log('  Extra in V2:');
    inV2NotV1.slice(0, 10).forEach(a => console.log(`    - ${a.title} (${a.slug})`));
    if (inV2NotV1.length > 10) console.log(`    ... and ${inV2NotV1.length - 10} more`);
  }

  // Check destination coverage
  console.log('\n\n=== DESTINATION COVERAGE ===');

  const destinations = [
    'Portugal', 'Spain', 'Cyprus', 'Dubai', 'Canada', 'Australia',
    'UK', 'United Kingdom', 'New Zealand', 'France', 'Germany', 'Netherlands',
    'Mexico', 'Thailand', 'Malta', 'Greece', 'Italy', 'Indonesia', 'Bali'
  ];

  console.log('\nV2 articles per destination:');
  for (const dest of destinations) {
    const count = await sqlV2`
      SELECT COUNT(*) as count
      FROM articles
      WHERE LOWER(country) LIKE LOWER(${`%${dest}%`})
         OR LOWER(title) LIKE LOWER(${`%${dest}%`})
    `;
    const num = parseInt(count[0].count);
    if (num > 0) {
      console.log(`   ${dest}: ${num} articles`);
    } else {
      console.log(`   ${dest}: ⚠️ NO ARTICLES`);
    }
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify().catch(console.error);
