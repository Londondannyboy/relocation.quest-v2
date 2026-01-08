-- Migration: Add New Destinations to Relocation Quest V2
-- Run with: psql $DATABASE_URL -f scripts/add-destinations.sql
-- Or copy sections to run in your SQL client

-- ============================================================================
-- 1. UNITED KINGDOM (Priority #1 - 880 searches/month)
-- ============================================================================
INSERT INTO destinations (
  slug, country_name, flag, region, language,
  hero_title, hero_subtitle, hero_gradient, hero_image_url,
  enabled, featured, priority,
  quick_facts, highlights, visas, cost_of_living, job_market, faqs,
  meta_title, meta_description
) VALUES (
  'uk',
  'United Kingdom',
  '🇬🇧',
  'Northern Europe',
  'English',
  'Moving to the United Kingdom',
  'Complete relocation guide for the UK including visas, jobs, cost of living, and expat resources.',
  'from-blue-600 to-red-600',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  true,
  true,
  7,
  -- quick_facts
  '[
    {"label": "Currency", "value": "GBP (£)", "icon": "💷"},
    {"label": "Population", "value": "67.5M", "icon": "👥"},
    {"label": "Time Zone", "value": "GMT (UTC+0)", "icon": "🕐"},
    {"label": "Climate", "value": "Temperate Maritime", "icon": "🌧️"}
  ]'::jsonb,
  -- highlights
  '[
    {"text": "World-class healthcare (NHS)", "icon": "✓"},
    {"text": "Global financial hub (London)", "icon": "✓"},
    {"text": "Excellent universities", "icon": "✓"},
    {"text": "Rich cultural heritage", "icon": "✓"},
    {"text": "Strong job market", "icon": "✓"},
    {"text": "English-speaking", "icon": "✓"},
    {"text": "£8,000 tax-free relocation allowance", "icon": "✓"}
  ]'::jsonb,
  -- visas
  '[
    {
      "name": "Skilled Worker Visa",
      "description": "For workers with a job offer from a licensed UK sponsor",
      "processingTime": "3-8 weeks",
      "cost": "£625-£1,423",
      "requirements": ["Job offer from licensed sponsor", "English language proof (B1)", "Salary threshold (£26,200+)", "Criminal record certificate"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Global Talent Visa",
      "description": "For leaders or promising talent in academia, research, arts, or digital technology",
      "processingTime": "3-8 weeks",
      "cost": "£716",
      "requirements": ["Endorsement from approved body", "Exceptional talent or promise in field"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Innovator Founder Visa",
      "description": "For entrepreneurs starting an innovative business in the UK",
      "processingTime": "3-8 weeks",
      "cost": "£1,191",
      "requirements": ["Endorsed business idea", "£50,000+ investment funds", "English proficiency (B2)"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Graduate Visa",
      "description": "For international students who completed a UK degree",
      "processingTime": "8 weeks",
      "cost": "£822",
      "requirements": ["UK degree completion", "Valid student visa", "In UK at application"],
      "isWorkPermit": true,
      "isResidencyPath": false
    },
    {
      "name": "Family Visa",
      "description": "For partners and family members of UK citizens/residents",
      "processingTime": "12-24 weeks",
      "cost": "£1,846",
      "requirements": ["Relationship proof", "English language (A1)", "Financial requirement (£29,000)", "Accommodation"],
      "isWorkPermit": true,
      "isResidencyPath": true
    }
  ]'::jsonb,
  -- cost_of_living
  '[
    {
      "cityName": "London",
      "rent1BRCenter": 2200,
      "rent1BROutside": 1500,
      "rent3BRCenter": 4000,
      "utilities": 200,
      "groceries": 350,
      "transportation": 180,
      "dining": 400,
      "costIndex": 100,
      "currency": "GBP"
    },
    {
      "cityName": "Manchester",
      "rent1BRCenter": 1100,
      "rent1BROutside": 800,
      "rent3BRCenter": 1800,
      "utilities": 170,
      "groceries": 280,
      "transportation": 80,
      "dining": 250,
      "costIndex": 65,
      "currency": "GBP"
    },
    {
      "cityName": "Edinburgh",
      "rent1BRCenter": 1200,
      "rent1BROutside": 850,
      "rent3BRCenter": 2000,
      "utilities": 180,
      "groceries": 290,
      "transportation": 70,
      "dining": 270,
      "costIndex": 70,
      "currency": "GBP"
    }
  ]'::jsonb,
  -- job_market
  '{
    "topIndustries": ["Finance", "Technology", "Healthcare", "Creative Industries", "Professional Services"],
    "growingSectors": ["FinTech", "AI/ML", "Green Energy", "Life Sciences", "Cybersecurity"],
    "avgSalaryTech": 55000,
    "avgWorkHoursWeek": 37,
    "vacationDaysStandard": 28
  }'::jsonb,
  -- faqs
  '[
    {
      "question": "What is the UK relocation tax allowance?",
      "answer": "Employers can pay up to £8,000 tax-free towards qualifying relocation expenses when an employee moves for work. This covers removal costs, travel, temporary accommodation, and bridging loans. Amounts above £8,000 are taxed as normal income.",
      "category": "tax"
    },
    {
      "question": "How much do I need to earn for a Skilled Worker visa?",
      "answer": "The general salary threshold is £26,200 per year or £10.75 per hour, whichever is higher. However, some occupations on the shortage list have lower thresholds. Your specific role must meet the ''going rate'' for that occupation.",
      "category": "visa"
    },
    {
      "question": "Can I use the NHS as an expat?",
      "answer": "Yes, if you have a visa of 6+ months, you pay the Immigration Health Surcharge (£1,035/year) which gives you access to NHS services. Healthcare is then free at point of use, similar to UK residents.",
      "category": "healthcare"
    },
    {
      "question": "What is the cost of living compared to other European cities?",
      "answer": "London is one of Europe''s most expensive cities, comparable to Zurich and Paris. However, outside London, costs drop significantly. Manchester, Birmingham, and Leeds offer 35-50% lower living costs while maintaining strong job markets.",
      "category": "housing"
    }
  ]'::jsonb,
  'Moving to the UK 2025: Visa Guide, Cost of Living & Jobs',
  'Complete guide to relocating to the United Kingdom. Skilled Worker visa, Global Talent visa, £8,000 tax allowance, NHS healthcare, and job market insights.'
)
ON CONFLICT (slug) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  hero_subtitle = EXCLUDED.hero_subtitle,
  quick_facts = EXCLUDED.quick_facts,
  highlights = EXCLUDED.highlights,
  visas = EXCLUDED.visas,
  cost_of_living = EXCLUDED.cost_of_living,
  job_market = EXCLUDED.job_market,
  faqs = EXCLUDED.faqs,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;

