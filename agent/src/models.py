"""Pydantic models for Relocation Quest V2 agent."""

from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
from enum import Enum


class Article(BaseModel):
    """Article/guide from the Relocation Quest knowledge base."""
    id: str
    title: str
    content: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    hero_image_url: Optional[str] = None
    score: float = 0.0


class SearchResults(BaseModel):
    """Results from article search."""
    articles: list[Article]
    query: str


class ArticleCardData(BaseModel):
    """Data for rendering an article card in the UI."""
    id: str
    title: str
    excerpt: str
    hero_image_url: Optional[str] = None
    slug: str
    score: float = 0.0


class MapLocation(BaseModel):
    """Location data for map rendering."""
    name: str
    lat: float
    lng: float
    description: Optional[str] = None


class TimelineEvent(BaseModel):
    """Event for timeline visualization (visa processing steps)."""
    year: int
    title: str
    description: str
    article_id: Optional[str] = None


class ATLASResponse(BaseModel):
    """Structured response from ATLAS agent."""
    response_text: str = Field(description="ATLAS's spoken response to the user")
    source_titles: list[str] = Field(default_factory=list, description="Titles of articles used")


class AppState(BaseModel):
    """Shared state between frontend and agent."""
    current_topic: Optional[str] = None
    last_articles: list[ArticleCardData] = Field(default_factory=list)
    user_name: Optional[str] = None
    conversation_history: list[str] = Field(default_factory=list)


# =============================================================================
# MULTI-AGENT MODELS
# =============================================================================

class SpeakerSegment(BaseModel):
    """
    A segment of a multi-agent response.

    Used when ATLAS delegates to Destination Expert - each response segment
    is tagged with who is speaking.
    """
    speaker: Literal["atlas", "destination_expert"] = Field(
        description="Which agent is speaking: 'atlas' for advice, 'destination_expert' for research"
    )
    content: str = Field(description="The text content of this segment")
    ui_components: list[str] = Field(
        default_factory=list,
        description="UI components to render (e.g., 'ArticleGrid', 'LocationMap')"
    )
    ui_data: Optional[Any] = Field(
        default=None,
        description="Data for the UI components (articles, location, etc.)"
    )


class MultiAgentResponse(BaseModel):
    """
    Response from multi-agent interaction.

    Contains segments from ATLAS and/or Destination Expert, plus metadata.
    """
    segments: list[SpeakerSegment] = Field(
        default_factory=list,
        description="Ordered list of response segments from different speakers"
    )
    mode: Literal["dual_voice", "atlas_narrates"] = Field(
        default="atlas_narrates",
        description="Voice mode: 'atlas_narrates' = single voice, 'dual_voice' = separate voices"
    )
    primary_speaker: Literal["atlas", "destination_expert"] = Field(
        default="atlas",
        description="The primary speaker for this response"
    )


class DestinationExpertDelegation(BaseModel):
    """
    Result from delegating to the Destination Expert agent.

    Used by ATLAS when calling delegate_to_destination_expert tool.
    """
    speaker: Literal["destination_expert"] = "destination_expert"
    content: str = Field(description="Destination Expert's brief response")
    ui_component: Optional[str] = Field(
        default=None,
        description="UI component to render (ArticleGrid, LocationMap, Timeline, DestinationStats)"
    )
    ui_data: Optional[Any] = Field(
        default=None,
        description="Data for the UI component"
    )
    found: bool = Field(default=True, description="Whether the research found results")


# =============================================================================
# EXTENDED DESTINATION DATA MODELS
# =============================================================================

class TuitionRange(BaseModel):
    """Tuition cost range for a type of education."""
    min: int
    max: int
    currency: str = "EUR"
    note: Optional[str] = None


class NotableInstitution(BaseModel):
    """A notable educational institution."""
    name: str
    type: str  # public, private, international
    ranking: Optional[int] = None
    level: Optional[str] = None  # K-12, university
    curriculum: Optional[str] = None
    programs: list[str] = Field(default_factory=list)


class EducationStats(BaseModel):
    """Education and schooling data for a destination."""
    university_ranking_range: Optional[str] = None
    international_schools_count: Optional[int] = None
    public_schools_count: Optional[int] = None
    tuition_range: Optional[dict[str, TuitionRange]] = None
    languages_of_instruction: list[str] = Field(default_factory=list)
    notable_institutions: list[NotableInstitution] = Field(default_factory=list)
    student_visa_available: bool = False
    post_study_work_rights: Optional[str] = None
    international_student_population: Optional[int] = None
    education_quality_index: Optional[int] = None


