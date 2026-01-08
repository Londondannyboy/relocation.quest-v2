/**
 * Audit Database - Check what tables and data exist in Neon
 *
 * Run with: node scripts/audit-database.js
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

async function audit() {
  console.log('=== DATABASE AUDIT ===\n');

  // 1. List all tables
  console.log('1. ALL TABLES IN DATABASE:');
  const tables = await sql`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  tables.forEach(t => console.log(`   - ${t.table_name} (${t.table_type})`));

  // 2. Count records in key tables
  console.log('\n2. RECORD COUNTS:');

  const tablesToCount = [
    'articles', 'destinations', 'topic_images', 'users', 'user_data',
    'jobs', 'companies', 'skills', 'user_skills', 'user_experiences',
    'user_qualifications', 'user_job_preferences', 'contact_submissions',
    'employer_companies', 'user_conversations'
  ];

  for (const table of tablesToCount) {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
      console.log(`   - ${table}: ${result[0].count} records`);
    } catch (e) {
      console.log(`   - ${table}: TABLE NOT FOUND`);
    }
  }

  // 3. Check jobs table structure if it exists
  console.log('\n3. JOBS TABLE STRUCTURE (if exists):');
  try {
    const jobsCols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      ORDER BY ordinal_position
    `;
    if (jobsCols.length > 0) {
      jobsCols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));
    } else {
      console.log('   Jobs table exists but no columns found');
    }
  } catch (e) {
    console.log('   Jobs table does not exist');
  }

  // 4. Check companies table structure if it exists
  console.log('\n4. COMPANIES TABLE STRUCTURE (if exists):');
  try {
    const companiesCols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'companies'
      ORDER BY ordinal_position
    `;
    if (companiesCols.length > 0) {
      companiesCols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));
    } else {
      console.log('   Companies table exists but no columns found');
    }
  } catch (e) {
    console.log('   Companies table does not exist');
  }

  // 5. Sample data from key tables
  console.log('\n5. SAMPLE DATA:');

  // Jobs sample
  try {
    const jobs = await sql`SELECT id, title, company_name, location FROM jobs LIMIT 3`;
    console.log(`\n   JOBS (first 3):`);
    jobs.forEach(j => console.log(`     - ${j.title} at ${j.company_name} (${j.location})`));
  } catch (e) {
    console.log('   No jobs data available');
  }

  // Companies sample
  try {
    const companies = await sql`SELECT id, name, slug, company_type FROM companies LIMIT 3`;
    console.log(`\n   COMPANIES (first 3):`);
    companies.forEach(c => console.log(`     - ${c.name} (${c.company_type}) - ${c.slug}`));
  } catch (e) {
    console.log('   No companies data available');
  }

  // Articles sample (to verify)
  try {
    const articles = await sql`SELECT id, title, article_mode, country FROM articles LIMIT 3`;
    console.log(`\n   ARTICLES (first 3):`);
    articles.forEach(a => console.log(`     - ${a.title} [${a.article_mode}] - ${a.country || 'General'}`));
  } catch (e) {
    console.log('   No articles data available');
  }

  // Destinations sample
  try {
    const dests = await sql`SELECT slug, country_name, region FROM destinations ORDER BY priority DESC LIMIT 5`;
    console.log(`\n   DESTINATIONS (first 5):`);
    dests.forEach(d => console.log(`     - ${d.country_name} (${d.region}) - /${d.slug}`));
  } catch (e) {
    console.log('   No destinations data available');
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

audit().catch(console.error);
