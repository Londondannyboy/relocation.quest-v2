/**
 * Compare Articles in V1 vs V2
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

async function compare() {
  console.log('=== ARTICLE COMPARISON ===\n');

  // V1 Articles
  console.log('V1 ARTICLES (by article_mode):');
  try {
    const v1Modes = await sqlV1`
      SELECT article_mode, COUNT(*) as count
      FROM articles
      GROUP BY article_mode
      ORDER BY count DESC
    `;
    v1Modes.forEach(m => console.log(`   - ${m.article_mode || 'null'}: ${m.count}`));

    const v1Total = await sqlV1`SELECT COUNT(*) as count FROM articles`;
    console.log(`   TOTAL: ${v1Total[0].count}`);

    // Sample v1 titles
    console.log('\n   Sample V1 titles:');
    const v1Sample = await sqlV1`SELECT title FROM articles ORDER BY published_at DESC NULLS LAST LIMIT 5`;
    v1Sample.forEach(a => console.log(`     - ${a.title}`));
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // V2 Articles
  console.log('\n\nV2 ARTICLES (by article_mode):');
  try {
    const v2Modes = await sqlV2`
      SELECT article_mode, COUNT(*) as count
      FROM articles
      GROUP BY article_mode
      ORDER BY count DESC
    `;
    v2Modes.forEach(m => console.log(`   - ${m.article_mode || 'null'}: ${m.count}`));

    const v2Total = await sqlV2`SELECT COUNT(*) as count FROM articles`;
    console.log(`   TOTAL: ${v2Total[0].count}`);

    // Sample v2 titles
    console.log('\n   Sample V2 titles:');
    const v2Sample = await sqlV2`SELECT title FROM articles ORDER BY published_at DESC NULLS LAST LIMIT 5`;
    v2Sample.forEach(a => console.log(`     - ${a.title}`));
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // V2 Articles by country
  console.log('\n\nV2 ARTICLES BY COUNTRY:');
  try {
    const v2Countries = await sqlV2`
      SELECT country, COUNT(*) as count
      FROM articles
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY count DESC
      LIMIT 15
    `;
    v2Countries.forEach(c => console.log(`   - ${c.country}: ${c.count}`));
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  console.log('\n=== COMPARISON COMPLETE ===');
}

compare().catch(console.error);
