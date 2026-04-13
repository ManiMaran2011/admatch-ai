"""
Agent 4 — CRO Optimizer
Takes the gap report and generates a concrete, prioritized
list of surgical changes to apply to the page.
Input:  AdAnalysis + PageAnalysis + GapReport
Output: CROPlan
"""
import json, re, logging
from openai import AsyncOpenAI
from models.schemas import AdAnalysis, PageAnalysis, GapReport, CROPlan, CROSuggestion
from utils.config import settings

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM = """You are a world-class CRO specialist.
Rules you NEVER break:
1. Never invent claims not in the ad or existing page
2. Only suggest text changes — never layout or structural changes
3. CTA must mirror the ad's exact action language
4. Be concise — clarity beats cleverness
5. Return ONLY valid JSON"""

def _parse(text: str) -> dict:
    cleaned = re.sub(r"```json|```", "", text).strip()
    try: return json.loads(cleaned)
    except Exception:
        m = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if m:
            try: return json.loads(m.group())
            except Exception: pass
    return {}

async def optimize(
    ad: AdAnalysis,
    page: PageAnalysis,
    gaps: GapReport,
) -> CROPlan:
    prompt = f"""Generate a precise CRO personalization plan.

AD ANALYSIS:
{ad.model_dump_json(indent=2)}

PAGE ANALYSIS:
{page.model_dump_json(indent=2)}

DETECTED GAPS (fix these):
{gaps.model_dump_json(indent=2)}

Return ONLY this JSON:
{{
  "suggestions": [
    {{
      "element": "h1|h2|cta|hero_copy|meta_description",
      "original": "current text on page",
      "replacement": "new text aligned to ad",
      "reason": "why this change improves conversion",
      "cro_principle": "message match|clarity|urgency|social proof|benefit focus"
    }}
  ],
  "personalization_banner": "1-line welcome message for ad visitors (max 80 chars)",
  "urgency_banner": "urgency line if ad had urgency, else empty string",
  "seo_title": "improved page title under 60 chars",
  "confidence_score": 0.87,
  "changes_summary": "2-3 sentence plain-english summary of what changed and why"
}}

Priority order: fix HIGH severity gaps first, then MEDIUM, then LOW.
Maximum 6 suggestions."""

    try:
        r = await client.chat.completions.create(
            model=settings.OPENAI_MODEL_TEXT,
            max_tokens=1500,
            temperature=0.25,
            messages=[
                {"role":"system","content":SYSTEM},
                {"role":"user","content":prompt},
            ],
        )
        d = _parse(r.choices[0].message.content or "")
        if not d:
            return CROPlan(changes_summary="Optimization failed.", confidence_score=0.4)

        suggestions = [CROSuggestion(**s) for s in d.get("suggestions",[]) if isinstance(s,dict)]
        return CROPlan(
            suggestions=suggestions,
            personalization_banner=d.get("personalization_banner","Welcome! This page was personalized for you."),
            urgency_banner=d.get("urgency_banner",""),
            seo_title=d.get("seo_title",""),
            confidence_score=float(d.get("confidence_score",0.7)),
            changes_summary=d.get("changes_summary",""),
        )
    except Exception as e:
        logger.error(f"cro_optimizer error: {e}")
        return CROPlan(changes_summary="Optimization failed.", confidence_score=0.4)