class CostRange(BaseModel):
    """Cost range with currency."""
    min: int
    max: int
    currency: str = "EUR"
    note: Optional[str] = None


class CompanyType(BaseModel):
    """Type of company that can be incorporated."""
    name: str
    local_name: Optional[str] = None
    min_directors: int = 1
    min_shareholders: int = 1
    local_director_required: bool = False
    local_secretary_required: bool = False
    audit_required: bool = True
    common_use: Optional[str] = None


class CompanyIncorporation(BaseModel):
    """Business incorporation data for a destination."""
    corporate_tax_rate: Optional[float] = None
    effective_tax_rate_with_incentives: Optional[float] = None
    minimum_share_capital: Optional[CostRange] = None
    incorporation_time_days: Optional[int] = None
    incorporation_cost_range: Optional[CostRange] = None
    annual_compliance_cost: Optional[CostRange] = None
    company_types: list[CompanyType] = Field(default_factory=list)
    vat_registration_threshold: Optional[int] = None
    standard_vat_rate: Optional[int] = None
    ip_box_regime: bool = False
    ip_box_rate: Optional[float] = None
    ip_box_details: Optional[str] = None
    holding_company_benefits: list[str] = Field(default_factory=list)
    notional_interest_deduction: bool = False
    notional_interest_rate: Optional[float] = None
    tonnage_tax_available: bool = False
    tonnage_tax_details: Optional[str] = None
    bank_account_opening_time: Optional[str] = None
    nominee_services_available: bool = False


class PropertyTax(BaseModel):
    """Property tax information."""
    rate: Optional[str] = None
    basis: Optional[str] = None
    typical: Optional[str] = None


class TransferTaxBracket(BaseModel):
    """Transfer tax bracket."""
    threshold: Optional[int] = None
    above: Optional[int] = None
    rate: float


class CapitalGainsTax(BaseModel):
    """Capital gains tax information."""
    rate: float
    exemptions: list[str] = Field(default_factory=list)
    allowable_deductions: list[str] = Field(default_factory=list)


class PropertyInfo(BaseModel):
    """Property and real estate data for a destination."""
    foreigners_can_buy: bool = True
    restrictions: list[str] = Field(default_factory=list)
    property_tax_annual: Optional[dict] = None
    transfer_tax: Optional[dict] = None
    stamp_duty: Optional[dict] = None
    capital_gains_tax: Optional[CapitalGainsTax] = None
    mortgage_availability: bool = True
    typical_ltv: Optional[dict] = None
    mortgage_interest_rates: Optional[dict] = None
    avg_price_sqm: Optional[dict] = None
    rental_yield: Optional[dict] = None
    property_buying_process_weeks: Optional[str] = None
    title_deed_system: Optional[str] = None


class ExpatriateBenefit(BaseModel):
    """A benefit of an expatriate tax scheme."""
    type: str
    description: str
    effective_tax: Optional[str] = None
    duration: Optional[str] = None


class ExpatriateScheme(BaseModel):
    """Tax incentive schemes for expatriates."""
    name: Optional[str] = None
    introduced_year: Optional[int] = None
    eligibility: list[str] = Field(default_factory=list)
    benefits: list[ExpatriateBenefit] = Field(default_factory=list)
    duration_years: Optional[int] = None
    application_required: bool = False
    application_cost: Optional[int] = None
    additional_incentives: list[dict] = Field(default_factory=list)


class ResidencyPathway(BaseModel):
    """Single residency pathway."""
    name: str
    type: Optional[str] = None  # temporary, permanent
    minimum_income_monthly: Optional[float] = None
    minimum_income_annual: Optional[float] = None
    income_currency: Optional[str] = "EUR"
    income_proof: Optional[str] = None
    employment_type: Optional[str] = None
    requires_job_offer: bool = False
    employer_sponsor: bool = False
    initial_duration_months: Optional[int] = None
    renewable: bool = True
    max_duration_years: Optional[int] = None
    path_to_pr: bool = False
    years_to_pr: Optional[int] = None
    path_to_citizenship: bool = False
    years_to_citizenship: Optional[int] = None
    processing_time_weeks: Optional[int] = None
    processing_time_months: Optional[int] = None
    application_fee: Optional[int] = None
    health_insurance_required: bool = True
    health_insurance_min_coverage: Optional[int] = None
    clean_criminal_record: bool = True
    can_bring_family: bool = True
    family_income_addition: Optional[str] = None
    deposit_required: Optional[dict] = None
    investment_options: list[dict] = Field(default_factory=list)
    valid_for: Optional[str] = None


