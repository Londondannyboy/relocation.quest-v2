/**
 * Audit V1 Database - Check what tables and data exist in the original Neon DB
 *
 * Run with: node scripts/audit-v1-database.js
 */

const { neon } = require('@neondatabase/serverless');

// V1 DATABASE URL (from relocation.quest/.env.local)
const V1_DATABASE_URL = 'postgresql://neondb_owner:npg_LjBNF17HSTix@ep-green-smoke-ab3vtnw9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(V1_DATABASE_URL);

async function audit() {
  console.log('=== V1 DATABASE AUDIT ===\n');

  // 1. List all tables
  console.log('1. ALL TABLES IN V1 DATABASE:');
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  tables.forEach(t => console.log(`   - ${t.table_name}`));

  // 2. Count records in key tables
  console.log('\n2. RECORD COUNTS:');

  const tablesToCount = [
    'articles', 'jobs', 'companies', 'users', 'skills',
    'user_skills', 'user_experiences', 'user_qualifications',
    'user_job_preferences', 'contact_submissions', 'employer_companies'
  ];

  for (const table of tablesToCount) {
    try {
      const result = await sql.unsafe(`SELECT COUNT(*) as count FROM "${table}"`);
      console.log(`   - ${table}: ${result[0].count} records`);
    } catch (e) {
      console.log(`   - ${table}: NOT FOUND or ERROR`);
    }
  }

  // 3. Jobs sample
  console.log('\n3. JOBS SAMPLE (first 5):');
  try {
    const jobs = await sql`
      SELECT id, title, company_name, location, is_remote, is_fractional, role_category
      FROM jobs
      WHERE is_active = true
      ORDER BY posted_date DESC NULLS LAST
      LIMIT 5
    `;
    jobs.forEach(j => {
      const tags = [];
      if (j.is_remote) tags.push('Remote');
      if (j.is_fractional) tags.push('Fractional');
      console.log(`   - ${j.title} at ${j.company_name}`);
      console.log(`     Location: ${j.location || 'Not specified'} | Category: ${j.role_category || 'N/A'}`);
      if (tags.length) console.log(`     Tags: ${tags.join(', ')}`);
    });
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // 4. Companies sample
  console.log('\n4. COMPANIES SAMPLE (first 5):');
  try {
    const companies = await sql`
      SELECT id, name, slug, company_type, status, headquarters
      FROM companies
      WHERE status = 'published'
      LIMIT 5
    `;
    companies.forEach(c => {
      console.log(`   - ${c.name} (${c.company_type || 'N/A'})`);
      console.log(`     Slug: ${c.slug} | HQ: ${c.headquarters || 'N/A'}`);
    });
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // 5. Jobs breakdown by category
  console.log('\n5. JOBS BY CATEGORY:');
  try {
    const categories = await sql`
      SELECT role_category, COUNT(*) as count
      FROM jobs
      WHERE is_active = true
      GROUP BY role_category
      ORDER BY count DESC
    `;
    categories.forEach(c => console.log(`   - ${c.role_category || 'Uncategorized'}: ${c.count}`));
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // 6. Check articles
  console.log('\n6. ARTICLES SAMPLE (first 3):');
  try {
    const articles = await sql`
      SELECT id, title, article_mode, country
      FROM articles
      ORDER BY published_at DESC NULLS LAST
      LIMIT 3
    `;
    articles.forEach(a => console.log(`   - ${a.title} [${a.article_mode}] - ${a.country || 'General'}`));
  } catch (e) {
    console.log(`   No articles table or error: ${e.message}`);
  }

  // 7. Check users
  console.log('\n7. USERS COUNT:');
  try {
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`   Total users: ${users[0].count}`);
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  console.log('\n=== V1 AUDIT COMPLETE ===');
}

audit().catch(console.error);
