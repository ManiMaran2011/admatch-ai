from pydantic import BaseModel, Field
from typing import List, Optional, Dict

# ── Per-Agent Outputs ─────────────────────────────────────────────────────────

class AdAnalysis(BaseModel):
    """Output from ad_analyzer agent"""
    headline: str = ""
    value_proposition: str = ""
    offer: str = ""
    target_audience: str = ""
    intent: str = ""          # awareness / consideration / conversion
    tone: str = ""
    cta_copy: str = ""
    emotional_hook: str = ""
    urgency_signals: str = ""
    product_category: str = ""
    key_benefits: List[str] = []
    keywords: List[str] = []
    brand_colors: List[str] = []
    confidence: float = 0.0

class PageAnalysis(BaseModel):
    """Output from page_analyzer agent"""
    title: str = ""
    meta_description: str = ""
    h1: str = ""
    h2s: List[str] = []
    hero_copy: str = ""
    cta_texts: List[str] = []
    value_props: List[str] = []
    tone: str = ""
    body_snippet: str = ""
    detected_audience: str = ""

class MessageGap(BaseModel):
    """One detected gap between ad and page"""
    field: str            # e.g. "headline", "cta", "audience"
    ad_value: str
    page_value: str
    severity: str         # "high" | "medium" | "low"
    suggestion: str

class GapReport(BaseModel):
    """Output from gap_detector agent"""
    gaps: List[MessageGap] = []
    overall_match_score: float = 0.0
    summary: str = ""

class CROSuggestion(BaseModel):
    """One specific CRO change"""
    element: str          # "h1", "cta", "hero_copy", "urgency_banner" etc.
    original: str
    replacement: str
    reason: str
    cro_principle: str    # "message match" | "clarity" | "urgency" | "social proof"

class CROPlan(BaseModel):
    """Output from cro_optimizer agent"""
    suggestions: List[CROSuggestion] = []
    personalization_banner: str = ""
    urgency_banner: str = ""
    seo_title: str = ""
    confidence_score: float = 0.0
    changes_summary: str = ""

class RewriteResult(BaseModel):
    """Output from rewriter agent"""
    personalized_html: str = ""
    changes_applied: List[str] = []
    changes_skipped: List[str] = []

class ValidationResult(BaseModel):
    """Output from validators"""
    passed: bool = True
    issues: List[str] = []
    warnings: List[str] = []
    sanitized_plan: Optional[CROPlan] = None

# ── Pipeline ──────────────────────────────────────────────────────────────────

class PipelineResult(BaseModel):
    """Full pipeline output returned to frontend"""
    success: bool
    original_url: str
    processing_time_ms: int
    personalized_html: str
    # Per-stage outputs (shown in UI)
    ad_analysis: AdAnalysis
    page_analysis: PageAnalysis
    gap_report: GapReport
    cro_plan: CROPlan
    validation: ValidationResult
    changes_applied: List[str] = []

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    stage: Optional[str] = None   # which pipeline stage failed