-- ============================================================================
-- 2. NEW ZEALAND (High interest destination)
-- ============================================================================
INSERT INTO destinations (
  slug, country_name, flag, region, language,
  hero_title, hero_subtitle, hero_gradient, hero_image_url,
  enabled, featured, priority,
  quick_facts, highlights, visas, cost_of_living, job_market, faqs,
  meta_title, meta_description
) VALUES (
  'new-zealand',
  'New Zealand',
  '🇳🇿',
  'Oceania',
  'English, Māori',
  'Moving to New Zealand',
  'Complete relocation guide for New Zealand including visas, jobs, lifestyle, and immigration pathways.',
  'from-blue-900 to-green-600',
  'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600',
  true,
  true,
  8,
  -- quick_facts
  '[
    {"label": "Currency", "value": "NZD ($)", "icon": "💵"},
    {"label": "Population", "value": "5.1M", "icon": "👥"},
    {"label": "Time Zone", "value": "NZST (UTC+12)", "icon": "🕐"},
    {"label": "Climate", "value": "Temperate", "icon": "🌿"}
  ]'::jsonb,
  -- highlights
  '[
    {"text": "Outstanding quality of life", "icon": "✓"},
    {"text": "Beautiful natural environment", "icon": "✓"},
    {"text": "Strong economy", "icon": "✓"},
    {"text": "Work-life balance culture", "icon": "✓"},
    {"text": "Safe and peaceful", "icon": "✓"},
    {"text": "English-speaking", "icon": "✓"},
    {"text": "Points-based immigration", "icon": "✓"}
  ]'::jsonb,
  -- visas
  '[
    {
      "name": "Skilled Migrant Category",
      "description": "Points-based residence visa for skilled workers",
      "processingTime": "6-12 months",
      "cost": "NZD $4,290",
      "requirements": ["160+ points", "Job offer or skilled employment", "Age under 56", "English proficiency (IELTS 6.5)"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Accredited Employer Work Visa",
      "description": "For workers with a job offer from an accredited NZ employer",
      "processingTime": "4-8 weeks",
      "cost": "NZD $750",
      "requirements": ["Job offer from accredited employer", "Meet pay threshold", "Skills match role", "Health and character requirements"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Working Holiday Visa",
      "description": "For young people (18-30/35) to work and travel",
      "processingTime": "2-4 weeks",
      "cost": "NZD $455",
      "requirements": ["Age 18-30 (35 for some countries)", "Return ticket or funds", "Health insurance"],
      "isWorkPermit": true,
      "isResidencyPath": false
    },
    {
      "name": "Investor Visa",
      "description": "For investors willing to invest NZD $3M+",
      "processingTime": "6-12 months",
      "cost": "NZD $4,745",
      "requirements": ["NZD $3M investment (4 years)", "Business experience", "English proficiency", "Age requirements vary"],
      "isWorkPermit": true,
      "isResidencyPath": true
    }
  ]'::jsonb,
  -- cost_of_living
  '[
    {
      "cityName": "Auckland",
      "rent1BRCenter": 2100,
      "rent1BROutside": 1600,
      "rent3BRCenter": 3500,
      "utilities": 180,
      "groceries": 450,
      "transportation": 180,
      "dining": 350,
      "costIndex": 85,
      "currency": "NZD"
    },
    {
      "cityName": "Wellington",
      "rent1BRCenter": 1900,
      "rent1BROutside": 1400,
      "rent3BRCenter": 3200,
      "utilities": 170,
      "groceries": 420,
      "transportation": 140,
      "dining": 320,
      "costIndex": 80,
      "currency": "NZD"
    },
    {
      "cityName": "Christchurch",
      "rent1BRCenter": 1500,
      "rent1BROutside": 1100,
      "rent3BRCenter": 2500,
      "utilities": 160,
      "groceries": 400,
      "transportation": 100,
      "dining": 280,
      "costIndex": 70,
      "currency": "NZD"
    }
  ]'::jsonb,
  -- job_market
  '{
    "topIndustries": ["Agriculture", "Tourism", "Technology", "Healthcare", "Construction"],
    "growingSectors": ["Tech startups", "Film/Creative", "Renewable Energy", "Healthcare", "Skilled Trades"],
    "avgSalaryTech": 95000,
    "avgWorkHoursWeek": 40,
    "vacationDaysStandard": 20
  }'::jsonb,
  -- faqs
  '[
    {
      "question": "How many points do I need for NZ residence?",
      "answer": "The Skilled Migrant Category requires 160+ points. Points are awarded for age (max 30 points), skilled employment in NZ (max 50 points), qualifications (max 70 points), and work experience. Having a job offer in NZ significantly helps your application.",
      "category": "visa"
    },
    {
      "question": "Is New Zealand expensive to live in?",
      "answer": "Yes, NZ has a relatively high cost of living, especially for housing in Auckland. However, salaries are generally higher to compensate. Outside Auckland, costs are 15-30% lower. Expect to pay NZD $1,500-2,100/month for a 1BR apartment in a major city.",
      "category": "housing"
    },
    {
      "question": "What is healthcare like in New Zealand?",
      "answer": "NZ has a public healthcare system that provides subsidized care for residents. GP visits cost NZD $50-80 for adults, but hospital care is free. Most visa holders have access after becoming tax residents. Many people also have private health insurance for faster access to specialists.",
      "category": "healthcare"
    }
  ]'::jsonb,
  'Moving to New Zealand 2025: Visa Guide, Cost of Living & Jobs',
  'Complete guide to relocating to New Zealand. Skilled Migrant visa, work visas, cost of living, job market insights, and immigration pathways.'
)
ON CONFLICT (slug) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  hero_subtitle = EXCLUDED.hero_subtitle,
  quick_facts = EXCLUDED.quick_facts,
  highlights = EXCLUDED.highlights,
  visas = EXCLUDED.visas,
  cost_of_living = EXCLUDED.cost_of_living,
  job_market = EXCLUDED.job_market,
  faqs = EXCLUDED.faqs;

