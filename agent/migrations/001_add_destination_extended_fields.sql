-- Migration: Add extended destination fields for single-page conversational experience
-- Date: 2026-01-12
-- Description: Adds education_stats, company_incorporation, property_info, expatriate_scheme, residency_requirements

-- Add new JSONB columns to destinations table
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS education_stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company_incorporation JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS property_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expatriate_scheme JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS residency_requirements JSONB DEFAULT '{}';

-- Create indexes for JSONB fields (for future queries)
CREATE INDEX IF NOT EXISTS idx_destinations_education ON destinations USING GIN (education_stats);
CREATE INDEX IF NOT EXISTS idx_destinations_company ON destinations USING GIN (company_incorporation);
CREATE INDEX IF NOT EXISTS idx_destinations_property ON destinations USING GIN (property_info);
CREATE INDEX IF NOT EXISTS idx_destinations_expatriate ON destinations USING GIN (expatriate_scheme);
CREATE INDEX IF NOT EXISTS idx_destinations_residency ON destinations USING GIN (residency_requirements);

-- Seed Cyprus with extended data
UPDATE destinations
SET
  education_stats = '{
    "university_ranking_range": "401-600",
    "international_schools_count": 35,
    "public_schools_count": 380,
    "tuition_range": {
      "local_public": {"min": 0, "max": 500, "currency": "EUR", "note": "Free for EU citizens"},
      "international_private": {"min": 6000, "max": 18000, "currency": "EUR"},
      "university_public": {"min": 3500, "max": 8000, "currency": "EUR"},
      "university_private": {"min": 8000, "max": 15000, "currency": "EUR"}
    },
    "languages_of_instruction": ["Greek", "English", "Russian"],
    "notable_institutions": [
      {"name": "University of Cyprus", "type": "public", "ranking": 401, "programs": ["Engineering", "Business", "Medicine"]},
      {"name": "Cyprus University of Technology", "type": "public", "ranking": 550, "programs": ["Technology", "Health Sciences"]},
      {"name": "European University Cyprus", "type": "private", "programs": ["Business", "Law", "Medicine"]},
      {"name": "University of Nicosia", "type": "private", "programs": ["Digital Currency", "Business", "Law"]},
      {"name": "The English School", "type": "international", "level": "K-12", "curriculum": "British"}
    ],
    "student_visa_available": true,
    "post_study_work_rights": "1 year with option to extend",
    "international_student_population": 25000,
    "education_quality_index": 72
  }'::jsonb,

  company_incorporation = '{
    "corporate_tax_rate": 12.5,
    "effective_tax_rate_with_incentives": 2.5,
    "minimum_share_capital": {"amount": 1000, "currency": "EUR", "note": "No minimum for Ltd"},
    "incorporation_time_days": 5,
    "incorporation_cost_range": {"min": 1500, "max": 3500, "currency": "EUR"},
    "annual_compliance_cost": {"min": 2000, "max": 4000, "currency": "EUR"},
    "company_types": [
      {
        "name": "Private Company Limited by Shares",
        "local_name": "Ltd / Eteria Periorismenis Efthinis",
        "min_directors": 1,
        "min_shareholders": 1,
        "local_director_required": false,
        "local_secretary_required": true,
        "audit_required": true,
        "common_use": "Most popular for international business"
      },
      {
        "name": "Public Company Limited",
        "local_name": "PLC",
        "min_directors": 2,
        "min_shareholders": 7,
        "local_director_required": false,
        "audit_required": true,
        "common_use": "Listed companies, large operations"
      },
      {
        "name": "Branch of Foreign Company",
        "min_directors": 0,
        "local_director_required": false,
        "audit_required": true,
        "common_use": "Extension of parent company operations"
      }
    ],
    "vat_registration_threshold": 15600,
    "standard_vat_rate": 19,
    "ip_box_regime": true,
    "ip_box_rate": 2.5,
    "ip_box_details": "80% exemption on qualifying IP income",
    "holding_company_benefits": [
      "Participation exemption on dividends (no withholding tax)",
      "No capital gains tax on disposal of securities",
      "No withholding tax on outbound dividends to non-residents",
      "No withholding tax on interest and royalty payments",
      "60+ Double Tax Treaties"
    ],
    "notional_interest_deduction": true,
    "notional_interest_rate": 3.5,
    "tonnage_tax_available": true,
    "tonnage_tax_details": "Favorable regime for shipping companies",
    "bank_account_opening_time": "2-4 weeks",
    "nominee_services_available": true
  }'::jsonb,

  property_info = '{
    "foreigners_can_buy": true,
    "restrictions": [
      "Non-EU citizens limited to one property (can be waived)",
      "Council of Ministers approval needed for non-EU buyers",
      "Cannot purchase in military/protected zones"
    ],
    "property_tax_annual": {
      "immovable_property_tax": "Abolished in 2017",
      "municipal_taxes": {"rate": "0.1-0.2%", "basis": "1980 property values"},
      "sewerage_tax": {"rate": "Fixed amount", "typical": "150-350 EUR/year"}
    },
    "transfer_tax": {
      "rates": [
        {"threshold": 85000, "rate": 3},
        {"threshold": 170000, "rate": 5},
        {"above": 170000, "rate": 8}
      ],
      "vat_alternative": 19,
      "note": "VAT applies instead of transfer tax for new properties from developers"
    },
    "stamp_duty": {"rate": "0.15-0.20%", "max": 20000},
    "capital_gains_tax": {
      "rate": 20,
      "exemptions": [
        "Primary residence (up to EUR 85,430 gain)",
        "Agricultural land by farmers (EUR 25,629)",
        "Gifts between family members",
        "Transfers due to company reorganization"
      ],
      "allowable_deductions": ["Inflation allowance", "Improvement costs", "Transfer expenses"]
    },
    "mortgage_availability": true,
    "typical_ltv": {"eu_citizens": 80, "non_eu": 70},
    "mortgage_interest_rates": {"min": 3.5, "max": 5.5, "type": "variable"},
    "avg_price_sqm": {
      "limassol_center": 4500,
      "limassol_suburbs": 2800,
      "nicosia_center": 2200,
      "paphos_center": 2500,
      "larnaca_center": 1800,
      "currency": "EUR"
    },
    "rental_yield": {"typical": "4-6%", "prime": "3-4%"},
    "property_buying_process_weeks": "8-12",
    "title_deed_system": "Well-established, UK-based"
  }'::jsonb,

  expatriate_scheme = '{
    "name": "Cyprus Non-Domiciled (Non-Dom) Tax Regime",
    "introduced_year": 2015,
    "eligibility": [
      "Not tax resident in Cyprus for 17 of the 20 years prior to becoming tax resident",
      "Become Cyprus tax resident (183+ days OR 60-day rule)",
      "No application required - automatic upon meeting criteria"
    ],
    "benefits": [
      {
        "type": "Dividend Income Exemption",
        "description": "100% exemption from Special Defence Contribution (SDC) on dividends",
        "effective_tax": "0%",
        "duration": "17 years"
      },
      {
        "type": "Interest Income Exemption",
        "description": "100% exemption from SDC on interest income",
        "effective_tax": "0%",
        "duration": "17 years"
      },
      {
        "type": "Rental Income",
        "description": "Exempt from SDC (3% for residents)",
        "effective_tax": "Standard income tax only",
        "duration": "17 years"
      },
      {
        "type": "Foreign Pension Income",
        "description": "Only 5% taxed above EUR 3,420",
        "effective_tax": "Max 1.75%",
        "duration": "Permanent"
      }
    ],
    "duration_years": 17,
    "application_required": false,
    "application_cost": 0,
    "60_day_rule": {
      "description": "Alternative to 183-day rule for tax residency",
      "requirements": [
        "Spend at least 60 days in Cyprus",
        "Do not spend more than 183 days in any other single country",
        "Not tax resident in any other country",
        "Have a permanent residence in Cyprus (owned or rented)",
        "Carry on business or be employed in Cyprus"
      ]
    },
    "additional_incentives": [
      {
        "name": "50% Income Tax Exemption",
        "eligibility": "First employment in Cyprus with salary > EUR 55,000",
        "duration": "17 years (extended from 10 years in 2022)",
        "note": "Does not apply to existing Cyprus tax residents"
      },
      {
        "name": "20% or EUR 8,550 Exemption",
        "eligibility": "First employment in Cyprus regardless of salary",
        "duration": "7 years",
        "note": "Alternative to 50% exemption for lower salaries"
      }
    ]
  }'::jsonb,

  residency_requirements = '{
    "pathways": [
      {
        "name": "Digital Nomad Visa",
        "type": "temporary",
        "minimum_income_monthly": 3500,
        "income_currency": "EUR",
        "income_proof": "6 months bank statements or employment contract",
        "employment_type": "remote_for_foreign_employer_or_self_employed",
        "initial_duration_months": 12,
        "renewable": true,
        "max_duration_years": 3,
        "path_to_pr": false,
        "processing_time_weeks": 4,
        "application_fee": 70,
        "health_insurance_required": true,
        "health_insurance_min_coverage": 30000,
        "clean_criminal_record": true,
        "can_bring_family": true,
        "family_income_addition": "+20% per dependent"
      },
      {
        "name": "Category F Permit (Self-Sufficient)",
        "type": "temporary_renewable",
        "minimum_income_annual": 30000,
        "income_currency": "EUR",
        "income_proof": "Passive income, pension, or remote work",
        "employment_type": "no_local_employment",
        "initial_duration_months": 12,
        "renewable": true,
        "path_to_pr": true,
        "years_to_pr": 5,
        "processing_time_weeks": 8,
        "application_fee": 500,
        "health_insurance_required": true,
        "deposit_required": {"amount": 15000, "currency": "EUR", "note": "Bank deposit in Cyprus"},
        "can_bring_family": true
      },
      {
        "name": "Permanent Residence by Investment",
        "type": "permanent",
        "investment_options": [
          {"type": "Real Estate", "amount": 300000, "currency": "EUR", "note": "New property from developer"},
          {"type": "Company Investment", "amount": 300000, "currency": "EUR", "note": "In Cyprus company + 5 employees"}
        ],
        "income_requirement_annual": 50000,
        "income_currency": "EUR",
        "processing_time_months": 2,
        "application_fee": 500,
        "valid_for": "Lifetime",
        "path_to_citizenship": true,
        "years_to_citizenship": 7,
        "can_bring_family": true,
        "family_income_addition": "+15,000 EUR per dependent"
      },
      {
        "name": "Employment Visa",
        "type": "temporary",
        "requires_job_offer": true,
        "employer_sponsor": true,
        "initial_duration_months": 12,
        "renewable": true,
        "processing_time_weeks": 6,
        "path_to_pr": true,
        "years_to_pr": 5
      }
    ],
    "citizenship": {
      "available": true,
      "years_residency_required": 7,
      "continuous_residency_last_year": true,
      "language_requirement": "Basic Greek (A2 level)",
      "citizenship_test": true,
      "dual_citizenship_allowed": true,
      "citizenship_by_investment": false,
      "citizenship_by_investment_note": "Program closed in November 2020",
      "naturalization_fee": 500
    },
    "physical_presence_requirement": {
      "for_pr": "None specified for investment route",
      "for_citizenship": "7 years cumulative, last year continuous",
      "temporary_permits": "Must not be absent for more than 3 months consecutively"
    },
    "eu_benefits": {
      "pr_holders": "Can live and work in Cyprus only",
      "citizens": "Full EU freedom of movement",
      "note": "Cyprus citizenship = EU citizenship"
    }
  }'::jsonb
WHERE slug = 'cyprus';

-- Verify the update
SELECT slug, country_name,
       education_stats IS NOT NULL as has_education,
       company_incorporation IS NOT NULL as has_company,
       property_info IS NOT NULL as has_property,
       expatriate_scheme IS NOT NULL as has_expatriate,
       residency_requirements IS NOT NULL as has_residency
FROM destinations
WHERE slug = 'cyprus';
