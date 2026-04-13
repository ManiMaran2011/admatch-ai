"""
pipeline.py — The Orchestrator
Runs all 5 agents in sequence, validates output at each step,
and returns a complete PipelineResult.

Flow:
  ad_analyzer  →  page_analyzer  →  gap_detector
       →  cro_optimizer  →  validators  →  rewriter
"""
import time, logging
from models.schemas import PipelineResult, AdAnalysis
from services.agents.ad_analyzer   import analyze_ad_from_url, analyze_ad_from_bytes
from services.agents.page_analyzer import fetch_and_analyze
from services.agents.gap_detector  import detect_gaps
from services.agents.cro_optimizer import optimize
from services.agents.rewriter      import apply_plan
from services.validators           import validate_plan

logger = logging.getLogger(__name__)


async def run_pipeline(
    landing_page_url: str,
    ad_image_url:   str | None = None,
    ad_image_bytes: bytes | None = None,
    ad_image_mime:  str = "image/jpeg",
) -> PipelineResult:
    start = time.monotonic()

    # ── Stage 1: Analyze ad ───────────────────────────────────────────────────
    logger.info("[1/5] ad_analyzer starting")
    if ad_image_bytes:
        ad_analysis = await analyze_ad_from_bytes(ad_image_bytes, ad_image_mime)
    else:
        ad_analysis = await analyze_ad_from_url(ad_image_url)
    logger.info(f"[1/5] done — confidence {ad_analysis.confidence:.0%}")

    # ── Stage 2: Analyze page ─────────────────────────────────────────────────
    logger.info("[2/5] page_analyzer starting")
    page_analysis, original_html = await fetch_and_analyze(landing_page_url)
    logger.info(f"[2/5] done — h1='{page_analysis.h1[:50]}'")

    # ── Stage 3: Detect gaps ──────────────────────────────────────────────────
    logger.info("[3/5] gap_detector starting")
    gap_report = await detect_gaps(ad_analysis, page_analysis)
    logger.info(f"[3/5] done — {len(gap_report.gaps)} gaps, match={gap_report.overall_match_score:.0%}")

    # ── Stage 4: Generate CRO plan ────────────────────────────────────────────
    logger.info("[4/5] cro_optimizer starting")
    cro_plan = await optimize(ad_analysis, page_analysis, gap_report)
    logger.info(f"[4/5] done — {len(cro_plan.suggestions)} suggestions")

    # ── Stage 4.5: Validate + guardrails ─────────────────────────────────────
    logger.info("[4.5/5] validators running")
    validation = validate_plan(cro_plan, ad_analysis, page_analysis)
    safe_plan  = validation.sanitized_plan or cro_plan
    if not validation.passed:
        logger.warning(f"Validation issues: {validation.issues}")

    # ── Stage 5: Rewrite HTML ─────────────────────────────────────────────────
    logger.info("[5/5] rewriter starting")
    rewrite = apply_plan(original_html, safe_plan, ad_analysis)
    logger.info(f"[5/5] done — applied={rewrite.changes_applied}, skipped={rewrite.changes_skipped}")

    elapsed = int((time.monotonic() - start) * 1000)
    logger.info(f"Pipeline complete in {elapsed}ms")

    return PipelineResult(
        success=True,
        original_url=landing_page_url,
        processing_time_ms=elapsed,
        personalized_html=rewrite.personalized_html,
        ad_analysis=ad_analysis,
        page_analysis=page_analysis,
        gap_report=gap_report,
        cro_plan=safe_plan,
        validation=validation,
        changes_applied=rewrite.changes_applied,
    )