-- ============================================================================
-- 3. FRANCE (Popular European destination)
-- ============================================================================
INSERT INTO destinations (
  slug, country_name, flag, region, language,
  hero_title, hero_subtitle, hero_gradient, hero_image_url,
  enabled, featured, priority,
  quick_facts, highlights, visas, cost_of_living, job_market, faqs,
  meta_title, meta_description
) VALUES (
  'france',
  'France',
  '🇫🇷',
  'Western Europe',
  'French',
  'Moving to France',
  'Complete relocation guide for France including visas, jobs, cost of living, and expat lifestyle.',
  'from-blue-600 to-red-500',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600',
  true,
  false,
  9,
  -- quick_facts
  '[
    {"label": "Currency", "value": "EUR (€)", "icon": "💶"},
    {"label": "Population", "value": "67.8M", "icon": "👥"},
    {"label": "Time Zone", "value": "CET (UTC+1)", "icon": "🕐"},
    {"label": "Climate", "value": "Temperate/Mediterranean", "icon": "🌸"}
  ]'::jsonb,
  -- highlights
  '[
    {"text": "World-class healthcare system", "icon": "✓"},
    {"text": "Rich culture and cuisine", "icon": "✓"},
    {"text": "35-hour work week", "icon": "✓"},
    {"text": "Excellent public transport", "icon": "✓"},
    {"text": "EU membership", "icon": "✓"},
    {"text": "Strong worker protections", "icon": "✓"},
    {"text": "Quality education system", "icon": "✓"}
  ]'::jsonb,
  -- visas
  '[
    {
      "name": "Talent Passport (Passeport Talent)",
      "description": "For highly skilled workers, researchers, entrepreneurs, and investors",
      "processingTime": "2-3 months",
      "cost": "€200",
      "requirements": ["Employment contract or business plan", "Relevant qualifications", "Minimum salary (1.8x minimum wage)", "Health insurance"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Long-Stay Visa (Visitor)",
      "description": "For those with sufficient income who don''t plan to work in France",
      "processingTime": "2-3 months",
      "cost": "€99",
      "requirements": ["Proof of income (€1,767/month)", "Health insurance", "Accommodation proof", "Clean criminal record"],
      "isWorkPermit": false,
      "isResidencyPath": true
    },
    {
      "name": "Employee Visa",
      "description": "For workers with a job offer from a French employer",
      "processingTime": "2-4 months",
      "cost": "€99-200",
      "requirements": ["Employment contract", "Work authorization from employer", "Accommodation", "Health insurance"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Entrepreneur Visa",
      "description": "For business creators and freelancers",
      "processingTime": "2-3 months",
      "cost": "€200",
      "requirements": ["Business plan", "Proof of funds (€20,000+)", "Professional qualifications", "Economic viability proof"],
      "isWorkPermit": true,
      "isResidencyPath": true
    }
  ]'::jsonb,
  -- cost_of_living
  '[
    {
      "cityName": "Paris",
      "rent1BRCenter": 1500,
      "rent1BROutside": 1000,
      "rent3BRCenter": 2800,
      "utilities": 150,
      "groceries": 350,
      "transportation": 85,
      "dining": 350,
      "costIndex": 85,
      "currency": "EUR"
    },
    {
      "cityName": "Lyon",
      "rent1BRCenter": 800,
      "rent1BROutside": 600,
      "rent3BRCenter": 1400,
      "utilities": 130,
      "groceries": 300,
      "transportation": 65,
      "dining": 250,
      "costIndex": 60,
      "currency": "EUR"
    },
    {
      "cityName": "Bordeaux",
      "rent1BRCenter": 850,
      "rent1BROutside": 650,
      "rent3BRCenter": 1500,
      "utilities": 120,
      "groceries": 290,
      "transportation": 50,
      "dining": 240,
      "costIndex": 58,
      "currency": "EUR"
    }
  ]'::jsonb,
  -- job_market
  '{
    "topIndustries": ["Luxury Goods", "Tourism", "Aerospace", "Agriculture", "Technology"],
    "growingSectors": ["Tech/Startups (La French Tech)", "Green Energy", "HealthTech", "AI Research"],
    "avgSalaryTech": 50000,
    "avgWorkHoursWeek": 35,
    "vacationDaysStandard": 30
  }'::jsonb,
  -- faqs
  '[
    {
      "question": "Do I need to speak French to work in France?",
      "answer": "For most jobs, yes. French is essential for daily life and most workplace settings. However, in Paris and major tech hubs, some international companies operate in English. Having B2 French proficiency will significantly expand your job opportunities and help with visa applications.",
      "category": "jobs"
    },
    {
      "question": "What is the 35-hour work week in France?",
      "answer": "France has a legal standard work week of 35 hours. Hours beyond this are considered overtime and must be compensated. Many professionals, especially in cadre (management) roles, work longer hours but receive additional vacation days (RTT) in compensation.",
      "category": "jobs"
    },
    {
      "question": "How does French healthcare work?",
      "answer": "France has one of the world''s best healthcare systems. After 3 months of residence, you can join the Sécurité Sociale. The state covers 70-100% of costs, and most residents have complementary insurance (mutuelle) to cover the rest. Quality is excellent throughout the country.",
      "category": "healthcare"
    }
  ]'::jsonb,
  'Moving to France 2025: Visa Guide, Cost of Living & Jobs',
  'Complete guide to relocating to France. Talent Passport visa, 35-hour work week, cost of living, and job market insights for expats.'
)
ON CONFLICT (slug) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  hero_subtitle = EXCLUDED.hero_subtitle,
  quick_facts = EXCLUDED.quick_facts,
  highlights = EXCLUDED.highlights,
  visas = EXCLUDED.visas,
  cost_of_living = EXCLUDED.cost_of_living,
  job_market = EXCLUDED.job_market,
  faqs = EXCLUDED.faqs;

