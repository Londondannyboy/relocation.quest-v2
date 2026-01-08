/**
 * Check V1 articles table schema
 */
const { neon } = require('@neondatabase/serverless');

const V1_DB = 'postgresql://neondb_owner:npg_LjBNF17HSTix@ep-green-smoke-ab3vtnw9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sqlV1 = neon(V1_DB);

async function checkSchema() {
  console.log('V1 ARTICLES COLUMNS:');
  const cols = await sqlV1`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'articles'
    ORDER BY ordinal_position
  `;
  cols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

  console.log('\nV1 JOBS COLUMNS:');
  const jobCols = await sqlV1`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position
  `;
  jobCols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

  console.log('\nV1 COMPANIES COLUMNS:');
  const companyCols = await sqlV1`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'companies'
    ORDER BY ordinal_position
  `;
  companyCols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));
}

checkSchema().catch(console.error);
