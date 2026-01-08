/**
 * Add More Destinations - Malta, Greece, Italy, Indonesia
 *
 * Run with: node scripts/add-more-destinations.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load env from .env.local manually
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

const destinations = [
  // 1. MALTA
  {
    slug: 'malta',
    country_name: 'Malta',
    flag: '🇲🇹',
    region: 'Southern Europe',
    language: 'English, Maltese',
    hero_title: 'Moving to Malta',
    hero_subtitle: 'Complete relocation guide for Malta including visas, low taxes, and Mediterranean lifestyle.',
    hero_gradient: 'from-red-600 to-white',
    hero_image_url: 'https://images.unsplash.com/photo-1555990538-1e6c89d83e64?w=1600',
    enabled: true,
    featured: true,
    priority: 14,
    quick_facts: [
      { label: 'Currency', value: 'EUR (€)', icon: '💶' },
      { label: 'Population', value: '520K', icon: '👥' },
      { label: 'Time Zone', value: 'CET (UTC+1)', icon: '🕐' },
      { label: 'Climate', value: 'Mediterranean', icon: '☀️' },
    ],
    highlights: [
      { text: 'English-speaking EU country', icon: '✓' },
      { text: 'Favorable tax regime', icon: '✓' },
      { text: 'Digital Nomad Residence Permit', icon: '✓' },
      { text: '300+ days of sunshine', icon: '✓' },
      { text: 'Strong iGaming & FinTech hub', icon: '✓' },
      { text: 'Safe and friendly', icon: '✓' },
      { text: 'EU passport path available', icon: '✓' },
    ],
    visas: [
      {
        name: 'Nomad Residence Permit',
        description: 'For remote workers earning from outside Malta',
        processingTime: '4-8 weeks',
        cost: '€300',
        requirements: ['€2,700/month income', 'Remote work for non-Maltese company', 'Health insurance', 'Clean criminal record'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'Global Residence Programme',
        description: 'Tax residency program for non-EU nationals',
        processingTime: '3-6 months',
        cost: '€6,000 application + €15,000/year min tax',
        requirements: ['€275,000 property purchase or €9,600/year rent', 'Health insurance', 'Stable income'],
        isWorkPermit: false,
        isResidencyPath: true,
      },
      {
        name: 'Key Employee Initiative',
        description: 'Fast-track work permit for highly skilled professionals',
        processingTime: '5-10 days',
        cost: '€280',
        requirements: ['Job offer in eligible sector', '€30,000+ salary', 'Relevant qualifications'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'Malta Permanent Residence Programme',
        description: 'Investment-based permanent residency',
        processingTime: '4-6 months',
        cost: '€68,000-98,000 contribution',
        requirements: ['€150,000 property purchase or €60,000 rent', '€500,000 assets', 'Clean criminal record'],
        isWorkPermit: false,
        isResidencyPath: true,
      },
    ],
    cost_of_living: [
      { cityName: 'Valletta', rent1BRCenter: 1200, rent1BROutside: 900, rent3BRCenter: 2000, utilities: 100, groceries: 300, transportation: 50, dining: 250, costIndex: 70, currency: 'EUR' },
      { cityName: 'Sliema', rent1BRCenter: 1400, rent1BROutside: 1000, rent3BRCenter: 2200, utilities: 100, groceries: 300, transportation: 50, dining: 280, costIndex: 75, currency: 'EUR' },
      { cityName: 'St. Julian\'s', rent1BRCenter: 1500, rent1BROutside: 1100, rent3BRCenter: 2400, utilities: 100, groceries: 300, transportation: 50, dining: 300, costIndex: 78, currency: 'EUR' },
    ],
    job_market: {
      topIndustries: ['iGaming', 'Financial Services', 'Tourism', 'Maritime', 'Technology'],
      growingSectors: ['Blockchain/Crypto', 'FinTech', 'AI', 'Remote Work', 'Digital Marketing'],
      avgSalaryTech: 45000,
      avgWorkHoursWeek: 40,
      vacationDaysStandard: 24,
    },
    faqs: [
      { question: 'Is Malta good for digital nomads?', answer: 'Excellent! Malta has a dedicated Nomad Residence Permit, English is an official language, it\'s in the EU, has great weather year-round, and a growing community of remote workers. The tax situation can be very favorable.', category: 'visa' },
      { question: 'What are Malta\'s tax advantages?', answer: 'Malta offers several tax programs. Non-domiciled residents only pay tax on income remitted to Malta (not worldwide). The Global Residence Programme caps tax at 15% with a €15,000 minimum. There\'s no property tax, inheritance tax, or wealth tax.', category: 'tax' },
      { question: 'Is Malta expensive?', answer: 'Malta is moderate for the EU. Rent is the main expense (€900-1,500 for a 1BR). Dining out and groceries are reasonable. Overall, €2,000-3,000/month provides a comfortable lifestyle.', category: 'housing' },
    ],
    meta_title: 'Moving to Malta 2025: Visa Guide, Tax Benefits & Digital Nomad Life',
    meta_description: 'Complete guide to relocating to Malta. Nomad Residence Permit, favorable tax regime, English-speaking EU country, and Mediterranean lifestyle.',
  },

  // 2. GREECE
  {
    slug: 'greece',
    country_name: 'Greece',
    flag: '🇬🇷',
    region: 'Southern Europe',
    language: 'Greek (English in tourist areas)',
    hero_title: 'Moving to Greece',
    hero_subtitle: 'Complete relocation guide for Greece including Golden Visa, digital nomad visa, and island living.',
    hero_gradient: 'from-blue-600 to-white',
    hero_image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600',
    enabled: true,
    featured: true,
    priority: 15,
    quick_facts: [
      { label: 'Currency', value: 'EUR (€)', icon: '💶' },
      { label: 'Population', value: '10.4M', icon: '👥' },
      { label: 'Time Zone', value: 'EET (UTC+2)', icon: '🕐' },
      { label: 'Climate', value: 'Mediterranean', icon: '☀️' },
    ],
    highlights: [
      { text: 'Golden Visa from €250K', icon: '✓' },
      { text: 'Digital Nomad Visa available', icon: '✓' },
      { text: 'Affordable cost of living', icon: '✓' },
      { text: 'Beautiful islands and coastline', icon: '✓' },
      { text: 'EU membership', icon: '✓' },
      { text: 'Rich history and culture', icon: '✓' },
      { text: 'Excellent Mediterranean diet', icon: '✓' },
    ],
    visas: [
      {
        name: 'Digital Nomad Visa',
        description: 'For remote workers employed by non-Greek companies',
        processingTime: '2-4 weeks',
        cost: '€75',
        requirements: ['€3,500/month income', 'Remote work proof', 'Health insurance', 'Clean criminal record'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'Golden Visa',
        description: 'Residence through real estate investment',
        processingTime: '2-3 months',
        cost: '€250,000-500,000 property',
        requirements: ['Property investment (€250K outside Athens, €500K in Athens)', 'Health insurance', 'Clean criminal record'],
        isWorkPermit: false,
        isResidencyPath: true,
      },
      {
        name: 'Financially Independent Person Visa',
        description: 'For retirees and those with passive income',
        processingTime: '2-4 weeks',
        cost: '€150',
        requirements: ['€2,000/month income', 'Health insurance', 'Accommodation proof', 'No work in Greece'],
        isWorkPermit: false,
        isResidencyPath: true,
      },
      {
        name: 'Work Permit',
        description: 'Employer-sponsored work authorization',
        processingTime: '1-3 months',
        cost: '€150',
        requirements: ['Job offer from Greek employer', 'Relevant qualifications', 'Labor market test'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
    ],
    cost_of_living: [
      { cityName: 'Athens', rent1BRCenter: 700, rent1BROutside: 500, rent3BRCenter: 1200, utilities: 150, groceries: 250, transportation: 30, dining: 200, costIndex: 55, currency: 'EUR' },
      { cityName: 'Thessaloniki', rent1BRCenter: 500, rent1BROutside: 350, rent3BRCenter: 900, utilities: 130, groceries: 220, transportation: 25, dining: 180, costIndex: 48, currency: 'EUR' },
      { cityName: 'Crete', rent1BRCenter: 550, rent1BROutside: 400, rent3BRCenter: 950, utilities: 120, groceries: 230, transportation: 40, dining: 170, costIndex: 50, currency: 'EUR' },
    ],
    job_market: {
      topIndustries: ['Tourism', 'Shipping', 'Agriculture', 'Technology', 'Real Estate'],
      growingSectors: ['Tech Startups', 'Remote Work', 'Renewable Energy', 'Digital Marketing'],
      avgSalaryTech: 28000,
      avgWorkHoursWeek: 40,
      vacationDaysStandard: 20,
    },
    faqs: [
      { question: 'How much does the Greece Golden Visa cost?', answer: 'The minimum investment is €250,000 for properties outside Athens/Thessaloniki/Mykonos/Santorini. In these popular areas, the threshold is €500,000. This grants you 5-year renewable residence and Schengen travel.', category: 'visa' },
      { question: 'Can I live on the Greek islands?', answer: 'Yes! Many expats live on islands like Crete, Corfu, Rhodes, and the Cyclades. Costs are similar or lower than Athens. Internet is good in main towns. Winter populations are smaller but communities exist year-round.', category: 'lifestyle' },
      { question: 'Is Greece affordable for expats?', answer: 'Very affordable by EU standards. €1,500-2,000/month provides a good lifestyle in Athens. Islands and smaller cities can be even cheaper. Greece is roughly 30-40% cheaper than Western Europe.', category: 'housing' },
    ],
    meta_title: 'Moving to Greece 2025: Golden Visa, Digital Nomad Visa & Island Life',
    meta_description: 'Complete guide to relocating to Greece. Golden Visa from €250K, digital nomad visa, affordable Mediterranean living, and Greek island lifestyle.',
  },

  // 3. ITALY
  {
    slug: 'italy',
    country_name: 'Italy',
    flag: '🇮🇹',
    region: 'Southern Europe',
    language: 'Italian',
    hero_title: 'Moving to Italy',
    hero_subtitle: 'Complete relocation guide for Italy including the new digital nomad visa, elective residence, and la dolce vita.',
    hero_gradient: 'from-green-600 via-white to-red-600',
    hero_image_url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600',
    enabled: true,
    featured: false,
    priority: 16,
    quick_facts: [
      { label: 'Currency', value: 'EUR (€)', icon: '💶' },
      { label: 'Population', value: '59M', icon: '👥' },
      { label: 'Time Zone', value: 'CET (UTC+1)', icon: '🕐' },
      { label: 'Climate', value: 'Mediterranean/Alpine', icon: '☀️' },
    ],
    highlights: [
      { text: 'New Digital Nomad Visa (2024)', icon: '✓' },
      { text: 'World-renowned culture and cuisine', icon: '✓' },
      { text: 'Elective Residence for passive income', icon: '✓' },
      { text: '€1 house programs in rural areas', icon: '✓' },
      { text: 'EU membership', icon: '✓' },
      { text: 'Excellent healthcare system', icon: '✓' },
      { text: 'Diverse regions and climates', icon: '✓' },
    ],
    visas: [
      {
        name: 'Digital Nomad Visa',
        description: 'New visa for remote workers (launched 2024)',
        processingTime: '2-3 months',
        cost: '€116',
        requirements: ['€28,000/year minimum income', 'Remote work for non-Italian company', 'Health insurance', 'Accommodation', 'Clean criminal record'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'Elective Residence Visa',
        description: 'For retirees and those with passive income',
        processingTime: '2-3 months',
        cost: '€116',
        requirements: ['€31,000/year passive income', 'Accommodation proof', 'Health insurance', 'No employment in Italy'],
        isWorkPermit: false,
        isResidencyPath: true,
      },
      {
        name: 'Self-Employment Visa',
        description: 'For freelancers and entrepreneurs',
        processingTime: '3-6 months',
        cost: '€116',
        requirements: ['Business plan', '€8,500+ available funds', 'Accommodation', 'Italian chamber of commerce registration'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'EU Blue Card',
        description: 'For highly qualified professionals',
        processingTime: '2-3 months',
        cost: '€116',
        requirements: ['Job offer', 'University degree', 'Minimum €24,789 salary', 'Health insurance'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
    ],
    cost_of_living: [
      { cityName: 'Milan', rent1BRCenter: 1400, rent1BROutside: 900, rent3BRCenter: 2400, utilities: 180, groceries: 350, transportation: 39, dining: 300, costIndex: 80, currency: 'EUR' },
      { cityName: 'Rome', rent1BRCenter: 1100, rent1BROutside: 700, rent3BRCenter: 1800, utilities: 160, groceries: 300, transportation: 35, dining: 250, costIndex: 70, currency: 'EUR' },
      { cityName: 'Florence', rent1BRCenter: 1000, rent1BROutside: 700, rent3BRCenter: 1600, utilities: 150, groceries: 280, transportation: 35, dining: 220, costIndex: 68, currency: 'EUR' },
    ],
    job_market: {
      topIndustries: ['Fashion', 'Automotive', 'Tourism', 'Food & Beverage', 'Manufacturing'],
      growingSectors: ['Tech Startups', 'Green Energy', 'E-commerce', 'Design', 'Remote Work'],
      avgSalaryTech: 38000,
      avgWorkHoursWeek: 40,
      vacationDaysStandard: 26,
    },
    faqs: [
      { question: 'Does Italy have a digital nomad visa?', answer: 'Yes! Italy launched its Digital Nomad Visa in April 2024. You need €28,000/year minimum income from remote work for non-Italian companies. The visa is valid for 1 year, renewable, and can lead to long-term residence.', category: 'visa' },
      { question: 'Do I need to speak Italian?', answer: 'For daily life outside major tourist areas, Italian is very helpful. In Milan, Rome, and Florence, you can manage with English. Learning Italian will significantly improve your experience and is required for some visa renewals.', category: 'lifestyle' },
      { question: 'What are the €1 house programs?', answer: 'Several Italian towns (mostly in Sicily, Sardinia, and southern regions) sell abandoned houses for €1 to attract new residents. You must commit to renovating within 3 years. Renovation costs typically €20,000-50,000+.', category: 'housing' },
    ],
    meta_title: 'Moving to Italy 2025: Digital Nomad Visa, Elective Residence & La Dolce Vita',
    meta_description: 'Complete guide to relocating to Italy. New digital nomad visa, elective residence, €1 houses, and Italian lifestyle guide.',
  },

  // 4. INDONESIA (Bali Focus)
  {
    slug: 'indonesia',
    country_name: 'Indonesia',
    flag: '🇮🇩',
    region: 'Southeast Asia',
    language: 'Indonesian (English in Bali)',
    hero_title: 'Moving to Indonesia',
    hero_subtitle: 'Complete relocation guide for Indonesia and Bali including the new digital nomad visa, cost of living, and tropical lifestyle.',
    hero_gradient: 'from-red-600 to-white',
    hero_image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
    enabled: true,
    featured: true,
    priority: 17,
    quick_facts: [
      { label: 'Currency', value: 'IDR (Rp)', icon: '💵' },
      { label: 'Population', value: '275M', icon: '👥' },
      { label: 'Time Zone', value: 'WIB/WITA/WIT', icon: '🕐' },
      { label: 'Climate', value: 'Tropical', icon: '🌴' },
    ],
    highlights: [
      { text: 'New Digital Nomad Visa (E33G)', icon: '✓' },
      { text: 'Very low cost of living', icon: '✓' },
      { text: 'Bali - world\'s top nomad destination', icon: '✓' },
      { text: 'Beautiful beaches and nature', icon: '✓' },
      { text: 'Strong expat community', icon: '✓' },
      { text: 'Excellent coworking spaces', icon: '✓' },
      { text: 'Tax-free for remote income', icon: '✓' },
    ],
    visas: [
      {
        name: 'Digital Nomad Visa (E33G)',
        description: 'New 5-year visa for remote workers (launched 2024)',
        processingTime: '2-4 weeks',
        cost: '$350-500',
        requirements: ['$60,000/year income', 'Remote work for foreign company', 'Health insurance', 'Clean criminal record'],
        isWorkPermit: true,
        isResidencyPath: false,
      },
      {
        name: 'B211A Social/Business Visa',
        description: 'Popular option before digital nomad visa, allows 60-day stays',
        processingTime: '3-5 days',
        cost: '$300-400 (via agent)',
        requirements: ['Passport valid 18+ months', 'Sponsor (agent)', 'Return ticket'],
        isWorkPermit: false,
        isResidencyPath: false,
      },
      {
        name: 'Second Home Visa',
        description: 'For wealthy individuals to stay 5-10 years',
        processingTime: '2-4 weeks',
        cost: '$100 visa + $130,000 proof of funds',
        requirements: ['$130,000 in Indonesian bank OR property', 'Health insurance', 'Clean criminal record'],
        isWorkPermit: false,
        isResidencyPath: false,
      },
      {
        name: 'Retirement Visa (KITAS)',
        description: 'For retirees 55+ years old',
        processingTime: '4-8 weeks',
        cost: '$1,200-2,000',
        requirements: ['Age 55+', '$1,500/month pension or $18,000 savings', 'Rent property', 'Indonesian health insurance'],
        isWorkPermit: false,
        isResidencyPath: true,
      },
    ],
    cost_of_living: [
      { cityName: 'Bali (Canggu)', rent1BRCenter: 600, rent1BROutside: 400, rent3BRCenter: 1200, utilities: 80, groceries: 200, transportation: 100, dining: 200, costIndex: 35, currency: 'USD' },
      { cityName: 'Bali (Ubud)', rent1BRCenter: 450, rent1BROutside: 300, rent3BRCenter: 900, utilities: 60, groceries: 180, transportation: 80, dining: 150, costIndex: 28, currency: 'USD' },
      { cityName: 'Jakarta', rent1BRCenter: 700, rent1BROutside: 400, rent3BRCenter: 1300, utilities: 100, groceries: 200, transportation: 50, dining: 150, costIndex: 35, currency: 'USD' },
    ],
    job_market: {
      topIndustries: ['Tourism', 'E-commerce', 'Manufacturing', 'Agriculture', 'Mining'],
      growingSectors: ['Tech Startups', 'Remote Work', 'Digital Marketing', 'Content Creation', 'Wellness/Yoga'],
      avgSalaryTech: 15000,
      avgWorkHoursWeek: 40,
      vacationDaysStandard: 12,
    },
    faqs: [
      { question: 'Does Indonesia have a digital nomad visa?', answer: 'Yes! Indonesia launched the E33G Digital Nomad Visa in 2024. It\'s valid for 5 years, requires $60,000/year income, and importantly - remote income is TAX-FREE. You cannot work for Indonesian companies on this visa.', category: 'visa' },
      { question: 'How much does it cost to live in Bali?', answer: 'You can live comfortably in Bali on $1,500-2,500/month. A basic but good lifestyle runs $1,000-1,500. Luxury living with private villas and daily dining out is $3,000-5,000. Canggu is most expensive, Ubud and east coast are cheaper.', category: 'housing' },
      { question: 'Is Bali safe for digital nomads?', answer: 'Very safe! Bali has a huge international community, excellent infrastructure for remote workers, reliable internet, and countless coworking spaces. Crime against foreigners is rare. Main concerns are scooter accidents and petty theft.', category: 'lifestyle' },
    ],
    meta_title: 'Moving to Indonesia/Bali 2025: Digital Nomad Visa, Cost of Living & Island Life',
    meta_description: 'Complete guide to relocating to Indonesia and Bali. New E33G digital nomad visa, tax-free remote work, ultra-low cost of living, and tropical lifestyle.',
  },
];

async function migrate() {
  console.log('Adding more destinations...\n');

  for (const dest of destinations) {
    try {
      const existing = await sql`SELECT slug FROM destinations WHERE slug = ${dest.slug}`;

      if (existing.length > 0) {
        await sql`
          UPDATE destinations SET
            country_name = ${dest.country_name},
            flag = ${dest.flag},
            region = ${dest.region},
            language = ${dest.language},
            hero_title = ${dest.hero_title},
            hero_subtitle = ${dest.hero_subtitle},
            hero_gradient = ${dest.hero_gradient},
            hero_image_url = ${dest.hero_image_url},
            enabled = ${dest.enabled},
            featured = ${dest.featured},
            priority = ${dest.priority},
            quick_facts = ${JSON.stringify(dest.quick_facts)},
            highlights = ${JSON.stringify(dest.highlights)},
            visas = ${JSON.stringify(dest.visas)},
            cost_of_living = ${JSON.stringify(dest.cost_of_living)},
            job_market = ${JSON.stringify(dest.job_market)},
            faqs = ${JSON.stringify(dest.faqs)},
            meta_title = ${dest.meta_title},
            meta_description = ${dest.meta_description}
          WHERE slug = ${dest.slug}
        `;
        console.log(`✓ Updated: ${dest.country_name}`);
      } else {
        await sql`
          INSERT INTO destinations (
            slug, country_name, flag, region, language,
            hero_title, hero_subtitle, hero_gradient, hero_image_url,
            enabled, featured, priority,
            quick_facts, highlights, visas, cost_of_living, job_market, faqs,
            meta_title, meta_description
          ) VALUES (
            ${dest.slug}, ${dest.country_name}, ${dest.flag}, ${dest.region}, ${dest.language},
            ${dest.hero_title}, ${dest.hero_subtitle}, ${dest.hero_gradient}, ${dest.hero_image_url},
            ${dest.enabled}, ${dest.featured}, ${dest.priority},
            ${JSON.stringify(dest.quick_facts)}, ${JSON.stringify(dest.highlights)},
            ${JSON.stringify(dest.visas)}, ${JSON.stringify(dest.cost_of_living)},
            ${JSON.stringify(dest.job_market)}, ${JSON.stringify(dest.faqs)},
            ${dest.meta_title}, ${dest.meta_description}
          )
        `;
        console.log(`✓ Added: ${dest.country_name}`);
      }
    } catch (error) {
      console.error(`✗ Error with ${dest.country_name}:`, error.message);
    }
  }

  const count = await sql`SELECT COUNT(*) as total FROM destinations WHERE enabled = true`;
  console.log(`\nTotal destinations: ${count[0].total}`);

  const all = await sql`SELECT slug, country_name, featured FROM destinations ORDER BY priority DESC`;
  console.log('\nAll destinations:');
  all.forEach(d => console.log(`  ${d.featured ? '⭐' : '  '} ${d.slug}: ${d.country_name}`));
}

migrate().catch(console.error);
