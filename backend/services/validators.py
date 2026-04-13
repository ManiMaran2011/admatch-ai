"""
validators.py — Guardrails layer
Runs BEFORE rewriting the page.
Checks the CROPlan for hallucinations, empty fields,
and consistency issues. Sanitizes or rejects bad outputs.
"""
import logging
from models.schemas import CROPlan, AdAnalysis, PageAnalysis, ValidationResult

logger = logging.getLogger(__name__)

MAX_H1_LEN      = 120
MAX_CTA_LEN     = 60
MAX_BANNER_LEN  = 100

def validate_plan(
    plan:  CROPlan,
    ad:    AdAnalysis,
    page:  PageAnalysis,
) -> ValidationResult:
    issues   = []
    warnings = []

    # ── 1. Empty fields check ─────────────────────────────────────────────────
    if not plan.suggestions:
        issues.append("CRO plan has no suggestions")

    if not plan.personalization_banner:
        warnings.append("No personalization banner — using default")
        plan.personalization_banner = f"Welcome! This page was personalized for you."

    # ── 2. Length guards ──────────────────────────────────────────────────────
    for s in plan.suggestions:
        if s.element == "h1" and len(s.replacement) > MAX_H1_LEN:
            warnings.append(f"H1 too long ({len(s.replacement)} chars), truncating")
            s.replacement = s.replacement[:MAX_H1_LEN].rsplit(" ",1)[0]

        if s.element == "cta" and len(s.replacement) > MAX_CTA_LEN:
            warnings.append(f"CTA too long ({len(s.replacement)} chars), truncating")
            s.replacement = s.replacement[:MAX_CTA_LEN].rsplit(" ",1)[0]

    if len(plan.personalization_banner) > MAX_BANNER_LEN:
        plan.personalization_banner = plan.personalization_banner[:MAX_BANNER_LEN]

    # ── 3. Hallucination guard ────────────────────────────────────────────────
    # Check replacement text doesn't contain fabricated % claims or made-up numbers
    # that weren't in either the ad or the page
    ad_numbers   = _extract_numbers(ad.value_proposition + ad.headline + " ".join(ad.key_benefits))
    page_numbers = _extract_numbers(page.body_snippet)
    known_numbers = ad_numbers | page_numbers

    for s in plan.suggestions:
        claimed = _extract_numbers(s.replacement)
        hallucinated = claimed - known_numbers
        if hallucinated:
            issues.append(
                f"Hallucinated numbers in '{s.element}': {hallucinated} — not found in ad or page. Reverting."
            )
            s.replacement = s.original  # revert to original

    # ── 4. CTA consistency check ──────────────────────────────────────────────
    for s in plan.suggestions:
        if s.element == "cta" and s.replacement:
            ad_action = _extract_verb(ad.cta_copy)
            plan_action = _extract_verb(s.replacement)
            if ad_action and plan_action and ad_action != plan_action:
                warnings.append(
                    f"CTA verb mismatch: ad says '{ad_action}', plan says '{plan_action}'"
                )

    # ── 5. Confidence floor ───────────────────────────────────────────────────
    if plan.confidence_score < 0.3:
        warnings.append(f"Low confidence ({plan.confidence_score:.0%}) — results may be weak")

    passed = len(issues) == 0
    if not passed:
        logger.warning(f"Validation issues: {issues}")

    return ValidationResult(
        passed=passed,
        issues=issues,
        warnings=warnings,
        sanitized_plan=plan,
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

import re

def _extract_numbers(text: str) -> set:
    """Extract numeric values from text (e.g. '50%', '10x', '$99')"""
    return set(re.findall(r'\b\d+(?:\.\d+)?(?:%|x|\$)?\b', text.lower()))

def _extract_verb(text: str) -> str:
    """Get the first word (usually the action verb) from a CTA"""
    words = text.strip().lower().split()
    return words[0] if words else ""