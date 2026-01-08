/**
 * Full V1 to V2 Content Migration
 *
 * Migrates all content from relocation.quest (V1) to relocation.quest-v2 (V2)
 *
 * Run with: node scripts/full-migration.js
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

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateArticles() {
  console.log('\n=== MIGRATING ARTICLES ===');

  // Get V1 relocation articles (using correct column names from V1 schema)
  const v1Articles = await sqlV1`
    SELECT id, slug, title, excerpt, content, content_html, hero_asset_url, country,
           article_mode, category, is_featured, published_at, meta_description,
           word_count, country_code
    FROM articles
    WHERE app = 'relocation'
  `;
  console.log(`Found ${v1Articles.length} relocation articles in V1`);

  // Get existing V2 slugs
  const v2Slugs = await sqlV2`SELECT slug FROM articles`;
  const existingSlugs = new Set(v2Slugs.map(a => a.slug));
  console.log(`V2 currently has ${existingSlugs.size} articles`);

  // Find missing articles
  const missing = v1Articles.filter(a => !existingSlugs.has(a.slug));
  console.log(`${missing.length} articles need to be migrated`);

  if (missing.length === 0) {
    console.log('✓ All relocation articles already in V2');
    return;
  }

  // Migrate missing articles
  let migrated = 0;
  for (const article of missing) {
    try {
      // Use content_html if available, otherwise content
      const contentToUse = article.content_html || article.content;

      await sqlV2`
        INSERT INTO articles (
          slug, title, excerpt, content, hero_image_url, country,
          article_mode, category, is_featured, published_at
        ) VALUES (
          ${article.slug},
          ${article.title},
          ${article.excerpt},
          ${contentToUse},
          ${article.hero_asset_url},
          ${article.country},
          ${article.article_mode},
          ${article.category},
          ${article.is_featured || false},
          ${article.published_at}
        )
      `;
      migrated++;
      if (migrated % 10 === 0) {
        console.log(`  Migrated ${migrated}/${missing.length}...`);
      }
    } catch (e) {
      console.log(`  ✗ Error migrating ${article.slug}: ${e.message}`);
    }
  }

  console.log(`✓ Migrated ${migrated} articles`);
}

async function createCompaniesTable() {
  console.log('\n=== CREATING COMPANIES TABLE ===');

  try {
    await sqlV2`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        headquarters VARCHAR(255),
        specializations TEXT[],
        overview TEXT,
        meta_description TEXT,
        website VARCHAR(500),
        logo_url TEXT,
        fee VARCHAR(100),
        featured BOOLEAN DEFAULT false,
        highlights TEXT[],
        company_type VARCHAR(100),
        app VARCHAR(50) DEFAULT 'relocation',
        status VARCHAR(50) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Companies table created/exists');
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function migrateCompanies() {
  console.log('\n=== MIGRATING COMPANIES ===');

  // Get V1 relocation companies
  const v1Companies = await sqlV1`
    SELECT id, slug, name, description, headquarters, specializations,
           overview, meta_description, payload, company_type, app, status
    FROM companies
    WHERE app = 'relocation' AND status = 'published'
  `;
  console.log(`Found ${v1Companies.length} relocation companies in V1`);

  if (v1Companies.length === 0) {
    console.log('No relocation companies to migrate');
    return;
  }

  // Check existing in V2
  let existingSlugs = new Set();
  try {
    const v2Companies = await sqlV2`SELECT slug FROM companies`;
    existingSlugs = new Set(v2Companies.map(c => c.slug));
  } catch (e) {
    // Table might not exist yet
  }

  const missing = v1Companies.filter(c => !existingSlugs.has(c.slug));
  console.log(`${missing.length} companies need to be migrated`);

  let migrated = 0;
  for (const company of missing) {
    try {
      const payload = company.payload || {};
      await sqlV2`
        INSERT INTO companies (
          slug, name, description, headquarters, specializations,
          overview, meta_description, website, fee, featured,
          highlights, company_type, app, status
        ) VALUES (
          ${company.slug},
          ${company.name},
          ${company.description},
          ${company.headquarters},
          ${company.specializations},
          ${company.overview},
          ${company.meta_description},
          ${payload.website || null},
          ${payload.fee || null},
          ${payload.featured || false},
          ${payload.highlights || null},
          ${company.company_type},
          ${company.app},
          ${company.status}
        )
      `;
      migrated++;
      console.log(`  ✓ Migrated: ${company.name}`);
    } catch (e) {
      console.log(`  ✗ Error migrating ${company.name}: ${e.message}`);
    }
  }

  console.log(`✓ Migrated ${migrated} companies`);
}

async function createJobsTable() {
  console.log('\n=== CREATING JOBS TABLE ===');

  try {
    await sqlV2`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE,
        title VARCHAR(500) NOT NULL,
        company_name VARCHAR(255),
        company_domain VARCHAR(255),
        location VARCHAR(255),
        is_remote BOOLEAN DEFAULT false,
        is_fractional BOOLEAN DEFAULT false,
        workplace_type VARCHAR(50),
        salary_min INTEGER,
        salary_max INTEGER,
        salary_currency VARCHAR(10) DEFAULT 'GBP',
        compensation TEXT,
        posted_date TIMESTAMP,
        url TEXT,
        description_snippet TEXT,
        role_category VARCHAR(100),
        skills_required TEXT[],
        is_active BOOLEAN DEFAULT true,
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Jobs table created/exists');

    // Create index for faster searches
    await sqlV2`
      CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active)
    `;
    await sqlV2`
      CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(role_category)
    `;
    console.log('✓ Jobs indexes created');
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function migrateJobs() {
  console.log('\n=== MIGRATING JOBS ===');

  // Get V1 active jobs (using correct column names from V1 schema)
  const v1Jobs = await sqlV1`
    SELECT id, slug, title, company_name, company_domain, location,
           is_remote, is_fractional, workplace_type, salary_min, salary_max,
           salary_currency, compensation, posted_date, url, description_snippet,
           role_category, skills_required, is_active, job_source
    FROM jobs
    WHERE is_active = true
    LIMIT 500
  `;
  console.log(`Found ${v1Jobs.length} active jobs in V1`);

  if (v1Jobs.length === 0) {
    console.log('No jobs to migrate');
    return;
  }

  // Check existing
  let existingSlugs = new Set();
  try {
    const v2Jobs = await sqlV2`SELECT slug FROM jobs`;
    existingSlugs = new Set(v2Jobs.filter(j => j.slug).map(j => j.slug));
  } catch (e) {
    // Table might be empty
  }

  let migrated = 0;
  let skipped = 0;

  for (const job of v1Jobs) {
    if (job.slug && existingSlugs.has(job.slug)) {
      skipped++;
      continue;
    }

    try {
      await sqlV2`
        INSERT INTO jobs (
          slug, title, company_name, company_domain, location,
          is_remote, is_fractional, workplace_type, salary_min, salary_max,
          salary_currency, compensation, posted_date, url, description_snippet,
          role_category, skills_required, is_active, source
        ) VALUES (
          ${job.slug},
          ${job.title},
          ${job.company_name},
          ${job.company_domain},
          ${job.location},
          ${job.is_remote || false},
          ${job.is_fractional || false},
          ${job.workplace_type},
          ${job.salary_min},
          ${job.salary_max},
          ${job.salary_currency || 'GBP'},
          ${job.compensation},
          ${job.posted_date},
          ${job.url},
          ${job.description_snippet},
          ${job.role_category}::text,
          ${job.skills_required},
          ${job.is_active},
          ${job.job_source}
        )
      `;
      migrated++;
      if (migrated % 50 === 0) {
        console.log(`  Migrated ${migrated} jobs...`);
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message.slice(0, 80)}`);
    }
  }

  console.log(`✓ Migrated ${migrated} jobs (skipped ${skipped} existing)`);
}

async function createContactSubmissionsTable() {
  console.log('\n=== CREATING CONTACT_SUBMISSIONS TABLE ===');

  try {
    await sqlV2`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        submission_type VARCHAR(20),
        full_name VARCHAR(255),
        email VARCHAR(255),
        company_name VARCHAR(255),
        company_website VARCHAR(500),
        user_role VARCHAR(255),
        linkedin_url VARCHAR(500),
        phone VARCHAR(50),
        job_title VARCHAR(255),
        message TEXT,
        newsletter_opt_in BOOLEAN DEFAULT false,
        schedule_call BOOLEAN DEFAULT false,
        site VARCHAR(50) DEFAULT 'relocation',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        notes TEXT
      )
    `;
    console.log('✓ Contact submissions table created/exists');
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function createSkillsTable() {
  console.log('\n=== CREATING SKILLS TABLE ===');

  try {
    await sqlV2`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Skills table created/exists');
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function migrateSkills() {
  console.log('\n=== MIGRATING SKILLS ===');

  try {
    const v1Skills = await sqlV1`
      SELECT name, category FROM skills LIMIT 500
    `;
    console.log(`Found ${v1Skills.length} skills in V1`);

    if (v1Skills.length === 0) return;

    let migrated = 0;
    for (const skill of v1Skills) {
      try {
        await sqlV2`
          INSERT INTO skills (name, category)
          VALUES (${skill.name}, ${skill.category})
          ON CONFLICT (name) DO NOTHING
        `;
        migrated++;
      } catch (e) {
        // Ignore duplicates
      }
    }
    console.log(`✓ Migrated ${migrated} skills`);
  } catch (e) {
    console.log(`  Skills table might not exist in V1: ${e.message}`);
  }
}

async function verifyMigration() {
  console.log('\n=== VERIFICATION ===');

  // Check each table individually
  try {
    const articles = await sqlV2`SELECT COUNT(*) as count FROM articles`;
    console.log(`   articles: ${articles[0].count} records`);
  } catch (e) { console.log(`   articles: ERROR`); }

  try {
    const destinations = await sqlV2`SELECT COUNT(*) as count FROM destinations`;
    console.log(`   destinations: ${destinations[0].count} records`);
  } catch (e) { console.log(`   destinations: ERROR`); }

  try {
    const topic_images = await sqlV2`SELECT COUNT(*) as count FROM topic_images`;
    console.log(`   topic_images: ${topic_images[0].count} records`);
  } catch (e) { console.log(`   topic_images: ERROR`); }

  try {
    const companies = await sqlV2`SELECT COUNT(*) as count FROM companies`;
    console.log(`   companies: ${companies[0].count} records`);
  } catch (e) { console.log(`   companies: TABLE NOT FOUND`); }

  try {
    const jobs = await sqlV2`SELECT COUNT(*) as count FROM jobs`;
    console.log(`   jobs: ${jobs[0].count} records`);
  } catch (e) { console.log(`   jobs: TABLE NOT FOUND`); }

  try {
    const skills = await sqlV2`SELECT COUNT(*) as count FROM skills`;
    console.log(`   skills: ${skills[0].count} records`);
  } catch (e) { console.log(`   skills: TABLE NOT FOUND`); }

  try {
    const contacts = await sqlV2`SELECT COUNT(*) as count FROM contact_submissions`;
    console.log(`   contact_submissions: ${contacts[0].count} records`);
  } catch (e) { console.log(`   contact_submissions: TABLE NOT FOUND`); }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('========================================');
  console.log('  FULL V1 → V2 MIGRATION');
  console.log('========================================');
  console.log(`V1: ${V1_DB.split('@')[1].split('/')[0]}`);
  console.log(`V2: ${V2_DB.split('@')[1].split('/')[0]}`);

  try {
    // 1. Migrate articles
    await migrateArticles();

    // 2. Create and migrate companies
    await createCompaniesTable();
    await migrateCompanies();

    // 3. Create and migrate jobs
    await createJobsTable();
    await migrateJobs();

    // 4. Create contact submissions table
    await createContactSubmissionsTable();

    // 5. Create and migrate skills
    await createSkillsTable();
    await migrateSkills();

    // 6. Verify
    await verifyMigration();

    console.log('\n========================================');
    console.log('  MIGRATION COMPLETE');
    console.log('========================================');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