-- ============================================================================
-- 4. GERMANY (Strong job market)
-- ============================================================================
INSERT INTO destinations (
  slug, country_name, flag, region, language,
  hero_title, hero_subtitle, hero_gradient, hero_image_url,
  enabled, featured, priority,
  quick_facts, highlights, visas, cost_of_living, job_market, faqs,
  meta_title, meta_description
) VALUES (
  'germany',
  'Germany',
  '🇩🇪',
  'Central Europe',
  'German',
  'Moving to Germany',
  'Complete relocation guide for Germany including visas, jobs, cost of living, and expat resources.',
  'from-black to-red-600',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  true,
  false,
  10,
  -- quick_facts
  '[
    {"label": "Currency", "value": "EUR (€)", "icon": "💶"},
    {"label": "Population", "value": "84.4M", "icon": "👥"},
    {"label": "Time Zone", "value": "CET (UTC+1)", "icon": "🕐"},
    {"label": "Climate", "value": "Temperate", "icon": "🌲"}
  ]'::jsonb,
  -- highlights
  '[
    {"text": "Europe''s largest economy", "icon": "✓"},
    {"text": "Strong job market in tech and engineering", "icon": "✓"},
    {"text": "Excellent public healthcare", "icon": "✓"},
    {"text": "Free university education", "icon": "✓"},
    {"text": "EU Blue Card available", "icon": "✓"},
    {"text": "High quality of life", "icon": "✓"},
    {"text": "Freelancer visa for self-employed", "icon": "✓"}
  ]'::jsonb,
  -- visas
  '[
    {
      "name": "EU Blue Card",
      "description": "For highly qualified professionals with a job offer",
      "processingTime": "4-8 weeks",
      "cost": "€100-140",
      "requirements": ["University degree", "Job offer (€45,300+ salary, or €41,000 for shortage occupations)", "Health insurance"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Job Seeker Visa",
      "description": "6-month visa to search for employment in Germany",
      "processingTime": "4-8 weeks",
      "cost": "€75",
      "requirements": ["University degree", "Sufficient funds (€947/month)", "Health insurance", "Accommodation proof"],
      "isWorkPermit": false,
      "isResidencyPath": false
    },
    {
      "name": "Freelancer Visa (Freiberufler)",
      "description": "For self-employed professionals and freelancers",
      "processingTime": "4-12 weeks",
      "cost": "€100",
      "requirements": ["Business plan", "Client contracts or letters of intent", "Proof of professional qualifications", "Sufficient income"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Skilled Worker Visa",
      "description": "For workers with vocational training (non-degree)",
      "processingTime": "4-8 weeks",
      "cost": "€75-100",
      "requirements": ["Recognized vocational qualification", "Job offer", "German language skills (varies)", "Health insurance"],
      "isWorkPermit": true,
      "isResidencyPath": true
    }
  ]'::jsonb,
  -- cost_of_living
  '[
    {
      "cityName": "Berlin",
      "rent1BRCenter": 1200,
      "rent1BROutside": 850,
      "rent3BRCenter": 2200,
      "utilities": 250,
      "groceries": 280,
      "transportation": 86,
      "dining": 280,
      "costIndex": 70,
      "currency": "EUR"
    },
    {
      "cityName": "Munich",
      "rent1BRCenter": 1600,
      "rent1BROutside": 1100,
      "rent3BRCenter": 2800,
      "utilities": 260,
      "groceries": 300,
      "transportation": 59,
      "dining": 320,
      "costIndex": 85,
      "currency": "EUR"
    },
    {
      "cityName": "Hamburg",
      "rent1BRCenter": 1100,
      "rent1BROutside": 750,
      "rent3BRCenter": 2000,
      "utilities": 240,
      "groceries": 270,
      "transportation": 59,
      "dining": 260,
      "costIndex": 68,
      "currency": "EUR"
    }
  ]'::jsonb,
  -- job_market
  '{
    "topIndustries": ["Automotive", "Engineering", "Technology", "Pharmaceuticals", "Finance"],
    "growingSectors": ["AI/Software", "Electric Vehicles", "Renewable Energy", "BioTech", "FinTech"],
    "avgSalaryTech": 60000,
    "avgWorkHoursWeek": 40,
    "vacationDaysStandard": 30
  }'::jsonb,
  -- faqs
  '[
    {
      "question": "Do I need to speak German to work in Germany?",
      "answer": "It depends on the industry. In tech and international companies, English is often sufficient. However, for daily life and most traditional industries, German is essential. Many visa applications require B1 German level, and learning German will significantly improve your integration and career prospects.",
      "category": "jobs"
    },
    {
      "question": "What is the EU Blue Card and how do I qualify?",
      "answer": "The EU Blue Card is a work permit for highly qualified non-EU citizens. You need a recognized university degree and a job offer with a minimum salary of €45,300/year (€41,000 for shortage occupations like IT and engineering). It leads to permanent residence after 21-33 months.",
      "category": "visa"
    },
    {
      "question": "Can freelancers get a visa for Germany?",
      "answer": "Yes! Germany has a specific Freiberufler (freelancer) visa. You need to show a viable business plan, client contracts or letters of intent, professional qualifications, and proof you can support yourself. It''s popular among designers, consultants, developers, and creative professionals.",
      "category": "visa"
    }
  ]'::jsonb,
  'Moving to Germany 2025: Visa Guide, Cost of Living & Jobs',
  'Complete guide to relocating to Germany. EU Blue Card, freelancer visa, job market insights, and cost of living in Berlin, Munich, and Hamburg.'
)
ON CONFLICT (slug) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  hero_subtitle = EXCLUDED.hero_subtitle,
  quick_facts = EXCLUDED.quick_facts,
  highlights = EXCLUDED.highlights,
  visas = EXCLUDED.visas,
  cost_of_living = EXCLUDED.cost_of_living,
  job_market = EXCLUDED.job_market,
  faqs = EXCLUDED.faqs;