class CitizenshipInfo(BaseModel):
    """Citizenship requirements and rules."""
    available: bool = True
    years_residency_required: Optional[int] = None
    continuous_residency_last_year: bool = False
    language_requirement: Optional[str] = None
    citizenship_test: bool = False
    dual_citizenship_allowed: bool = True
    citizenship_by_investment: bool = False
    citizenship_by_investment_note: Optional[str] = None
    naturalization_fee: Optional[int] = None


class ResidencyRequirements(BaseModel):
    """Residency and citizenship requirements."""
    pathways: list[ResidencyPathway] = Field(default_factory=list)
    citizenship: Optional[CitizenshipInfo] = None
    physical_presence_requirement: Optional[dict] = None
    eu_benefits: Optional[dict] = None


class QuickFact(BaseModel):
    """Quick fact about a destination."""
    icon: str
    label: str
    value: str


class Highlight(BaseModel):
    """Highlight/feature of a destination."""
    text: str
    icon: Optional[str] = None


class VisaOption(BaseModel):
    """Visa option for a destination."""
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    duration: Optional[str] = None
    processingTime: Optional[str] = None
    cost: Optional[str] = None
    requirements: list[str] = Field(default_factory=list)
    isWorkPermit: bool = False
    isResidencyPath: bool = False


class CityCoL(BaseModel):
    """Cost of living for a city."""
    cityName: str
    rent1BRCenter: Optional[int] = None
    rent1BROutside: Optional[int] = None
    rent3BRCenter: Optional[int] = None
    utilities: Optional[int] = None
    groceries: Optional[int] = None
    transportation: Optional[int] = None
    dining: Optional[int] = None
    costIndex: Optional[int] = None
    currency: str = "EUR"


class JobMarket(BaseModel):
    """Job market data for a destination."""
    topIndustries: list[str] = Field(default_factory=list)
    growingSectors: list[str] = Field(default_factory=list)
    avgSalaryTech: Optional[int] = None
    avgWorkHoursWeek: Optional[int] = None
    vacationDaysStandard: Optional[int] = None
    remote_friendly: bool = True
    in_demand_sectors: list[str] = Field(default_factory=list)


class FAQ(BaseModel):
    """Frequently asked question."""
    question: str
    answer: str
    category: Optional[str] = None


class FullDestinationData(BaseModel):
    """
    Complete destination data including all extended fields.

    Used by confirm_destination tool to return all data for full section reveal.
    """
    slug: str
    country_name: str
    flag: str
    region: Optional[str] = None
    language: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None

    # Existing structured data
    quick_facts: list[QuickFact] = Field(default_factory=list)
    highlights: list[Highlight] = Field(default_factory=list)
    visas: list[VisaOption] = Field(default_factory=list)
    cost_of_living: list[CityCoL] = Field(default_factory=list)
    job_market: Optional[JobMarket] = None
    faqs: list[FAQ] = Field(default_factory=list)

    # Extended data (new)
    education_stats: Optional[EducationStats] = None
    company_incorporation: Optional[CompanyIncorporation] = None
    property_info: Optional[PropertyInfo] = None
    expatriate_scheme: Optional[ExpatriateScheme] = None
    residency_requirements: Optional[ResidencyRequirements] = None


class ConfirmDestinationResult(BaseModel):
    """
    Result from confirm_destination tool.

    Contains all data needed for the full section reveal.
    """
    found: bool = True
    confirmed: bool = True
    destination: str
    slug: str
    flag: str
    region: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    language: Optional[str] = None

    # All section data
    quick_facts: list[dict] = Field(default_factory=list)
    highlights: list[dict] = Field(default_factory=list)
    visas: list[dict] = Field(default_factory=list)
    cost_of_living: list[dict] = Field(default_factory=list)
    job_market: dict = Field(default_factory=dict)
    faqs: list[dict] = Field(default_factory=list)

    # Extended sections (new)
    education_stats: dict = Field(default_factory=dict)
    company_incorporation: dict = Field(default_factory=dict)
    property_info: dict = Field(default_factory=dict)
    expatriate_scheme: dict = Field(default_factory=dict)
    residency_requirements: dict = Field(default_factory=dict)

    # UI hints
    ui_component: str = "FullDestinationReveal"
    trigger_phase_change: str = "confirmed"
