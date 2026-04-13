"""
Agent 3 — Gap Detector
Compares AdAnalysis vs PageAnalysis and identifies every
message-match gap. Assigns severity and suggests fixes.
Input:  AdAnalysis + PageAnalysis
Output: GapReport
"""
import json, re, logging
from openai import AsyncOpenAI
from models.schemas import AdAnalysis, PageAnalysis, GapReport, MessageGap
from utils.config import settings

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM = """You are a CRO message-match expert.
Your job: find every gap between what the ad promises and what the landing page delivers.
Be specific, actionable, and accurate. Return ONLY valid JSON."""

def _parse(text: str) -> dict:
    cleaned = re.sub(r"```json|```", "", text).strip()
    try: return json.loads(cleaned)
    except Exception:
        m = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if m:
            try: return json.loads(m.group())
            except Exception: pass
    return {}

async def detect_gaps(ad: AdAnalysis, page: PageAnalysis) -> GapReport:
    prompt = f"""Compare this ad creative analysis vs landing page analysis.
Find every message-match gap.

AD CREATIVE:
{ad.model_dump_json(indent=2)}

LANDING PAGE:
{page.model_dump_json(indent=2)}

Return ONLY this JSON:
{{
  "gaps": [
    {{
      "field": "headline|cta|audience|tone|offer|urgency|value_prop",
      "ad_value": "what the ad says/implies",
      "page_value": "what the page currently says",
      "severity": "high|medium|low",
      "suggestion": "specific fix recommendation"
    }}
  ],
  "overall_match_score": 0.45,
  "summary": "2-3 sentence summary of the main alignment issues"
}}

Severity guide:
- high: visitor will be confused or bounce (headline mismatch, wrong CTA)
- medium: message weakened but page still makes sense  
- low: nice-to-have improvement"""

    try:
        r = await client.chat.completions.create(
            model=settings.OPENAI_MODEL_TEXT,
            max_tokens=1200,
            temperature=0.2,
            messages=[
                {"role":"system","content":SYSTEM},
                {"role":"user","content":prompt},
            ],
        )
        d = _parse(r.choices[0].message.content or "")
        if not d:
            return GapReport(summary="Could not detect gaps.", overall_match_score=0.5)

        gaps = [MessageGap(**g) for g in d.get("gaps", []) if isinstance(g, dict)]
        return GapReport(
            gaps=gaps,
            overall_match_score=float(d.get("overall_match_score", 0.5)),
            summary=d.get("summary",""),
        )
    except Exception as e:
        logger.error(f"gap_detector error: {e}")
        return GapReport(summary="Gap detection failed.", overall_match_score=0.5)