-- ============================================================================
-- 5. NETHERLANDS (DAFT Treaty - US citizens, strong tech scene)
-- ============================================================================
INSERT INTO destinations (
  slug, country_name, flag, region, language,
  hero_title, hero_subtitle, hero_gradient, hero_image_url,
  enabled, featured, priority,
  quick_facts, highlights, visas, cost_of_living, job_market, faqs,
  meta_title, meta_description
) VALUES (
  'netherlands',
  'Netherlands',
  '🇳🇱',
  'Western Europe',
  'Dutch (English widely spoken)',
  'Moving to the Netherlands',
  'Complete relocation guide for the Netherlands including visas, 30% tax ruling, and expat lifestyle.',
  'from-orange-500 to-blue-600',
  'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1600',
  true,
  false,
  11,
  -- quick_facts
  '[
    {"label": "Currency", "value": "EUR (€)", "icon": "💶"},
    {"label": "Population", "value": "17.8M", "icon": "👥"},
    {"label": "Time Zone", "value": "CET (UTC+1)", "icon": "🕐"},
    {"label": "Climate", "value": "Maritime Temperate", "icon": "🌧️"}
  ]'::jsonb,
  -- highlights
  '[
    {"text": "30% tax ruling for expats", "icon": "✓"},
    {"text": "Excellent English proficiency", "icon": "✓"},
    {"text": "Strong tech and startup scene", "icon": "✓"},
    {"text": "High quality of life", "icon": "✓"},
    {"text": "DAFT treaty for US citizens", "icon": "✓"},
    {"text": "Bike-friendly culture", "icon": "✓"},
    {"text": "Work-life balance", "icon": "✓"}
  ]'::jsonb,
  -- visas
  '[
    {
      "name": "Highly Skilled Migrant Visa (Kennismigrant)",
      "description": "For professionals with a job offer meeting salary threshold",
      "processingTime": "2-4 weeks",
      "cost": "€210",
      "requirements": ["Job offer from recognized sponsor", "Salary threshold (€5,008/month for 30+, €3,672 for under 30)", "Valid passport"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "DAFT Visa (US Citizens)",
      "description": "Dutch-American Friendship Treaty visa for US entrepreneurs",
      "processingTime": "4-8 weeks",
      "cost": "€349",
      "requirements": ["US citizenship", "€4,500 investment", "Viable business plan", "Health insurance"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Startup Visa",
      "description": "For innovative entrepreneurs launching a startup",
      "processingTime": "4-8 weeks",
      "cost": "€349",
      "requirements": ["Innovative product/service", "Facilitator (approved incubator)", "Business plan", "Sufficient income"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Orientation Year Visa",
      "description": "For recent graduates to search for work (1 year)",
      "processingTime": "4-8 weeks",
      "cost": "€210",
      "requirements": ["Recent degree from ranked university", "Graduated within 3 years", "Sufficient funds"],
      "isWorkPermit": true,
      "isResidencyPath": false
    }
  ]'::jsonb,
  -- cost_of_living
  '[
    {
      "cityName": "Amsterdam",
      "rent1BRCenter": 1800,
      "rent1BROutside": 1400,
      "rent3BRCenter": 2800,
      "utilities": 200,
      "groceries": 320,
      "transportation": 100,
      "dining": 350,
      "costIndex": 85,
      "currency": "EUR"
    },
    {
      "cityName": "Rotterdam",
      "rent1BRCenter": 1400,
      "rent1BROutside": 1100,
      "rent3BRCenter": 2200,
      "utilities": 180,
      "groceries": 300,
      "transportation": 90,
      "dining": 280,
      "costIndex": 72,
      "currency": "EUR"
    },
    {
      "cityName": "The Hague",
      "rent1BRCenter": 1350,
      "rent1BROutside": 1000,
      "rent3BRCenter": 2100,
      "utilities": 175,
      "groceries": 290,
      "transportation": 85,
      "dining": 270,
      "costIndex": 70,
      "currency": "EUR"
    }
  ]'::jsonb,
  -- job_market
  '{
    "topIndustries": ["Technology", "Finance", "Agriculture/Food", "Logistics", "Energy"],
    "growingSectors": ["FinTech", "AI/ML", "AgriTech", "Sustainability", "Cybersecurity"],
    "avgSalaryTech": 65000,
    "avgWorkHoursWeek": 36,
    "vacationDaysStandard": 25
  }'::jsonb,
  -- faqs
  '[
    {
      "question": "What is the 30% ruling and do I qualify?",
      "answer": "The 30% ruling allows qualifying expats to receive 30% of their salary tax-free for up to 5 years. You must be recruited from abroad, have specific expertise, and earn above a salary threshold (€46,107 for most, €35,048 for under 30 with masters). This can significantly boost your net income.",
      "category": "tax"
    },
    {
      "question": "Can US citizens easily move to the Netherlands?",
      "answer": "Yes! The DAFT (Dutch-American Friendship Treaty) visa is one of the easiest paths for US citizens. You only need €4,500 in investment capital and a viable business plan. It''s popular among freelancers, consultants, and small business owners. You can work as self-employed immediately.",
      "category": "visa"
    },
    {
      "question": "Do I need to speak Dutch?",
      "answer": "Not necessarily. The Netherlands has Europe''s highest English proficiency outside the UK. In Amsterdam and other major cities, you can work and live entirely in English. However, learning Dutch helps with integration, making friends, and accessing some services.",
      "category": "lifestyle"
    }
  ]'::jsonb,
  'Moving to the Netherlands 2025: Visa Guide, 30% Ruling & Jobs',
  'Complete guide to relocating to the Netherlands. 30% tax ruling, DAFT visa for Americans, Kennismigrant visa, and Amsterdam job market insights.'
)
ON CONFLICT (slug) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  hero_subtitle = EXCLUDED.hero_subtitle,
  quick_facts = EXCLUDED.quick_facts,
  highlights = EXCLUDED.highlights,
  visas = EXCLUDED.visas,
  cost_of_living = EXCLUDED.cost_of_living,
  job_market = EXCLUDED.job_market,
  faqs = EXCLUDED.faqs;

