/**
 * Destination Migration Script
 *
 * Adds new destinations to the Neon database.
 * Run with: node scripts/migrate-destinations.js
 *
 * Requires: DATABASE_URL environment variable
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
  console.error('ERROR: DATABASE_URL not set. Add it to .env.local');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// New destinations to add
const destinations = [
  // 1. UNITED KINGDOM
  {
    slug: 'uk',
    country_name: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Northern Europe',
    language: 'English',
    hero_title: 'Moving to the United Kingdom',
    hero_subtitle: 'Complete relocation guide for the UK including visas, jobs, cost of living, and expat resources.',
    hero_gradient: 'from-blue-600 to-red-600',
    hero_image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
    enabled: true,
    featured: true,
    priority: 7,
    quick_facts: [
      { label: 'Currency', value: 'GBP (£)', icon: '💷' },
      { label: 'Population', value: '67.5M', icon: '👥' },
      { label: 'Time Zone', value: 'GMT (UTC+0)', icon: '🕐' },
      { label: 'Climate', value: 'Temperate Maritime', icon: '🌧️' },
    ],
    highlights: [
      { text: 'World-class healthcare (NHS)', icon: '✓' },
      { text: 'Global financial hub (London)', icon: '✓' },
      { text: 'Excellent universities', icon: '✓' },
      { text: 'Rich cultural heritage', icon: '✓' },
      { text: 'Strong job market', icon: '✓' },
      { text: 'English-speaking', icon: '✓' },
      { text: '£8,000 tax-free relocation allowance', icon: '✓' },
    ],
    visas: [
      {
        name: 'Skilled Worker Visa',
        description: 'For workers with a job offer from a licensed UK sponsor',
        processingTime: '3-8 weeks',
        cost: '£625-£1,423',
        requirements: ['Job offer from licensed sponsor', 'English language proof (B1)', 'Salary threshold (£26,200+)', 'Criminal record certificate'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'Global Talent Visa',
        description: 'For leaders or promising talent in academia, research, arts, or digital technology',
        processingTime: '3-8 weeks',
        cost: '£716',
        requirements: ['Endorsement from approved body', 'Exceptional talent or promise in field'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'Innovator Founder Visa',
        description: 'For entrepreneurs starting an innovative business in the UK',
        processingTime: '3-8 weeks',
        cost: '£1,191',
        requirements: ['Endorsed business idea', '£50,000+ investment funds', 'English proficiency (B2)'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
      {
        name: 'Family Visa',
        description: 'For partners and family members of UK citizens/residents',
        processingTime: '12-24 weeks',
        cost: '£1,846',
        requirements: ['Relationship proof', 'English language (A1)', 'Financial requirement (£29,000)', 'Accommodation'],
        isWorkPermit: true,
        isResidencyPath: true,
      },
    ],
    cost_of_living: [
      { cityName: 'London', rent1BRCenter: 2200, rent1BROutside: 1500, rent3BRCenter: 4000, utilities: 200, groceries: 350, transportation: 180, dining: 400, costIndex: 100, currency: 'GBP' },
      { cityName: 'Manchester', rent1BRCenter: 1100, rent1BROutside: 800, rent3BRCenter: 1800, utilities: 170, groceries: 280, transportation: 80, dining: 250, costIndex: 65, currency: 'GBP' },
      { cityName: 'Edinburgh', rent1BRCenter: 1200, rent1BROutside: 850, rent3BRCenter: 2000, utilities: 180, groceries: 290, transportation: 70, dining: 270, costIndex: 70, currency: 'GBP' },
    ],
    job_market: {
      topIndustries: ['Finance', 'Technology', 'Healthcare', 'Creative Industries', 'Professional Services'],
      growingSectors: ['FinTech', 'AI/ML', 'Green Energy', 'Life Sciences', 'Cybersecurity'],
      avgSalaryTech: 55000,
      avgWorkHoursWeek: 37,
      vacationDaysStandard: 28,
    },
    faqs: [
      { question: 'What is the UK relocation tax allowance?', answer: 'Employers can pay up to £8,000 tax-free towards qualifying relocation expenses when an employee moves for work. This covers removal costs, travel, temporary accommodation, and bridging loans.', category: 'tax' },
      { question: 'How much do I need to earn for a Skilled Worker visa?', answer: 'The general salary threshold is £26,200 per year or £10.75 per hour. Some occupations on the shortage list have lower thresholds.', category: 'visa' },
      { question: 'Can I use the NHS as an expat?', answer: 'Yes, if you have a visa of 6+ months, you pay the Immigration Health Surcharge (£1,035/year) which gives you access to NHS services.', category: 'healthcare' },
    ],
    meta_title: 'Moving to the UK 2025: Visa Guide, Cost of Living & Jobs',
    meta_description: 'Complete guide to relocating to the United Kingdom. Skilled Worker visa, Global Talent visa, £8,000 tax allowance, NHS healthcare, and job market insights.',
  },

  // 2. NEW ZEALAND
  {
    slug: 'new-zealand',
    country_name: 'New Zealand',
    flag: '🇳🇿',
    region: 'Oceania',
    language: 'English, Māori',
    hero_title: 'Moving to New Zealand',
    hero_subtitle: 'Complete relocation guide for New Zealand including visas, jobs, lifestyle, and immigration pathways.',
    hero_gradient: 'from-blue-900 to-green-600',
    hero_image_url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600',
    enabled: true,
    featured: true,
    priority: 8,
    quick_facts: [
      { label: 'Currency', value: 'NZD ($)', icon: '💵' },
      { label: 'Population', value: '5.1M', icon: '👥' },
      { label: 'Time Zone', value: 'NZST (UTC+12)', icon: '🕐' },
      { label: 'Climate', value: 'Temperate', icon: '🌿' },
    ],
    highlights: [
      { text: 'Outstanding quality of life', icon: '✓' },
      { text: 'Beautiful natural environment', icon: '✓' },
      { text: 'Strong economy', icon: '✓' },
      { text: 'Work-life balance culture', icon: '✓' },
      { text: 'Safe and peaceful', icon: '✓' },
      { text: 'English-speaking', icon: '✓' },
      { text: 'Points-based immigration', icon: '✓' },
    ],
    visas: [
      { name: 'Skilled Migrant Category', description: 'Points-based residence visa for skilled workers', processingTime: '6-12 months', cost: 'NZD $4,290', requirements: ['160+ points', 'Job offer or skilled employment', 'Age under 56', 'English proficiency (IELTS 6.5)'], isWorkPermit: true, isResidencyPath: true },
      { name: 'Accredited Employer Work Visa', description: 'For workers with a job offer from an accredited NZ employer', processingTime: '4-8 weeks', cost: 'NZD $750', requirements: ['Job offer from accredited employer', 'Meet pay threshold', 'Skills match role', 'Health and character requirements'], isWorkPermit: true, isResidencyPath: true },
      { name: 'Working Holiday Visa', description: 'For young people (18-30/35) to work and travel', processingTime: '2-4 weeks', cost: 'NZD $455', requirements: ['Age 18-30 (35 for some countries)', 'Return ticket or funds', 'Health insurance'], isWorkPermit: true, isResidencyPath: false },
    ],
    cost_of_living: [
      { cityName: 'Auckland', rent1BRCenter: 2100, rent1BROutside: 1600, rent3BRCenter: 3500, utilities: 180, groceries: 450, transportation: 180, dining: 350, costIndex: 85, currency: 'NZD' },
      { cityName: 'Wellington', rent1BRCenter: 1900, rent1BROutside: 1400, rent3BRCenter: 3200, utilities: 170, groceries: 420, transportation: 140, dining: 320, costIndex: 80, currency: 'NZD' },
      { cityName: 'Christchurch', rent1BRCenter: 1500, rent1BROutside: 1100, rent3BRCenter: 2500, utilities: 160, groceries: 400, transportation: 100, dining: 280, costIndex: 70, currency: 'NZD' },
    ],
    job_market: {
      topIndustries: ['Agriculture', 'Tourism', 'Technology', 'Healthcare', 'Construction'],
      growingSectors: ['Tech startups', 'Film/Creative', 'Renewable Energy', 'Healthcare', 'Skilled Trades'],
      avgSalaryTech: 95000,
      avgWorkHoursWeek: 40,
      vacationDaysStandard: 20,
    },
    faqs: [
      { question: 'How many points do I need for NZ residence?', answer: 'The Skilled Migrant Category requires 160+ points. Points are awarded for age, skilled employment in NZ, qualifications, and work experience.', category: 'visa' },
      { question: 'Is New Zealand expensive to live in?', answer: 'Yes, NZ has a relatively high cost of living, especially for housing in Auckland. Expect NZD $1,500-2,100/month for a 1BR apartment in a major city.', category: 'housing' },
    ],
    meta_title: 'Moving to New Zealand 2025: Visa Guide, Cost of Living & Jobs',
    meta_description: 'Complete guide to relocating to New Zealand. Skilled Migrant visa, work visas, cost of living, job market insights, and immigration pathways.',
  },

  // 3. MEXICO
  {
    slug: 'mexico',
    country_name: 'Mexico',
    flag: '🇲🇽',
    region: 'North America',
    language: 'Spanish',
    hero_title: 'Moving to Mexico',
    hero_subtitle: 'Complete relocation guide for Mexico including visas, cost of living, and digital nomad lifestyle.',
    hero_gradient: 'from-green-600 to-red-600',
    hero_image_url: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600',
    enabled: true,
    featured: true,
    priority: 12,
    quick_facts: [
      { label: 'Currency', value: 'MXN ($)', icon: '💵' },
      { label: 'Population', value: '130M', icon: '👥' },
      { label: 'Time Zone', value: 'Multiple (UTC-5 to -8)', icon: '🕐' },
      { label: 'Climate', value: 'Tropical/Desert', icon: '🌴' },
    ],
    highlights: [
      { text: 'Very low cost of living', icon: '✓' },
      { text: 'No visa required for 180 days', icon: '✓' },
      { text: 'Rich culture and cuisine', icon: '✓' },
      { text: 'Growing expat community', icon: '✓' },
      { text: 'Beautiful beaches and nature', icon: '✓' },
      { text: 'Same time zones as US', icon: '✓' },
      { text: 'Affordable healthcare', icon: '✓' },
    ],
    visas: [
      { name: 'Tourist Visa (FMM)', description: 'Visa-free entry for up to 180 days for most nationalities', processingTime: 'On arrival', cost: 'Free', requirements: ['Valid passport (6 months)', 'Return ticket', 'Proof of funds'], isWorkPermit: false, isResidencyPath: false },
      { name: 'Temporary Resident Visa', description: '1-4 year visa for those with income or family ties', processingTime: '2-4 weeks', cost: '$50-180 USD', requirements: ['Proof of income ($2,700/month) or savings ($45,000)', 'Passport', 'Photos', 'Application form'], isWorkPermit: false, isResidencyPath: true },
      { name: 'Permanent Resident Visa', description: 'For retirees, family reunification, or after 4 years temporary', processingTime: '4-8 weeks', cost: '$300-400 USD', requirements: ['Higher income threshold ($4,050/month) or savings', 'Or 4 years as temporary resident', 'Family ties to Mexican citizen'], isWorkPermit: true, isResidencyPath: true },
    ],
    cost_of_living: [
      { cityName: 'Mexico City', rent1BRCenter: 800, rent1BROutside: 500, rent3BRCenter: 1400, utilities: 50, groceries: 200, transportation: 30, dining: 150, costIndex: 35, currency: 'USD' },
      { cityName: 'Playa del Carmen', rent1BRCenter: 900, rent1BROutside: 600, rent3BRCenter: 1600, utilities: 80, groceries: 220, transportation: 40, dining: 180, costIndex: 40, currency: 'USD' },
      { cityName: 'Oaxaca', rent1BRCenter: 400, rent1BROutside: 300, rent3BRCenter: 700, utilities: 40, groceries: 150, transportation: 20, dining: 100, costIndex: 25, currency: 'USD' },
    ],
    job_market: {
      topIndustries: ['Tourism', 'Manufacturing', 'Automotive', 'Agriculture', 'Technology'],
      growingSectors: ['Remote Work Hubs', 'Software Development', 'E-commerce', 'Digital Marketing'],
      avgSalaryTech: 30000,
      avgWorkHoursWeek: 48,
      vacationDaysStandard: 12,
    },
    faqs: [
      { question: 'Can I work remotely in Mexico on a tourist visa?', answer: 'Many digital nomads work remotely for foreign companies while on tourist status. For legal security, consider the Temporary Resident visa if staying long-term.', category: 'visa' },
      { question: 'How much money do I need to live comfortably in Mexico?', answer: 'You can live very comfortably on $1,500-2,500/month in most areas. Smaller cities like Oaxaca can be done well on $1,000-1,500/month.', category: 'housing' },
    ],
    meta_title: 'Moving to Mexico 2025: Visa Guide, Cost of Living & Digital Nomad Life',
    meta_description: 'Complete guide to relocating to Mexico. Temporary resident visa, ultra-low cost of living, and digital nomad lifestyle.',
  },

  // 4. THAILAND
  {
    slug: 'thailand',
    country_name: 'Thailand',
    flag: '🇹🇭',
    region: 'Southeast Asia',
    language: 'Thai (English in tourist areas)',
    hero_title: 'Moving to Thailand',
    hero_subtitle: 'Complete relocation guide for Thailand including visas, cost of living, and digital nomad lifestyle.',
    hero_gradient: 'from-red-600 to-blue-600',
    hero_image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600',
    enabled: true,
    featured: true,
    priority: 13,
    quick_facts: [
      { label: 'Currency', value: 'THB (฿)', icon: '💵' },
      { label: 'Population', value: '70M', icon: '👥' },
      { label: 'Time Zone', value: 'ICT (UTC+7)', icon: '🕐' },
      { label: 'Climate', value: 'Tropical', icon: '🌴' },
    ],
    highlights: [
      { text: 'Very low cost of living', icon: '✓' },
      { text: 'Digital nomad visa available', icon: '✓' },
      { text: 'Excellent healthcare at low cost', icon: '✓' },
      { text: 'Beautiful beaches and islands', icon: '✓' },
      { text: 'Strong expat community', icon: '✓' },
      { text: 'Amazing food', icon: '✓' },
      { text: 'Tropical lifestyle year-round', icon: '✓' },
    ],
    visas: [
      { name: 'Digital Nomad Visa (LTR)', description: 'Long-Term Resident visa for remote workers and wealthy individuals', processingTime: '4-8 weeks', cost: '$1,500', requirements: ['Income $80,000+/year for 2 years', 'Or $250,000 assets + $40,000 income', 'Health insurance', 'No criminal record'], isWorkPermit: true, isResidencyPath: true },
      { name: 'Thailand Elite Visa', description: 'Premium long-stay visa program (5-20 years)', processingTime: '2-4 weeks', cost: '$16,000-60,000', requirements: ['One-time fee payment', 'Valid passport', 'No Thai criminal record', 'No banned diseases'], isWorkPermit: false, isResidencyPath: false },
      { name: 'Retirement Visa (O-A)', description: 'For retirees aged 50+', processingTime: '2-4 weeks', cost: '$60', requirements: ['Age 50+', '800,000 THB in Thai bank OR 65,000 THB/month income', 'Health insurance', 'Medical certificate'], isWorkPermit: false, isResidencyPath: false },
    ],
    cost_of_living: [
      { cityName: 'Bangkok', rent1BRCenter: 600, rent1BROutside: 350, rent3BRCenter: 1200, utilities: 80, groceries: 200, transportation: 50, dining: 150, costIndex: 35, currency: 'USD' },
      { cityName: 'Chiang Mai', rent1BRCenter: 350, rent1BROutside: 200, rent3BRCenter: 600, utilities: 50, groceries: 150, transportation: 30, dining: 100, costIndex: 25, currency: 'USD' },
      { cityName: 'Phuket', rent1BRCenter: 500, rent1BROutside: 350, rent3BRCenter: 900, utilities: 70, groceries: 180, transportation: 100, dining: 150, costIndex: 35, currency: 'USD' },
    ],
    job_market: {
      topIndustries: ['Tourism', 'Manufacturing', 'Agriculture', 'Electronics', 'Automotive'],
      growingSectors: ['Remote Work', 'Digital Marketing', 'Teaching English', 'Content Creation'],
      avgSalaryTech: 25000,
      avgWorkHoursWeek: 44,
      vacationDaysStandard: 6,
    },
    faqs: [
      { question: 'Can I get a digital nomad visa for Thailand?', answer: 'Yes! The Long-Term Resident (LTR) visa offers remote workers a 10-year visa. You need to prove $80,000+/year income for the past 2 years.', category: 'visa' },
      { question: 'What is the real cost of living in Thailand?', answer: 'You can live comfortably on $1,000-1,500/month in Chiang Mai or smaller cities. Bangkok requires $1,500-2,500 for a comfortable lifestyle.', category: 'housing' },
    ],
    meta_title: 'Moving to Thailand 2025: Visa Guide, Cost of Living & Digital Nomad Life',
    meta_description: 'Complete guide to relocating to Thailand. Digital nomad visa (LTR), ultra-low cost of living, and expat lifestyle.',
  },

  // 5. FRANCE
  {
    slug: 'france',
    country_name: 'France',
    flag: '🇫🇷',
    region: 'Western Europe',
    language: 'French',
    hero_title: 'Moving to France',
    hero_subtitle: 'Complete relocation guide for France including visas, jobs, cost of living, and expat lifestyle.',
    hero_gradient: 'from-blue-600 to-red-500',
    hero_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600',
    enabled: true,
    featured: false,
    priority: 9,
    quick_facts: [
      { label: 'Currency', value: 'EUR (€)', icon: '💶' },
      { label: 'Population', value: '67.8M', icon: '👥' },
      { label: 'Time Zone', value: 'CET (UTC+1)', icon: '🕐' },
      { label: 'Climate', value: 'Temperate/Mediterranean', icon: '🌸' },
    ],
    highlights: [
      { text: 'World-class healthcare system', icon: '✓' },
      { text: 'Rich culture and cuisine', icon: '✓' },
      { text: '35-hour work week', icon: '✓' },
      { text: 'Excellent public transport', icon: '✓' },
      { text: 'EU membership', icon: '✓' },
      { text: 'Strong worker protections', icon: '✓' },
      { text: 'Quality education system', icon: '✓' },
    ],
    visas: [
      { name: 'Talent Passport (Passeport Talent)', description: 'For highly skilled workers, researchers, entrepreneurs, and investors', processingTime: '2-3 months', cost: '€200', requirements: ['Employment contract or business plan', 'Relevant qualifications', 'Minimum salary (1.8x minimum wage)', 'Health insurance'], isWorkPermit: true, isResidencyPath: true },
      { name: 'Long-Stay Visa (Visitor)', description: 'For those with sufficient income who don\'t plan to work in France', processingTime: '2-3 months', cost: '€99', requirements: ['Proof of income (€1,767/month)', 'Health insurance', 'Accommodation proof', 'Clean criminal record'], isWorkPermit: false, isResidencyPath: true },
    ],
    cost_of_living: [
      { cityName: 'Paris', rent1BRCenter: 1500, rent1BROutside: 1000, rent3BRCenter: 2800, utilities: 150, groceries: 350, transportation: 85, dining: 350, costIndex: 85, currency: 'EUR' },
      { cityName: 'Lyon', rent1BRCenter: 800, rent1BROutside: 600, rent3BRCenter: 1400, utilities: 130, groceries: 300, transportation: 65, dining: 250, costIndex: 60, currency: 'EUR' },
    ],
    job_market: {
      topIndustries: ['Luxury Goods', 'Tourism', 'Aerospace', 'Agriculture', 'Technology'],
      growingSectors: ['Tech/Startups (La French Tech)', 'Green Energy', 'HealthTech', 'AI Research'],
      avgSalaryTech: 50000,
      avgWorkHoursWeek: 35,
      vacationDaysStandard: 30,
    },
    faqs: [
      { question: 'Do I need to speak French to work in France?', answer: 'For most jobs, yes. French is essential for daily life and most workplaces. However, some international companies in Paris operate in English.', category: 'jobs' },
      { question: 'What is the 35-hour work week in France?', answer: 'France has a legal standard work week of 35 hours. Hours beyond this are overtime. Many professionals work longer hours but receive additional vacation days (RTT).', category: 'jobs' },
    ],
    meta_title: 'Moving to France 2025: Visa Guide, Cost of Living & Jobs',
    meta_description: 'Complete guide to relocating to France. Talent Passport visa, 35-hour work week, cost of living, and job market insights.',
  },

  // 6. GERMANY
  {
    slug: 'germany',
    country_name: 'Germany',
    flag: '🇩🇪',
    region: 'Central Europe',
    language: 'German',
    hero_title: 'Moving to Germany',
    hero_subtitle: 'Complete relocation guide for Germany including visas, jobs, cost of living, and expat resources.',
    hero_gradient: 'from-black to-red-600',
    hero_image_url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
    enabled: true,
    featured: false,
    priority: 10,
    quick_facts: [
      { label: 'Currency', value: 'EUR (€)', icon: '💶' },
      { label: 'Population', value: '84.4M', icon: '👥' },
      { label: 'Time Zone', value: 'CET (UTC+1)', icon: '🕐' },
      { label: 'Climate', value: 'Temperate', icon: '🌲' },
    ],
    highlights: [
      { text: 'Europe\'s largest economy', icon: '✓' },
      { text: 'Strong job market in tech and engineering', icon: '✓' },
      { text: 'Excellent public healthcare', icon: '✓' },
      { text: 'Free university education', icon: '✓' },
      { text: 'EU Blue Card available', icon: '✓' },
      { text: 'High quality of life', icon: '✓' },
      { text: 'Freelancer visa for self-employed', icon: '✓' },
    ],
    visas: [
      { name: 'EU Blue Card', description: 'For highly qualified professionals with a job offer', processingTime: '4-8 weeks', cost: '€100-140', requirements: ['University degree', 'Job offer (€45,300+ salary)', 'Health insurance'], isWorkPermit: true, isResidencyPath: true },
      { name: 'Job Seeker Visa', description: '6-month visa to search for employment in Germany', processingTime: '4-8 weeks', cost: '€75', requirements: ['University degree', 'Sufficient funds (€947/month)', 'Health insurance', 'Accommodation proof'], isWorkPermit: false, isResidencyPath: false },
      { name: 'Freelancer Visa (Freiberufler)', description: 'For self-employed professionals and freelancers', processingTime: '4-12 weeks', cost: '€100', requirements: ['Business plan', 'Client contracts or letters of intent', 'Proof of professional qualifications', 'Sufficient income'], isWorkPermit: true, isResidencyPath: true },
    ],
    cost_of_living: [
      { cityName: 'Berlin', rent1BRCenter: 1200, rent1BROutside: 850, rent3BRCenter: 2200, utilities: 250, groceries: 280, transportation: 86, dining: 280, costIndex: 70, currency: 'EUR' },
      { cityName: 'Munich', rent1BRCenter: 1600, rent1BROutside: 1100, rent3BRCenter: 2800, utilities: 260, groceries: 300, transportation: 59, dining: 320, costIndex: 85, currency: 'EUR' },
    ],
    job_market: {
      topIndustries: ['Automotive', 'Engineering', 'Technology', 'Pharmaceuticals', 'Finance'],
      growingSectors: ['AI/Software', 'Electric Vehicles', 'Renewable Energy', 'BioTech', 'FinTech'],
      avgSalaryTech: 60000,
      avgWorkHoursWeek: 40,
      vacationDaysStandard: 30,
    },
    faqs: [
      { question: 'Do I need to speak German to work in Germany?', answer: 'It depends on the industry. In tech and international companies, English is often sufficient. However, for daily life and traditional industries, German is essential.', category: 'jobs' },
      { question: 'What is the EU Blue Card and how do I qualify?', answer: 'The EU Blue Card is for highly qualified non-EU citizens. You need a recognized university degree and a job offer with minimum €45,300/year salary. It leads to permanent residence after 21-33 months.', category: 'visa' },
    ],
    meta_title: 'Moving to Germany 2025: Visa Guide, Cost of Living & Jobs',
    meta_description: 'Complete guide to relocating to Germany. EU Blue Card, freelancer visa, job market insights, and cost of living.',
  },

  // 7. NETHERLANDS
  {
    slug: 'netherlands',
    country_name: 'Netherlands',
    flag: '🇳🇱',
    region: 'Western Europe',
    language: 'Dutch (English widely spoken)',
    hero_title: 'Moving to the Netherlands',
    hero_subtitle: 'Complete relocation guide for the Netherlands including visas, 30% tax ruling, and expat lifestyle.',
    hero_gradient: 'from-orange-500 to-blue-600',
    hero_image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1600',
    enabled: true,
    featured: false,
    priority: 11,
    quick_facts: [
      { label: 'Currency', value: 'EUR (€)', icon: '💶' },
      { label: 'Population', value: '17.8M', icon: '👥' },
      { label: 'Time Zone', value: 'CET (UTC+1)', icon: '🕐' },
      { label: 'Climate', value: 'Maritime Temperate', icon: '🌧️' },
    ],
    highlights: [
      { text: '30% tax ruling for expats', icon: '✓' },
      { text: 'Excellent English proficiency', icon: '✓' },
      { text: 'Strong tech and startup scene', icon: '✓' },
      { text: 'High quality of life', icon: '✓' },
      { text: 'DAFT treaty for US citizens', icon: '✓' },
      { text: 'Bike-friendly culture', icon: '✓' },
      { text: 'Work-life balance', icon: '✓' },
    ],
    visas: [
      { name: 'Highly Skilled Migrant Visa (Kennismigrant)', description: 'For professionals with a job offer meeting salary threshold', processingTime: '2-4 weeks', cost: '€210', requirements: ['Job offer from recognized sponsor', 'Salary threshold (€5,008/month for 30+, €3,672 for under 30)', 'Valid passport'], isWorkPermit: true, isResidencyPath: true },
      { name: 'DAFT Visa (US Citizens)', description: 'Dutch-American Friendship Treaty visa for US entrepreneurs', processingTime: '4-8 weeks', cost: '€349', requirements: ['US citizenship', '€4,500 investment', 'Viable business plan', 'Health insurance'], isWorkPermit: true, isResidencyPath: true },
      { name: 'Startup Visa', description: 'For innovative entrepreneurs launching a startup', processingTime: '4-8 weeks', cost: '€349', requirements: ['Innovative product/service', 'Facilitator (approved incubator)', 'Business plan', 'Sufficient income'], isWorkPermit: true, isResidencyPath: true },
    ],
    cost_of_living: [
      { cityName: 'Amsterdam', rent1BRCenter: 1800, rent1BROutside: 1400, rent3BRCenter: 2800, utilities: 200, groceries: 320, transportation: 100, dining: 350, costIndex: 85, currency: 'EUR' },
      { cityName: 'Rotterdam', rent1BRCenter: 1400, rent1BROutside: 1100, rent3BRCenter: 2200, utilities: 180, groceries: 300, transportation: 90, dining: 280, costIndex: 72, currency: 'EUR' },
    ],
    job_market: {
      topIndustries: ['Technology', 'Finance', 'Agriculture/Food', 'Logistics', 'Energy'],
      growingSectors: ['FinTech', 'AI/ML', 'AgriTech', 'Sustainability', 'Cybersecurity'],
      avgSalaryTech: 65000,
      avgWorkHoursWeek: 36,
      vacationDaysStandard: 25,
    },
    faqs: [
      { question: 'What is the 30% ruling and do I qualify?', answer: 'The 30% ruling allows qualifying expats to receive 30% of their salary tax-free for up to 5 years. You must be recruited from abroad, have specific expertise, and earn above a salary threshold (€46,107 for most).', category: 'tax' },
      { question: 'Can US citizens easily move to the Netherlands?', answer: 'Yes! The DAFT visa is one of the easiest paths for US citizens. You only need €4,500 in investment capital and a viable business plan.', category: 'visa' },
    ],
    meta_title: 'Moving to the Netherlands 2025: Visa Guide, 30% Ruling & Jobs',
    meta_description: 'Complete guide to relocating to the Netherlands. 30% tax ruling, DAFT visa for Americans, Kennismigrant visa, and Amsterdam job market.',
  },
];

async function migrate() {
  console.log('Starting destination migration...\n');

  for (const dest of destinations) {
    try {
      // Check if destination exists
      const existing = await sql`
        SELECT slug FROM destinations WHERE slug = ${dest.slug}
      `;

      if (existing.length > 0) {
        // Update existing
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
        // Insert new
        await sql`
          INSERT INTO destinations (
            slug, country_name, flag, region, language,
            hero_title, hero_subtitle, hero_gradient, hero_image_url,
            enabled, featured, priority,
            quick_facts, highlights, visas, cost_of_living, job_market, faqs,
            meta_title, meta_description
          ) VALUES (
            ${dest.slug},
            ${dest.country_name},
            ${dest.flag},
            ${dest.region},
            ${dest.language},
            ${dest.hero_title},
            ${dest.hero_subtitle},
            ${dest.hero_gradient},
            ${dest.hero_image_url},
            ${dest.enabled},
            ${dest.featured},
            ${dest.priority},
            ${JSON.stringify(dest.quick_facts)},
            ${JSON.stringify(dest.highlights)},
            ${JSON.stringify(dest.visas)},
            ${JSON.stringify(dest.cost_of_living)},
            ${JSON.stringify(dest.job_market)},
            ${JSON.stringify(dest.faqs)},
            ${dest.meta_title},
            ${dest.meta_description}
          )
        `;
        console.log(`✓ Added: ${dest.country_name}`);
      }
    } catch (error) {
      console.error(`✗ Error with ${dest.country_name}:`, error.message);
    }
  }

  // Show final count
  const count = await sql`SELECT COUNT(*) as total FROM destinations WHERE enabled = true`;
  console.log(`\nMigration complete! Total destinations: ${count[0].total}`);

  // List all destinations
  const all = await sql`SELECT slug, country_name, featured FROM destinations ORDER BY priority DESC`;
  console.log('\nAll destinations:');
  all.forEach(d => console.log(`  ${d.featured ? '⭐' : '  '} ${d.slug}: ${d.country_name}`));
}

migrate().catch(console.error);