-- ============================================================================
-- 6. MEXICO (Popular digital nomad destination)
-- ============================================================================
INSERT INTO destinations (
  slug, country_name, flag, region, language,
  hero_title, hero_subtitle, hero_gradient, hero_image_url,
  enabled, featured, priority,
  quick_facts, highlights, visas, cost_of_living, job_market, faqs,
  meta_title, meta_description
) VALUES (
  'mexico',
  'Mexico',
  '🇲🇽',
  'North America',
  'Spanish',
  'Moving to Mexico',
  'Complete relocation guide for Mexico including visas, cost of living, and digital nomad lifestyle.',
  'from-green-600 to-red-600',
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600',
  true,
  true,
  12,
  -- quick_facts
  '[
    {"label": "Currency", "value": "MXN ($)", "icon": "💵"},
    {"label": "Population", "value": "130M", "icon": "👥"},
    {"label": "Time Zone", "value": "Multiple (UTC-5 to -8)", "icon": "🕐"},
    {"label": "Climate", "value": "Tropical/Desert", "icon": "🌴"}
  ]'::jsonb,
  -- highlights
  '[
    {"text": "Very low cost of living", "icon": "✓"},
    {"text": "No visa required for 180 days", "icon": "✓"},
    {"text": "Rich culture and cuisine", "icon": "✓"},
    {"text": "Growing expat community", "icon": "✓"},
    {"text": "Beautiful beaches and nature", "icon": "✓"},
    {"text": "Same time zones as US", "icon": "✓"},
    {"text": "Affordable healthcare", "icon": "✓"}
  ]'::jsonb,
  -- visas
  '[
    {
      "name": "Tourist Visa (FMM)",
      "description": "Visa-free entry for up to 180 days for most nationalities",
      "processingTime": "On arrival",
      "cost": "Free",
      "requirements": ["Valid passport (6 months)", "Return ticket", "Proof of funds"],
      "isWorkPermit": false,
      "isResidencyPath": false
    },
    {
      "name": "Temporary Resident Visa",
      "description": "1-4 year visa for those with income or family ties",
      "processingTime": "2-4 weeks",
      "cost": "$50-180 USD",
      "requirements": ["Proof of income ($2,700/month) or savings ($45,000)", "Passport", "Photos", "Application form"],
      "isWorkPermit": false,
      "isResidencyPath": true
    },
    {
      "name": "Permanent Resident Visa",
      "description": "For retirees, family reunification, or after 4 years temporary",
      "processingTime": "4-8 weeks",
      "cost": "$300-400 USD",
      "requirements": ["Higher income threshold ($4,050/month) or savings", "Or 4 years as temporary resident", "Family ties to Mexican citizen"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Work Visa",
      "description": "Employer-sponsored work permit",
      "processingTime": "4-8 weeks",
      "cost": "$150-300 USD",
      "requirements": ["Job offer from Mexican employer", "Employer applies for work permit", "Professional qualifications"],
      "isWorkPermit": true,
      "isResidencyPath": true
    }
  ]'::jsonb,
  -- cost_of_living
  '[
    {
      "cityName": "Mexico City",
      "rent1BRCenter": 800,
      "rent1BROutside": 500,
      "rent3BRCenter": 1400,
      "utilities": 50,
      "groceries": 200,
      "transportation": 30,
      "dining": 150,
      "costIndex": 35,
      "currency": "USD"
    },
    {
      "cityName": "Playa del Carmen",
      "rent1BRCenter": 900,
      "rent1BROutside": 600,
      "rent3BRCenter": 1600,
      "utilities": 80,
      "groceries": 220,
      "transportation": 40,
      "dining": 180,
      "costIndex": 40,
      "currency": "USD"
    },
    {
      "cityName": "Oaxaca",
      "rent1BRCenter": 400,
      "rent1BROutside": 300,
      "rent3BRCenter": 700,
      "utilities": 40,
      "groceries": 150,
      "transportation": 20,
      "dining": 100,
      "costIndex": 25,
      "currency": "USD"
    }
  ]'::jsonb,
  -- job_market
  '{
    "topIndustries": ["Tourism", "Manufacturing", "Automotive", "Agriculture", "Technology"],
    "growingSectors": ["Remote Work Hubs", "Software Development", "E-commerce", "Digital Marketing"],
    "avgSalaryTech": 30000,
    "avgWorkHoursWeek": 48,
    "vacationDaysStandard": 12
  }'::jsonb,
  -- faqs
  '[
    {
      "question": "Can I work remotely in Mexico on a tourist visa?",
      "answer": "Technically, the tourist visa (FMM) doesn''t permit work. However, many digital nomads work remotely for foreign companies while on tourist status, as you''re not employed by a Mexican company. For legal security, consider the Temporary Resident visa if staying long-term.",
      "category": "visa"
    },
    {
      "question": "How much money do I need to live comfortably in Mexico?",
      "answer": "You can live very comfortably on $1,500-2,500/month in most areas. Mexico City and beach towns like Playa del Carmen cost more ($2,000-3,000). Smaller cities like Oaxaca, Merida, or San Cristobal can be done well on $1,000-1,500/month.",
      "category": "housing"
    },
    {
      "question": "Is Mexico safe for expats?",
      "answer": "Many areas of Mexico are very safe, especially popular expat destinations. Cities like San Miguel de Allende, Merida, Oaxaca, and many parts of Mexico City have active expat communities and low crime. Research specific neighborhoods and use common sense precautions.",
      "category": "lifestyle"
    }
  ]'::jsonb,
  'Moving to Mexico 2025: Visa Guide, Cost of Living & Digital Nomad Life',
  'Complete guide to relocating to Mexico. Temporary resident visa, ultra-low cost of living, and digital nomad lifestyle in Mexico City, Playa del Carmen, and Oaxaca.'
)
ON CONFLICT (slug) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  hero_subtitle = EXCLUDED.hero_subtitle,
  quick_facts = EXCLUDED.quick_facts,
  highlights = EXCLUDED.highlights,
  visas = EXCLUDED.visas,
  cost_of_living = EXCLUDED.cost_of_living,
  job_market = EXCLUDED.job_market,
  faqs = EXCLUDED.faqs;

-- ============================================================================
-- 7. THAILAND (Popular digital nomad destination)
-- ============================================================================
INSERT INTO destinations (
  slug, country_name, flag, region, language,
  hero_title, hero_subtitle, hero_gradient, hero_image_url,
  enabled, featured, priority,
  quick_facts, highlights, visas, cost_of_living, job_market, faqs,
  meta_title, meta_description
) VALUES (
  'thailand',
  'Thailand',
  '🇹🇭',
  'Southeast Asia',
  'Thai (English in tourist areas)',
  'Moving to Thailand',
  'Complete relocation guide for Thailand including visas, cost of living, and digital nomad lifestyle.',
  'from-red-600 to-blue-600',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600',
  true,
  true,
  13,
  -- quick_facts
  '[
    {"label": "Currency", "value": "THB (฿)", "icon": "💵"},
    {"label": "Population", "value": "70M", "icon": "👥"},
    {"label": "Time Zone", "value": "ICT (UTC+7)", "icon": "🕐"},
    {"label": "Climate", "value": "Tropical", "icon": "🌴"}
  ]'::jsonb,
  -- highlights
  '[
    {"text": "Very low cost of living", "icon": "✓"},
    {"text": "Digital nomad visa available", "icon": "✓"},
    {"text": "Excellent healthcare at low cost", "icon": "✓"},
    {"text": "Beautiful beaches and islands", "icon": "✓"},
    {"text": "Strong expat community", "icon": "✓"},
    {"text": "Amazing food", "icon": "✓"},
    {"text": "Tropical lifestyle year-round", "icon": "✓"}
  ]'::jsonb,
  -- visas
  '[
    {
      "name": "Digital Nomad Visa (LTR)",
      "description": "Long-Term Resident visa for remote workers and wealthy individuals",
      "processingTime": "4-8 weeks",
      "cost": "$1,500",
      "requirements": ["Income $80,000+/year for 2 years", "Or $250,000 assets + $40,000 income", "Health insurance", "No criminal record"],
      "isWorkPermit": true,
      "isResidencyPath": true
    },
    {
      "name": "Thailand Elite Visa",
      "description": "Premium long-stay visa program (5-20 years)",
      "processingTime": "2-4 weeks",
      "cost": "$16,000-60,000",
      "requirements": ["One-time fee payment", "Valid passport", "No Thai criminal record", "No banned diseases"],
      "isWorkPermit": false,
      "isResidencyPath": false
    },
    {
      "name": "Education Visa (ED)",
      "description": "For students enrolled in Thai language or other courses",
      "processingTime": "2-4 weeks",
      "cost": "$80-150",
      "requirements": ["Enrollment in approved school", "Tuition payment", "Passport", "Photos"],
      "isWorkPermit": false,
      "isResidencyPath": false
    },
    {
      "name": "Retirement Visa (O-A)",
      "description": "For retirees aged 50+",
      "processingTime": "2-4 weeks",
      "cost": "$60",
      "requirements": ["Age 50+", "800,000 THB in Thai bank OR 65,000 THB/month income", "Health insurance", "Medical certificate"],
      "isWorkPermit": false,
      "isResidencyPath": false
    }
  ]'::jsonb,
  -- cost_of_living
  '[
    {
      "cityName": "Bangkok",
      "rent1BRCenter": 600,
      "rent1BROutside": 350,
      "rent3BRCenter": 1200,
      "utilities": 80,
      "groceries": 200,
      "transportation": 50,
      "dining": 150,
      "costIndex": 35,
      "currency": "USD"
    },
    {
      "cityName": "Chiang Mai",
      "rent1BRCenter": 350,
      "rent1BROutside": 200,
      "rent3BRCenter": 600,
      "utilities": 50,
      "groceries": 150,
      "transportation": 30,
      "dining": 100,
      "costIndex": 25,
      "currency": "USD"
    },
    {
      "cityName": "Phuket",
      "rent1BRCenter": 500,
      "rent1BROutside": 350,
      "rent3BRCenter": 900,
      "utilities": 70,
      "groceries": 180,
      "transportation": 100,
      "dining": 150,
      "costIndex": 35,
      "currency": "USD"
    }
  ]'::jsonb,
  -- job_market
  '{
    "topIndustries": ["Tourism", "Manufacturing", "Agriculture", "Electronics", "Automotive"],
    "growingSectors": ["Remote Work", "Digital Marketing", "Teaching English", "Content Creation"],
    "avgSalaryTech": 25000,
    "avgWorkHoursWeek": 44,
    "vacationDaysStandard": 6
  }'::jsonb,
  -- faqs
  '[
    {
      "question": "Can I get a digital nomad visa for Thailand?",
      "answer": "Yes! The Long-Term Resident (LTR) visa launched in 2022 offers remote workers a 10-year visa. You need to prove $80,000+/year income for the past 2 years, or have $250,000 in assets plus $40,000/year income. It includes a work permit and tax benefits.",
      "category": "visa"
    },
    {
      "question": "What is the real cost of living in Thailand?",
      "answer": "You can live comfortably on $1,000-1,500/month in Chiang Mai or smaller cities. Bangkok requires $1,500-2,500 for a comfortable lifestyle. Many nomads live on $800-1,200 with a simple lifestyle. Western-style living costs more ($2,000-3,000).",
      "category": "housing"
    },
    {
      "question": "Is healthcare good in Thailand?",
      "answer": "Yes! Thailand is a medical tourism destination with excellent private hospitals at affordable prices. Bangkok''s Bumrungrad Hospital is world-class. A doctor visit costs $20-50, and comprehensive health insurance runs $1,000-2,000/year. Public healthcare exists but has long waits.",
      "category": "healthcare"
    }
  ]'::jsonb,
  'Moving to Thailand 2025: Visa Guide, Cost of Living & Digital Nomad Life',
  'Complete guide to relocating to Thailand. Digital nomad visa (LTR), ultra-low cost of living, and expat lifestyle in Bangkok, Chiang Mai, and Phuket.'
)
ON CONFLICT (slug) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  hero_subtitle = EXCLUDED.hero_subtitle,
  quick_facts = EXCLUDED.quick_facts,
  highlights = EXCLUDED.highlights,
  visas = EXCLUDED.visas,
  cost_of_living = EXCLUDED.cost_of_living,
  job_market = EXCLUDED.job_market,
  faqs = EXCLUDED.faqs;

-- Verify the inserts
SELECT slug, country_name, featured, priority FROM destinations ORDER BY priority DESC;
